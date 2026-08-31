"""
Dental Disease Detection — Streamlit App 2 (Improved)
Deteksi penyakit gigi otomatis menggunakan CNN (ResNet-18) + YOLO (v8)
Langsung berjalan di dalam Streamlit (tanpa backend FastAPI external).
"""
import os
import json
import base64
import io
import time
import logging
import sys
from datetime import datetime
from PIL import Image, ImageDraw
import numpy as np
import streamlit as st
import torch
import torch.nn as nn
from torchvision import transforms, models

# --- Optional imports dengan penanganan error ---
try:
    from ultralytics import YOLO
    HAS_YOLO = True
except ImportError:
    HAS_YOLO = False

try:
    from pytorch_grad_cam import GradCAM
    from pytorch_grad_cam.utils.image import show_cam_on_image
    from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
    HAS_GRADCAM = True
except ImportError:
    HAS_GRADCAM = False

# 1. KONFIGURASI HALAMAN
st.set_page_config(
    page_title="Dental Sanctuary AI",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================================
# 2. KONSTANTA DAN KONFIGURASI
# ============================================================================
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(ROOT_DIR, 'models')
CNN_MODEL_PATH = os.path.join(MODELS_DIR, 'best_cnn.pth')
YOLO_MODEL_PATH = os.path.join(MODELS_DIR, 'best_yolo.pt')
CLASS_MAP_PATH = os.path.join(MODELS_DIR, 'class_mapping.json')

# Direktori untuk gambar sampel (relatif terhadap ROOT_DIR)
SAMPLES_DIR = os.path.join(ROOT_DIR, 'sample_images')
SAMPLE_PATHS = {
    "Caries": os.path.join(SAMPLES_DIR, "caries_sample.jpg"),
    "Calculus": os.path.join(SAMPLES_DIR, "calculus_sample.jpg"),
    "Healthy": os.path.join(SAMPLES_DIR, "healthy_sample.jpg")
}

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# ============================================================================
# 2A. LOGGING DAN KONFIGURASI APLIKASI
# ============================================================================
# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Konstanta untuk validasi
MAX_IMAGE_SIZE_MB = 10
ALLOWED_IMAGE_FORMATS = {'jpg', 'jpeg', 'png'}
TIMEOUT_SECONDS = 60
MIN_IMAGE_DIMENSION = 100
MAX_IMAGE_DIMENSION = 4000

# Informasi penyakit
DISEASE_INFO = {
    'Calculus': {
        'name': 'Kalkulus (Karang Gigi)',
        'severity': 'Sedang',
        'desc': 'Penumpukan plak atau sisa makanan yang mengeras pada gigi, bisa menyebabkan penyakit gusi jika dibiarkan.',
        'treatment': 'Segera lakukan pembersihan karang gigi (Scaling) ke dokter gigi dan perbaiki cara sikat gigi.'
    },
    'Caries': {
        'name': 'Karies (Obat/Berlubang)',
        'severity': 'Tinggi',
        'desc': 'Struktur gigi yang rusak akibat bakteri yang menghasilkan asam dari plak, membentuk kavitas (lubang).',
        'treatment': 'Perawatan penambalan rongga atau perawatan saluran akar jika kerusakannya sudah dalam.'
    },
    'Gingivitis': {
        'name': 'Gingivitis (Radang Gusi)',
        'severity': 'Sedang-Tinggi',
        'desc': 'Tahap awal penyakit gusi yang ditandai dengan gusi kemerahan, bengkak, dan mudah berdarah.',
        'treatment': 'Pembersihan karang gigi profesional, perbaikan kebersihan mulut harian, dan obat kumur/antibiotik jika diresepkan.'
    },
    'Healthy': {
        'name': 'Gigi Sehat',
        'severity': 'Normal',
        'desc': 'Tidak terdeteksi adanya lesi, karang gigi, atau infeksi inflamasi melalui gambar klinis ini.',
        'treatment': 'Pertahankan perawatan harian: sikat gigi 2x sehari, menggunakan benang gigi (flossing), serta checkup berkala 6 bulan sekali.'
    },
    'Hypodontia': {
        'name': 'Hipodontia (Loss of Teeth)',
        'severity': 'Struktural / Genetika',
        'desc': 'Kondisi di mana pasien kehilangan satu hingga lima gigi bawaan dari garis gusi, yang dapat memengaruhi fungsi kunyah.',
        'treatment': 'Konsultasikan untuk penggunaan gigi tiruan, kawat gigi (ortodonti) atau implan gigi, untuk memperbaiki jarak dan oklusi rahang.'
    },
    'Mouth_Ulcer': {
        'name': 'Sariawan (Mouth Ulcer/Canker Sore)',
        'severity': 'Menengah-Rendah',
        'desc': 'Lecet kecil berbentuk bulat (kawah) yang sangat menyakitkan di jaringan lunak dalam mulut atau dasar gusi.',
        'treatment': 'Gunakan salep pereda nyeri sariawan, jaga mulut tetap bersih, hindari makanan yang mengiritasi (pedas/asam). Jika lebih dari 2 minggu tidak sembuh hubungi profesional.'
    },
    'Tooth_Discoloration': {
        'name': 'Perubahan Warna Gigi / Diskolorasi',
        'severity': 'Peringatan Estetik',
        'desc': 'Warna gigi menjadi kuning, kecoklatan atau gelap karena makanan, genetik, merokok, atau efek fluorosis.',
        'treatment': 'Konsultasi untuk prosedur pemutihan (Bleaching/Teeth Whitening), mengurangi makanan/minuman berpigmen tinggi.'
    }
}

# 3. FUNGSI UTILITAS DAN VALIDASI
def validate_image_file(uploaded_file) -> tuple[bool, str]:
    """Validasi file gambar yang di-upload."""
    try:
        # Check ukuran file
        file_size_mb = uploaded_file.size / (1024 * 1024)
        if file_size_mb > MAX_IMAGE_SIZE_MB:
            return False, f"File terlalu besar ({file_size_mb:.1f}MB). Maksimal {MAX_IMAGE_SIZE_MB}MB."
        
        # Check format
        file_ext = uploaded_file.name.split('.')[-1].lower()
        if file_ext not in ALLOWED_IMAGE_FORMATS:
            return False, f"Format file tidak didukung. Gunakan JPG atau PNG."
        
        # Check image dimensions
        img = Image.open(uploaded_file)
        w, h = img.size
        if w < MIN_IMAGE_DIMENSION or h < MIN_IMAGE_DIMENSION:
            return False, f"Gambar terlalu kecil ({w}x{h}). Minimal {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION}."
        if w > MAX_IMAGE_DIMENSION or h > MAX_IMAGE_DIMENSION:
            return False, f"Gambar terlalu besar ({w}x{h}). Maksimal {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION}."
        
        return True, "OK"
    except Exception as e:
        return False, f"Error validasi: {str(e)}"

def log_inference(model_name: str, time_taken: float, success: bool, error_msg: str = None):
    """Log information tentang inference."""
    if success:
        logger.info(f"{model_name} inference successful in {time_taken:.3f}s")
    else:
        logger.error(f"{model_name} inference failed in {time_taken:.3f}s: {error_msg}")

# ============================================================================
# 4. FUNGSI UNTUK MEMUAT MODEL (DENGAN CACHE DAN ERROR HANDLING)
# ============================================================================
@st.cache_resource
def load_class_mapping():
    """Memuat mapping index ke nama kelas."""
    try:
        if os.path.exists(CLASS_MAP_PATH):
            with open(CLASS_MAP_PATH, 'r') as f:
                cm = json.load(f)
            if 'idx_to_class' in cm:
                return {int(k): v for k, v in cm['idx_to_class'].items()}
            elif 'class_to_idx' in cm:
                return {v: k for k, v in cm['class_to_idx'].items()}
            else:
                return {int(v): k for k, v in cm.items()}
    except Exception as e:
        logger.error(f"Failed to load class mapping: {e}")
    
    # Fallback jika file tidak ada
    logger.warning("Using fallback class mapping")
    return {0: "Calculus", 1: "Caries", 2: "Gingivitis", 3: "Healthy",
            4: "Hypodontia", 5: "Mouth_Ulcer", 6: "Tooth_Discoloration"}

@st.cache_resource
def load_cnn_model(num_classes):
    """Memuat model CNN (ResNet-18) dengan bobot yang sudah dilatih."""
    try:
        if not os.path.exists(CNN_MODEL_PATH):
            logger.error(f"CNN model file not found: {CNN_MODEL_PATH}")
            return None

        model = models.resnet18(weights=None)
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
        
        checkpoint = torch.load(CNN_MODEL_PATH, map_location=device, weights_only=True)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)
        
        model = model.to(device)
        model.eval()
        logger.info(f"CNN model loaded successfully from {CNN_MODEL_PATH}")
        return model
    except Exception as e:
        logger.error(f"Failed to load CNN model: {e}")
        return None

@st.cache_resource
def load_yolo_model():
    """Memuat model YOLO jika tersedia."""
    try:
        if not HAS_YOLO:
            logger.warning("ultralytics library not installed")
            return None
        if not os.path.exists(YOLO_MODEL_PATH):
            logger.warning(f"YOLO model file not found: {YOLO_MODEL_PATH}")
            return None
        
        model = YOLO(YOLO_MODEL_PATH)
        logger.info(f"YOLO model loaded successfully from {YOLO_MODEL_PATH}")
        return model
    except Exception as e:
        logger.error(f"Failed to load YOLO model: {e}")
        return None

# ============================================================================
# 5. MEMUAT MODEL DAN KONFIGURASI
# ============================================================================
idx_to_class = load_class_mapping()
num_classes = len(idx_to_class)
cnn_model = load_cnn_model(num_classes)
yolo_model = load_yolo_model()

# Flag untuk mengecek kesehatan model
MODEL_HEALTHY = cnn_model is not None

# Transformasi untuk CNN
cnn_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# ============================================================================
# 6. FUNGSI PREDIKSI UTAMA (DENGAN ERROR HANDLING LENGKAP & PERFORMANCE TRACKING)
# ============================================================================
def predict_dental_disease(image, conf_threshold=0.25, mode="HYBRID"):
    """
    Melakukan prediksi penyakit gigi menggunakan pipeline hybrid YOLO + CNN.
    Mengembalikan dictionary berisi hasil prediksi dengan performance metrics.
    """
    start_time = time.time()
    
    result = {
        'complication': {'is_multi_label': False},
        'yolo_detections': [],
        'cnn_probabilities': {},
        'gradcam_base64': None,
        'pipeline_mode': mode if mode != "HYBRID" else "FALLBACK",
        'error': None,
        'performance_metrics': {}
    }
    
    # Check model availability
    if cnn_model is None and mode in ["HYBRID", "CNN"]:
        result['error'] = "Model CNN tidak tersedia. Silakan restart aplikasi."
        logger.error("CNN model is None during prediction")
        return result

    try:
        img_rgb = image.convert('RGB')
        roi = img_rgb
        pipeline_mode = mode if mode != "HYBRID" else "FALLBACK"
        yolo_start = time.time()

        # --- Deteksi YOLO ---
        if yolo_model is not None and mode in ["HYBRID", "YOLO"]:
            try:
                y_preds = yolo_model.predict(source=img_rgb, imgsz=640, conf=conf_threshold, verbose=False)
                yolo_time = time.time() - yolo_start
                result['performance_metrics']['yolo_time'] = yolo_time
                
                boxes = y_preds[0].boxes
                if len(boxes) > 0:
                    yolo_diagnoses = []
                    # Simpan semua deteksi
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        cls_name = y_preds[0].names.get(cls_id, f"cls_{cls_id}")
                        
                        det_info = {
                            'class': cls_name,
                            'confidence': conf,
                            'bbox': [float(x1), float(y1), float(x2), float(y2)],
                            'info': DISEASE_INFO.get(cls_name, {'name': cls_name, 'severity': 'Unknown', 'desc': '', 'treatment': ''})
                        }
                        result['yolo_detections'].append(det_info)
                        
                        # Tambahkan ke daftar diagnosa unik untuk ringkasan
                        if cls_name not in [d['class'] for d in yolo_diagnoses]:
                            yolo_diagnoses.append(det_info)

                    # Ambil deteksi dengan confidence tertinggi untuk crop
                    best_idx = boxes.conf.argmax()
                    best_box = boxes.xyxy[best_idx].cpu().numpy()
                    
                    x1, y1, x2, y2 = best_box
                    # Pastikan koordinat dalam batas gambar
                    w, h = img_rgb.size
                    x1 = max(0, int(x1))
                    y1 = max(0, int(y1))
                    x2 = min(w, int(x2))
                    y2 = min(h, int(y2))
                    if x2 > x1 and y2 > y1:
                        roi = img_rgb.crop((x1, y1, x2, y2))
                        pipeline_mode = 'HYBRID'
                    else:
                        roi = img_rgb

                    result['complication']['is_multi_label'] = len(yolo_diagnoses) > 1
                    result['complication']['yolo_diagnoses'] = yolo_diagnoses
                    
                    # Teks komplikasi ringkasan
                    if len(yolo_diagnoses) > 1:
                        names = [d['info']['name'] for d in yolo_diagnoses]
                        result['complication']['complication_text'] = f"Beberapa kondisi terdeteksi: {', '.join(names)}."
                    else:
                        result['complication']['complication_text'] = f"Potensi {yolo_diagnoses[0]['info']['name']} terdeteksi."
                
                log_inference("YOLO", yolo_time, True)
            except Exception as e:
                result['error'] = f"YOLO inference error: {e}"
                log_inference("YOLO", time.time() - yolo_start, False, str(e))
                logger.warning(f"YOLO error, continuing with CNN only: {e}")

            result['pipeline_mode'] = pipeline_mode

        if mode == "YOLO":
            result['performance_metrics']['total_time'] = time.time() - start_time
            return result

        # --- Klasifikasi CNN ---
        cnn_start = time.time()
        input_tensor = cnn_transform(roi).unsqueeze(0).to(device)
        with torch.no_grad():
            output = cnn_model(input_tensor)
            probs = torch.softmax(output, dim=1).squeeze().cpu().numpy()
            conf = float(np.max(probs))
            pred_idx = int(np.argmax(probs))
        
        cnn_time = time.time() - cnn_start
        result['performance_metrics']['cnn_time'] = cnn_time
        log_inference("CNN", cnn_time, True)

        # TAMBAHAN: Validasi Out-of-Distribution (Bukan Gigi)
        # Jika YOLO tidak menemukan objek sama sekali DAN CNN confidence rendah, tolak gambar.
        # Bisa disesuaikan threshold-nya (misalnya 0.50 atau 50%)
        # Untuk implementasi yang lebih agresif, kita bisa langsung menolak jika FALLBACK dan conf < 0.70
        validation_threshold = 0.55
        if pipeline_mode == "FALLBACK" and conf < validation_threshold:
            result['error'] = f"Gambar tidak valid. Model tidak mendeteksi objek gigi (Confidence CNN terlalu rendah: {conf*100:.1f}%). Harap unggah foto gigi yang jelas."
            result['performance_metrics']['total_time'] = time.time() - start_time
            return result

        # Temukan semua kelas dengan probabilitas di atas threshold (misal 20%)
        # Ambil argmax dulu untuk memastikan setidaknya satu hasil
        pred_idx = int(np.argmax(probs))
        cnn_threshold = 0.20
        
        cnn_diagnoses = []
        for i, p in enumerate(probs):
            cname = idx_to_class.get(i, f"class_{i}")
            result['cnn_probabilities'][cname] = float(p)
            
            # Jika probabilitas di atas threshold atau merupakan prediksi utama
            if p >= cnn_threshold or i == pred_idx:
                # Jangan masukkan "Healthy" jika ada penyakit lain yang terdeteksi dengan prob > threshold
                # Tapi jika "Healthy" adalah top prediction, tetap masukkan.
                cnn_diagnoses.append({
                    'class': cname,
                    'confidence': float(p),
                    'info': DISEASE_INFO.get(cname, {'name': cname, 'severity': 'Unknown', 'desc': '', 'treatment': ''})
                })

        # Urutkan berdasarkan confidence
        cnn_diagnoses.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Jika ada beberapa diagnosa, dan yang utama bukan healthy, hapus healthy dari list jika ada di bawah threshold
        if len(cnn_diagnoses) > 1 and cnn_diagnoses[0]['class'] != 'Healthy':
             cnn_diagnoses = [d for d in cnn_diagnoses if d['class'] != 'Healthy' or d['confidence'] > 0.5]

        result['diagnosis'] = {
            'main': cnn_diagnoses[0],
            'all': cnn_diagnoses
        }
        
        # Update is_multi_label jika CNN juga menemukan beberapa
        if len(cnn_diagnoses) > 1:
            result['complication']['is_multi_label'] = True

        # --- Grad-CAM ---
        if HAS_GRADCAM and cnn_model is not None:
            try:
                gradcam_start = time.time()
                target_layer = cnn_model.layer4[-1]
                cam = GradCAM(model=cnn_model, target_layers=[target_layer])
                targets = [ClassifierOutputTarget(pred_idx)]
                grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0, :]

                roi_resized = roi.resize((224, 224))
                rgb_img = np.float32(roi_resized) / 255.0
                cam_image = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

                cam_pil = Image.fromarray(cam_image)
                buffered = io.BytesIO()
                cam_pil.save(buffered, format="JPEG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                result['gradcam_base64'] = f"data:image/jpeg;base64,{img_str}"
                result['performance_metrics']['gradcam_time'] = time.time() - gradcam_start
            except Exception as e:
                result['gradcam_error'] = str(e)
                logger.warning(f"Grad-CAM generation failed: {e}")
        
        # Total inference time
        result['performance_metrics']['total_time'] = time.time() - start_time
        return result
        
    except Exception as e:
        result['error'] = f"Inference error: {str(e)}"
        log_inference("TOTAL", time.time() - start_time, False, str(e))
        logger.error(f"Prediction failed: {e}", exc_info=True)
        return result

# ============================================================================
# 6. FUNGSI BANTUAN UNTUK UI
# ============================================================================
def display_image_with_boxes(image, detections):
    """Menampilkan gambar dengan bounding box YOLO."""
    if not detections:
        return image
    display_img = image.copy()
    draw = ImageDraw.Draw(display_img)
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        conf = det['confidence']
        label = f"{det['class']} ({conf:.0%})"
        draw.rectangle([x1, y1, x2, y2], outline="lime", width=3)
        # Hitung posisi teks
        text_w = len(label) * 7
        text_h = 14
        by_txt = y1 - text_h if y1 - text_h > 0 else y1 + 2
        draw.rectangle([x1, by_txt, x1 + text_w, by_txt + text_h], fill="black")
        draw.text((x1 + 2, by_txt), label, fill="lime")
    return display_img

def generate_report(diagnosis, yolo_diagnoses, probas, filename=None):
    """Membuat laporan teks untuk diunduh."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = [
        "LAPORAN DIAGNOSIS DENTAL AI",
        "=" * 40,
        f"Tanggal: {now}",
        f"File: {filename or 'Tidak diketahui'}",
        "",
        "HASIL MASUKAN CNN (RESNET-18):",
        "-" * 30
    ]
    
    for d in diagnosis.get('all', []):
        lines.append(f"  Diagnosa: {d['info']['name']}")
        lines.append(f"  Confidence: {d['confidence']*100:.1f}%")
        lines.append(f"  Tingkat Keparahan: {d['info']['severity']}")
        lines.append(f"  Deskripsi: {d['info']['desc']}")
        lines.append(f"  Rekomendasi: {d['info']['treatment']}")
        lines.append("")

    if yolo_diagnoses:
        lines.append("TEMUAN LOKALISASI YOLOv8:")
        lines.append("-" * 30)
        for d in yolo_diagnoses:
            lines.append(f"  Lokasi: {d['info']['name']}")
            lines.append(f"  Confidence: {d['confidence']*100:.1f}%")
            lines.append(f"  Tingkat Keparahan: {d['info']['severity']}")
            lines.append("")
    
    lines.append("PROBABILITAS CNN LENGKAP:")
    for cls, prob in sorted(probas.items(), key=lambda x: x[1], reverse=True):
        lines.append(f"  {cls}: {prob*100:.1f}%")
    return "\n".join(lines)

# ============================================================================
# 7. TAMPILAN UTAMA STREAMLIT
# ============================================================================
st.title("Dental Sanctuary AI")
st.subheader("Senyum Sehat, Presisi Klinis Terbaik.")
st.markdown("""
Aplikasi ini menggunakan **Machine Learning** (YOLOv8 + ResNet-18) untuk mendeteksi penyakit gigi secara otomatis.
Dukungan sistem hybrid memastikan lokalisasi area yang bermasalah sebelum diklasifikasi.
**(Versi Direct Inference - Tanpa Backend REST API)**
""")

st.divider()

# --- Status Model di Sidebar ---
with st.sidebar:
    st.header("Status Model")
    if cnn_model is not None:
        st.success("Model CNN (ResNet-18) Aktif")
    else:
        st.error("Model CNN Gagal Dimuat")
    if yolo_model is not None:
        st.success("Model YOLOv8 Aktif")
    elif not HAS_YOLO:
        st.error("Model YOLO Gagal: 'ultralytics' tidak terinstal.")
    else:
        st.error("Model YOLO Gagal: File 'best_yolo.pt' tidak ditemukan.")
    st.divider()
    # Slider untuk threshold YOLO
    yolo_threshold = st.slider(
        "Confidence threshold YOLO",
        min_value=0.0, max_value=1.0, value=0.25, step=0.05,
        help="Semakin rendah, semakin banyak objek terdeteksi (tapi mungkin false positive)."
    )
    st.divider()
    st.info("Catatan: Grad-CAM hanya tersedia jika 'pytorch_grad_cam' terinstal.")

st.divider()

# --- Galeri Sampel ---
st.markdown("### Coba Cepat dengan Gambar Sampel")
st.write("Klik salah satu gambar di bawah ini untuk mengujinya langsung ke sistem.")

# Periksa ketersediaan file sampel
sample_available = {}
for name, path in SAMPLE_PATHS.items():
    sample_available[name] = os.path.exists(path)

if any(sample_available.values()):
    cols = st.columns(3)
    for i, (name, path) in enumerate(SAMPLE_PATHS.items()):
        with cols[i]:
            if sample_available[name]:
                try:
                    img = Image.open(path).convert('RGB')
                    st.image(img, caption=name, use_container_width=True)
                    if st.button(f"Uji {name}", key=f"sample_{name}", use_container_width=True):
                        st.session_state.sample_image = img
                        st.rerun()
                except Exception as e:
                    st.warning(f"Gagal memuat sampel {name}: {e}")
            else:
                st.warning(f"Sampel {name} tidak ditemukan.")
else:
    st.warning("Tidak ada gambar sampel yang tersedia. Silakan upload gambar Anda sendiri.")

st.divider()

# --- Area Upload dan Prediksi ---
st.markdown("<h2 style='text-align: center;'>Mulai Konsultasi AI Sekarang</h2>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center;'>Unggah foto klinis gigi Anda di bawah ini untuk didiagnosis oleh AI Engine (Direct Inference).</p>", unsafe_allow_html=True)

# Inisialisasi session state
if 'sample_image' not in st.session_state:
    st.session_state.sample_image = None
if 'uploader_key' not in st.session_state:
    st.session_state.uploader_key = 0

# Kolom utama untuk upload
col_pad1, col_center, col_pad2 = st.columns([1, 10, 1])
with col_center:
    uploaded_files = st.file_uploader(
        "Upload foto klinis gigi (JPG, PNG) - Bisa Pilih Lebih Dari Satu",
        type=['jpg', 'jpeg', 'png'],
        accept_multiple_files=True,
        key=f"dental_upload_{st.session_state.uploader_key}"
    )

    # Kumpulkan gambar yang akan diproses
    active_images = []
    if uploaded_files:
        # Validasi setiap file
        for f in uploaded_files:
            try:
                img = Image.open(f).convert('RGB')
                active_images.append(img)
            except Exception as e:
                st.error(f"File {f.name} tidak valid: {e}")
        st.session_state.sample_image = None
    elif st.session_state.sample_image is not None:
        active_images.append(st.session_state.sample_image)

    # Proses gambar
    if active_images:
        # Tentukan apakah perlu tab (jika lebih dari satu gambar)
        if len(active_images) > 1:
            tabs = st.tabs([f"Foto {i+1}" for i in range(len(active_images))])
        else:
            tabs = [st.container()]  # untuk satu gambar, tidak perlu tab

        def render_result(img, result, idx, key_postfix, original_fname):
            diag = result.get('diagnosis', {'main': None, 'all': []})
            cnn_all = diag.get('all', [])
            detections = result.get('yolo_detections', [])
            comp_data = result.get('complication', {})
            is_multi_label = comp_data.get('is_multi_label', False)
            yolo_diagnoses = comp_data.get('yolo_diagnoses', [])
            comp_text = comp_data.get('complication_text', '')
            pipeline_mode = result.get('pipeline_mode', 'FALLBACK')
            gradcam_b64 = result.get('gradcam_base64', None)

            if result.get('error'):
                st.error(f"Gagal memproses: {result['error']}")
                return

            col_img, col_res = st.columns([1, 1.2])
            with col_img:
                if detections:
                    display_img = display_image_with_boxes(img, detections)
                    st.image(display_img, caption=f"Foto #{idx+1} (Deteksi YOLO)", use_container_width=True)
                else:
                    st.image(img, caption=f"Foto #{idx+1}", use_container_width=True)
                st.success(f"Mode Aktual: {pipeline_mode}")

            with col_res:
                if pipeline_mode in ["HYBRID", "CNN", "FALLBACK"]:
                    st.markdown("#### Diagnosis Utama (CNN - ResNet-18)")
                    if not cnn_all:
                        st.info("CNN tidak mendeteksi penyakit dengan probabilitas cukup tinggi.")
                    for i, d in enumerate(cnn_all):
                        info = d['info']
                        msg_type = st.success if d['class'] == 'Healthy' else st.warning
                        msg_type(f"Hasil {i+1}: **{info['name']}**")
                        c1, c2 = st.columns(2)
                        c1.metric("Confidence CNN", f"{d['confidence']*100:.1f}%")
                        c2.metric("Tingkat Keparahan", info['severity'])
                        st.markdown(f"**Deskripsi:** {info['desc']}")
                        st.info(f"**Saran:** {info['treatment']}")
                        if i < len(cnn_all)-1: st.divider()

                if pipeline_mode in ["HYBRID", "YOLO"] and yolo_diagnoses:
                    st.divider()
                    st.markdown("#### Temuan Lokalisasi (YOLO - Object Detection)")
                    for i, d in enumerate(yolo_diagnoses):
                        y_info = d['info']
                        st.warning(f"Lokalisasi {i+1}: **{y_info['name']}**")
                        cy1, cy2 = st.columns(2)
                        cy1.metric("Confidence YOLO", f"{d['confidence']*100:.1f}%")
                        cy2.metric("Tingkat Keparahan", y_info['severity'])
                        if i < len(yolo_diagnoses)-1: st.divider()
                    if comp_text and pipeline_mode == "HYBRID":
                        st.error(f"Potensi Komplikasi: {comp_text}")

            cb1, cb2 = st.columns(2)
            with cb1:
                if st.button("Kosongkan Gambar", key=f"rs_{key_postfix}_{idx}", use_container_width=True):
                    st.session_state.sample_image = None
                    st.session_state.uploader_key += 1
                    st.rerun()
            with cb2:
                report = generate_report(diag, yolo_diagnoses, result.get('cnn_probabilities', {}), original_fname)
                st.download_button("Download Laporan", data=report, file_name=f"lap_{key_postfix}_{idx}.txt", key=f"dl_{key_postfix}_{idx}", use_container_width=True)

            with st.expander("Detail Teknis / Metrik AI"):
                if pipeline_mode in ["HYBRID", "CNN", "FALLBACK"] and result.get('cnn_probabilities'):
                    st.markdown("**Spektrum Probabilitas CNN:**")
                    for cname, pval in sorted(result['cnn_probabilities'].items(), key=lambda x:x[1], reverse=True):
                        st.write(f"{cname}: {pval*100:.1f}%")
                        st.progress(pval, text="")
                    if gradcam_b64:
                        st.image(gradcam_b64, caption="Heatmap Aktivasi ResNet-18", use_container_width=True)
                
                if pipeline_mode in ["HYBRID", "YOLO"] and detections:
                    st.markdown("**Metrik Lanjutan YOLOv8:**")
                    for k, det in enumerate(detections):
                        x1, y1, x2, y2 = det['bbox']
                        st.write(f"**Objek {k+1}: {det['class']}** - {det['confidence']*100:.1f}%")
                        st.code(f"Bounding Box (x1, y1, x2, y2): [{int(x1)}, {int(y1)}, {int(x2)}, {int(y2)}]")

        for idx, (img, tab_main) in enumerate(zip(active_images, tabs)):
            with tab_main:
                original_fname = uploaded_files[idx].name if uploaded_files and idx < len(uploaded_files) else None
                tab_hybrid, tab_yolo, tab_cnn = st.tabs(["🧬 Hybrid (YOLO + ResNet)", "👁️ Hanya YOLOv8", "🧠 Hanya ResNet-18"])
                
                with tab_hybrid:
                    with st.spinner(f"Memproses Hybrid..."):
                        res_hybrid = predict_dental_disease(img, conf_threshold=yolo_threshold, mode="HYBRID")
                    render_result(img, res_hybrid, idx, "hybrid", original_fname)
                    
                with tab_yolo:
                    with st.spinner(f"Memproses YOLOv8..."):
                        res_yolo = predict_dental_disease(img, conf_threshold=yolo_threshold, mode="YOLO")
                    render_result(img, res_yolo, idx, "yolo", original_fname)
                    
                with tab_cnn:
                    with st.spinner(f"Memproses ResNet-18..."):
                        res_cnn = predict_dental_disease(img, conf_threshold=yolo_threshold, mode="CNN")
                    render_result(img, res_cnn, idx, "cnn", original_fname)

    else:
        st.info("Belum ada gambar yang dipilih. Upload gambar atau pilih sampel di atas.")

if __name__ == "__main__":
    pass
