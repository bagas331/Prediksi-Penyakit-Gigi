You are a senior Machine Learning Engineer, Data Scientist, and AI Researcher.

Your task is to help me build a complete undergraduate thesis project:
"Dental Disease Detection from Image using CNN and YOLO-based Deep Learning"

Pertama Butkan file jupyter notebook bernama Dental_Disease_Detection.ipynb lalu load data dari kode ini :
"import os
import shutil
import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

# 1. SETUP PATH

source_path = '/content/drive/MyDrive/Data Citra Penyakit Gigi'
clean_path = '/content/dataset_bersih' # Kita buat folder kerja baru di Colab

print("--- Memulai Data Cleaning ---")

# Buat ulang folder bersih jika sudah ada sebelumnya

if os.path.exists(clean_path):
shutil.rmtree(clean_path)
os.makedirs(clean_path)

# Daftar folder yang valid untuk klasifikasi (Abaikan folder YOLO)

valid_folders = ['hypodontia', 'Tooth Discoloration', 'Mouth Ulcer', 'Gingivitis', 'Calculus', 'Data caries']

# 2. MENYALIN & MERAPIKAN DATA

for folder in valid_folders:
src_dir = os.path.join(source_path, folder)

    # Merapikan nama 'Data caries' menjadi 'Caries' agar seragam
    target_name = 'Caries' if folder == 'Data caries' else folder
    dst_dir = os.path.join(clean_path, target_name)

    if os.path.exists(src_dir):
        shutil.copytree(src_dir, dst_dir)
        print(f"✔️ Berhasil menyiapkan kelas: {target_name}")

print("\n--- Memulai Data Pipeline (Loading ke PyTorch) ---")

# 3. TRANSFORMASI DATA (Sesuai standar ResNet-18)

transformasi = transforms.Compose([
transforms.Resize((224, 224)),
transforms.ToTensor(),
transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 4. MEMUAT DATASET MENGGUNAKAN IMAGEFOLDER

# Di sinilah "variabel" gambar dan labelnya dibuat secara otomatis oleh PyTorch

full_dataset = datasets.ImageFolder(root=clean_path, transform=transformasi)

# Mari kita lihat bagaimana PyTorch memberikan index (variabel) pada folder Anda

class_names = full_dataset.classes
class_mapping = full_dataset.class_to_idx
print(f"\nMapping Kelas Otomatis: {class_mapping}")

# 5. MEMBAGI DATA (80% Train, 20% Validation)

total_data = len(full_dataset)
val_size = int(total_data \* 0.2)
train_size = total_data - val_size

train_dataset, val_dataset = random_split(
full_dataset, [train_size, val_size], generator=torch.Generator().manual_seed(42)
)

print(f"\nTotal Dataset Bersih: {total_data} gambar")
print(f"Data Latih (Train): {train_size} gambar")
print(f"Data Validasi (Val): {val_size} gambar")

# 6. BUNGKUS KE DALAM DATALOADER

# DataLoader ini yang akan kita 'feed' (umpan) ke dalam model ResNet-18 nanti

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=2)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2)

dataloaders = {'train': train_loader, 'val': val_loader}
dataset_sizes = {'train': train_size, 'val': val_size}

print("\n✅ TAHAP PIPELINE SELESAI. Data siap dilatih!")"

The system must:

- Accept dental images (intraoral photos or X-ray)
- Detect affected regions using YOLO
- Classify dental diseases using CNN
- Provide prediction results and interpretation
- Be deployable using Streamlit

You must produce:

1. Fully structured pipeline
2. Jupyter Notebook / Google Colab code
3. Markdown explanations (thesis-ready)
4. Visualization and evaluation
5. Deployment code (Streamlit)
6. Clear separation of each stage
7. Best practices in ML engineering

Write everything step-by-step and production-level.

Organize the project into the following pipeline:

1. Problem Definition
2. Literature Review (CNN, YOLO, Medical Imaging)
3. Dataset Understanding
4. Data Preprocessing
5. Data Augmentation
6. Exploratory Data Analysis (EDA)
7. Model Development:
   - CNN for classification
   - YOLO for object detection
8. Training Pipeline
9. Model Evaluation
10. Model Explainability (Grad-CAM or similar)
11. Integration (YOLO + CNN)
12. Deployment with Streamlit
13. Conclusion & Future Work

Dataset Handling

- Load dataset from folder
- Show sample images
- Show class distribution (bar chart)
- Check imbalance

Preprocessing

- Resize image
- Normalize pixel
- Train-test split

Data Augmentation

- Rotation
- Flip
- Zoom
- Brightness adjustment

EDA & Visualisasi

- Distribution of classes
- Sample images per class
- Image size distribution

MODEL
CNN (Classification)

- Build CNN architecture (or transfer learning: ResNet/MobileNet)
- Compile model
- Train model

YOLO (Detection)

- Use YOLOv5 or YOLOv8
- Prepare annotation format
- Train detection model

Training Pipeline

- Loss curve
- Accuracy curve
- Overfitting detection

Evaluation

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

Explainability (WAJIB)

- Grad-CAM visualization
- Highlight infected area

INTEGRASI MODEL
Pipeline:
Input Image → YOLO (detect region) → Crop → CNN (classify disease)

STREAMLIT APP
Features:

- Upload image
- Show detected area (YOLO)
- Show classification result
- Show confidence score
- Show explanation (Grad-CAM)

MARKDOWN (THESIS-READY)
Each section must include:

- Explanation
- Theory
- Methodology
- Result interpretation

OUTPUT FORMAT

- Use Jupyter Notebook format
- Separate code and markdown clearly
- Use clean, readable code
- Add comments for each step

EXTRA REQUIREMENTS (INI YANG BEDAIN LEVEL)

- Handle class imbalance
- Use early stopping
- Save best model
- Add model comparison (baseline vs improved)
- Provide conclusion based on metrics
