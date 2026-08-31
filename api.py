import os
import time
import uuid
import base64
import io
import json
import logging
from datetime import datetime
from PIL import Image
import numpy as np

import torch
import torchvision.transforms as transforms
import torchvision.models as models
from ultralytics import YOLO

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. SETUP LOGGING & APLIKASI
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Dental Diagnosis API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# 2. DEFINISI KELAS PENYAKIT (DISEASE_INFO)
DISEASE_INFO = {
    'Calculus': {
        'name': 'Kalkulus (Karang Gigi)',
        'severity': 'Sedang',
        'desc': 'Penumpukan plak yang mengeras pada gigi, dapat menyebabkan masalah gusi.',
        'treatment': 'Pembersihan karang gigi profesional (Scaling) ke dokter gigi.'
    },
    'Caries': {
        'name': 'Karies (Gigi Berlubang)',
        'severity': 'Tinggi',
        'desc': 'Kerusakan struktur gigi pada enamel atau dentin akibat asam bakteri.',
        'treatment': 'Perlu penambalan atau perawatan saluran akar jika sudah dalam.'
    },
    'Gingivitis': {
        'name': 'Gingivitis (Radang Gusi)',
        'severity': 'Sedang-Tinggi',
        'desc': 'Peradangan pada gusi yang menyebabkan kemerahan dan mudah berdarah.',
        'treatment': 'Pembersihan karang gigi, perbaikan kebersihan mulut sikat gigi teratur.'
    },
    'Healthy': {
        'name': 'Gigi Sehat',
        'severity': 'Normal',
        'desc': 'Tidak ada kelainan gigi atau gusi yang terdeteksi secara visual.',
        'treatment': 'Pertahankan perawatan: sikat 2x sehari dan kunjungan rutin setiap 6 bulan.'
    },
    'Hypodontia': {
        'name': 'Hipodontia',
        'severity': 'Struktural',
        'desc': 'Kehilangan gigi bawaan (kongenital) atau tidak berkembangnya gigi.',
        'treatment': 'Konsultasi dokter gigi spesialis ortodonti atau prostodonsi.'
    },
    'Mouth_Ulcer': {
        'name': 'Sariawan (Ulkus Mulut)',
        'severity': 'Rendah-Sedang',
        'desc': 'Luka kecil yang dangkal di dalam mulut atau di dasar gusi.',
        'treatment': 'Bisa sembuh sendiri (1-2 minggu). Gunakan obat kumur atau oles sariawan.'
    },
    'Tooth_Discoloration': {
        'name': 'Perubahan Warna Gigi',
        'severity': 'Estetik',
        'desc': 'Warna gigi menjadi kekuningan, kecoklatan, atau gelap dari aslinya.',
        'treatment': 'Prosedur pemutihan gigi profesional (Bleaching) oleh dokter gigi.'
    }
}

# 3. KELAS MODEL CNN (ResNet-18)
class DentalDentalDiseaseModel(torch.nn.Module):
    def __init__(self, num_classes=7):
        super(DentalDentalDiseaseModel, self).__init__()
        weights = models.ResNet18_Weights.DEFAULT
        self.model = models.resnet18(weights=weights)
        
        # Freezing layers
        for param in self.model.parameters():
            param.requires_grad = False
            
        for param in self.model.layer4.parameters():
            param.requires_grad = True

        num_ftrs = self.model.fc.in_features
        self.model.fc = torch.nn.Sequential(
            torch.nn.Dropout(0.3),
            torch.nn.Linear(num_ftrs, 256),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(256, num_classes)
        )

    def forward(self, x):
        return self.model(x)

# 4. INISIALISASI MODEL
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
YOLO_MODEL_PATH = os.path.join(MODEL_DIR, "best_yolo.pt")
CNN_MODEL_PATH = os.path.join(MODEL_DIR, "best_cnn.pth")
CLASS_MAP_PATH = os.path.join(MODEL_DIR, "class_mapping.json")

# Variable global untuk model
yolo_model = None
cnn_model = None
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

def load_class_mapping():
    if os.path.exists(CLASS_MAP_PATH):
        try:
            with open(CLASS_MAP_PATH, "r") as f:
                data = json.load(f)
                mapping = data.get("idx_to_class", data) # Handle nested or flat
                return {int(k): v for k, v in mapping.items() if k.isdigit()}
        except Exception as e:
            logger.error(f"Gagal memuat class mapping: {e}")
    return {0: "Calculus", 1: "Caries", 2: "Gingivitis", 3: "Healthy",
            4: "Hypodontia", 5: "Mouth_Ulcer", 6: "Tooth_Discoloration"}

idx_to_class = load_class_mapping()
CLASS_NAMES = [idx_to_class[i] for i in range(len(idx_to_class))]

cnn_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.on_event("startup")
def load_models():
    global yolo_model, cnn_model
    try:
        if os.path.exists(YOLO_MODEL_PATH):
            logger.info("Memuat model YOLOv8...")
            yolo_model = YOLO(YOLO_MODEL_PATH)
        else:
            logger.warning(f"File {YOLO_MODEL_PATH} tidak ditemukan.")
    except Exception as e:
        logger.error(f"Error loading YOLO: {e}")

    try:
        if os.path.exists(CNN_MODEL_PATH):
            logger.info("Memuat model ResNet-18...")
            model = DentalDentalDiseaseModel(num_classes=len(CLASS_NAMES))
            checkpoint = torch.load(CNN_MODEL_PATH, map_location=device)
            
            state_dict = checkpoint.get('model_state_dict', checkpoint) if isinstance(checkpoint, dict) else checkpoint
            
            # Check if keys start with 'model.' (api.py style)
            first_key = next(iter(state_dict))
            if first_key.startswith('model.'):
                model.load_state_dict(state_dict)
            else:
                # If keys are flat, load into model.model
                model.model.load_state_dict(state_dict)
            
            model.to(device)
            model.eval()
            cnn_model = model
        else:
            logger.warning(f"File {CNN_MODEL_PATH} tidak ditemukan.")
    except Exception as e:
        logger.error(f"Error loading CNN: {e}")

# 5. FUNGSI PREDIKSI
def get_cam(model, target_layer, input_tensor):
    try:
        gradients = []
        activations = []
        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0])
            return None
        def forward_hook(module, input, output):
            activations.append(output)
            return None
        
        handle_b = target_layer.register_full_backward_hook(backward_hook)
        handle_f = target_layer.register_forward_hook(forward_hook)

        output = model(input_tensor)
        target_class = output.argmax(dim=1).item()

        model.zero_grad()
        target = output[0, target_class]
        target.backward()

        handle_b.remove()
        handle_f.remove()

        if not gradients or not activations:
             return None

        grads = gradients[0].detach().cpu().numpy().squeeze()
        acts = activations[0].detach().cpu().numpy().squeeze()

        weights = np.mean(grads, axis=(1, 2))
        cam = np.zeros(acts.shape[1:], dtype=np.float32)

        for i, w in enumerate(weights):
             cam += w * acts[i, :, :]

        cam = np.maximum(cam, 0)
        import cv2
        cam = cv2.resize(cam, (224, 224))
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + 1e-8)
        return cam
    except Exception as e:
        logger.error(f"Grad-CAM error: {e}")
        return None

def predict_dental_disease(image: Image.Image, conf_threshold: float = 0.40):
    start_time = time.time()
    
    result = {
        'complication': {'is_multi_label': False},
        'yolo_detections': [],
        'cnn_probabilities': {},
        'gradcam_base64': None,
        'pipeline_mode': 'HYBRID',
        'error': None,
        'performance_metrics': {}
    }
    
    if cnn_model is None:
        result['error'] = "Model CNN tidak tersedia."
        return result

    try:
        import cv2
        img_rgb = image.convert('RGB')
        roi = img_rgb
        pipeline_mode = 'HYBRID'

        # --- Deteksi YOLO ---
        if yolo_model is not None:
            try:
                y_preds = yolo_model.predict(source=img_rgb, imgsz=640, conf=conf_threshold, verbose=False)
                
                boxes = y_preds[0].boxes
                if len(boxes) > 0:
                    for i in range(len(boxes)):
                        box = boxes.xyxy[i].cpu().numpy()
                        conf = float(boxes.conf[i].cpu().numpy())
                        cls_idx = int(boxes.cls[i].cpu().numpy())
                        
                        cls_name = "Unknown"
                        if hasattr(yolo_model.names, 'get'):
                            cls_name = yolo_model.names.get(cls_idx, f"Class_{cls_idx}")
                        elif isinstance(yolo_model.names, dict):
                            cls_name = yolo_model.names.get(cls_idx, f"Class_{cls_idx}")
                        elif isinstance(yolo_model.names, list) and cls_idx < len(yolo_model.names):
                            cls_name = yolo_model.names[cls_idx]
                            
                        # Capitalize properly to match DICTIONARY
                        cls_name = cls_name.capitalize() if cls_name.islower() else cls_name

                        # Normalisasi nama kelas YOLO agar sesuai dengan key klasifikasi CNN dan DIAGNOSIS_INFO
                        cn_lower = cls_name.lower().replace("_", " ")
                        if "discoloration" in cn_lower or "perubahan warna" in cn_lower:
                            cls_name = "Tooth_Discoloration"
                        elif "calculus" in cn_lower or "karang" in cn_lower:
                            cls_name = "Calculus"
                        elif "caries" in cn_lower or "karies" in cn_lower or "lubang" in cn_lower:
                            cls_name = "Caries"
                        elif "gingivitis" in cn_lower or "radang" in cn_lower:
                            cls_name = "Gingivitis"
                        elif "hypodontia" in cn_lower or "hipodontia" in cn_lower:
                            cls_name = "Hypodontia"
                        elif "ulcer" in cn_lower or "sariawan" in cn_lower:
                            cls_name = "Mouth_Ulcer"
                        elif "healthy" in cn_lower or "sehat" in cn_lower:
                            cls_name = "Healthy"

                        det_info = {
                            'class': cls_name,
                            'confidence': conf,
                            'bbox': [float(x) for x in box],  # x1, y1, x2, y2
                            'info': DISEASE_INFO.get(cls_name, {'name': cls_name, 'severity': 'Unknown', 'desc': '', 'treatment': ''})
                        }
                        result['yolo_detections'].append(det_info)
                        
                    best_idx = boxes.conf.argmax()
                    x1, y1, x2, y2 = boxes.xyxy[best_idx].cpu().numpy()
                    w, h = img_rgb.size
                    x1, y1 = max(0, int(x1)), max(0, int(y1))
                    x2, y2 = min(w, int(x2)), min(h, int(y2))
                    
                    if x2 > x1 and y2 > y1:
                        roi = img_rgb.crop((x1, y1, x2, y2))
                        pipeline_mode = 'HYBRID'
                    else:
                        roi = img_rgb
                else:
                    pipeline_mode = 'FALLBACK'
            except Exception as e:
                logger.error(f"YOLO error: {e}")
                pipeline_mode = 'FALLBACK'
        else:
            pipeline_mode = 'FALLBACK'

        result['pipeline_mode'] = pipeline_mode

        # --- Klasifikasi CNN ---
        input_tensor = cnn_transform(roi).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = cnn_model(input_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1).cpu().numpy()[0]
        
        # Validasi Confidence Threshold ResNet-18
        # Jika confidence tertinggi CNN < 55%, gambar dianggap tidak terdeteksi.
        max_prob = float(np.max(probs))
        validation_threshold = 0.60
        if max_prob < validation_threshold:
            result['error'] = f"Gambar tidak terdeteksi. Confidence model terlalu rendah ({max_prob*100:.1f}% < 60%). Harap unggah foto gigi yang lebih jelas."
            result['performance_metrics']['total_time'] = time.time() - start_time
            return result

        for i, class_name in enumerate(CLASS_NAMES):
            result['cnn_probabilities'][class_name] = float(probs[i])
            
        cnn_diagnoses = []
        for i, prob in enumerate(probs):
            if prob >= 0.15:
                cls_name = CLASS_NAMES[i]
                cnn_diagnoses.append({
                    'class': cls_name,
                    'confidence': float(prob),
                    'info': DISEASE_INFO.get(cls_name)
                })
                
        cnn_diagnoses.sort(key=lambda x: x['confidence'], reverse=True)
        if not cnn_diagnoses:
             pred_idx = int(np.argmax(probs))
             cls_name = CLASS_NAMES[pred_idx]
             cnn_diagnoses.append({
                 'class': cls_name,
                 'confidence': float(probs[pred_idx]),
                 'info': DISEASE_INFO.get(cls_name)
             })

        if len(cnn_diagnoses) > 1 and cnn_diagnoses[0]['class'] != 'Healthy':
             cnn_diagnoses = [d for d in cnn_diagnoses if d['class'] != 'Healthy' or d['confidence'] > 0.5]

        result['diagnosis'] = {
            'main': cnn_diagnoses[0],
            'all': cnn_diagnoses
        }
        
        cnn_classes = [d['class'] for d in cnn_diagnoses]
        yolo_classes = [d['class'] for d in result['yolo_detections']]
        unique_diseases = set(cnn_classes + yolo_classes) - {'Healthy'}
        
        if len(unique_diseases) > 1:
            result['complication']['is_multi_label'] = True
            result['complication']['diseases'] = list(unique_diseases)
            result['complication']['complication_text'] = f"Potensi komplikasi terdeteksi: {', '.join(unique_diseases)}."
            
        # --- Grad-CAM ---
        target_layer = cnn_model.model.layer4[-1]
        input_tensor.requires_grad_(True)
        cam = get_cam(cnn_model, target_layer, input_tensor)
        
        if cam is not None:
             roi_np = np.array(roi.resize((224, 224)))
             heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
             heatmap = np.float32(heatmap) / 255
             cam_img = heatmap + np.float32(roi_np) / 255
             cam_img = cam_img / np.max(cam_img)
             cam_uint8 = np.uint8(255 * cam_img)
             cam_pil = Image.fromarray(cv2.cvtColor(cam_uint8, cv2.COLOR_BGR2RGB))
             
             buffered = io.BytesIO()
             cam_pil.save(buffered, format="JPEG")
             img_str = base64.b64encode(buffered.getvalue()).decode()
             result['gradcam_base64'] = f"data:image/jpeg;base64,{img_str}"

        result['performance_metrics']['total_time'] = time.time() - start_time
        return result

    except Exception as e:
        logger.error(f"Prediction logic error: {e}")
        result['error'] = str(e)
        return result

# 6. ENDPOINTS API
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "models": {
            "yolo": yolo_model is not None,
            "cnn": cnn_model is not None
        }
    }

@app.post("/api/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        res = predict_dental_disease(image, conf_threshold=0.40)
        
        if res.get('error'):
             raise HTTPException(status_code=500, detail=res['error'])
             
        return res
    except Exception as e:
        logger.error(f"Error serving POST /api/predict: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
