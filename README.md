# 🦷 Prediksi Penyakit Gigi (Dental Disease Prediction)

Aplikasi web untuk deteksi dan prediksi penyakit gigi menggunakan deep learning (CNN dan YOLO). Aplikasi ini dapat mengidentifikasi berbagai kondisi dental dari gambar untuk membantu diagnosis awal penyakit gigi.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red.svg)

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Struktur Proyek](#struktur-proyek)
- [API Documentation](#api-documentation)
- [Model Machine Learning](#model-machine-learning)
- [Dataset](#dataset)
- [Penyakit yang Dideteksi](#penyakit-yang-dideteksi)
- [Kontribusi](#kontribusi)

## ✨ Fitur

- 🤖 **Dual Model Detection**: Menggunakan CNN dan YOLOv8 untuk akurasi maksimal
- 📸 **Image Upload**: Unggah gambar gigi untuk analisis real-time
- 📊 **Detailed Analysis**: Laporan hasil prediksi dengan tingkat kepercayaan
- 💾 **Data Persistence**: Simpan hasil diagnosis menggunakan Prisma ORM
- 🌐 **Web Interface**: Interface user-friendly dengan Next.js + Tailwind CSS
- 🔄 **Ensemble Method**: Kombinasi hasil kedua model untuk prediksi lebih akurat
- 📈 **Model Evaluation**: Metrik performa model tersedia (accuracy, precision, recall)

## 🛠️ Teknologi

### Backend
- **FastAPI**: Framework web modern dengan auto-documentation
- **PyTorch**: Deep learning framework untuk CNN
- **Ultralytics YOLO**: YOLOv8 untuk object detection
- **Pillow**: Image processing
- **NumPy & Pandas**: Data processing
- **Scikit-learn**: Machine learning utilities

### Frontend
- **Next.js 14**: React framework dengan TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **React Query**: Data fetching dan caching
- **Prisma**: ORM untuk database

### Database
- **Prisma ORM**: Database abstraction layer

## 📦 Prasyarat

Pastikan sudah menginstall:
- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm atau yarn** - Biasanya sudah terinstall dengan Node.js
- **Git** - [Download](https://git-scm.com/)

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/bagas331/Prediksi-Penyakit-Gigi.git
cd Prediksi-Penyakit-Gigi
```

### 2. Setup Backend (Python)

```bash
# Buat virtual environment
python -m venv venv

# Aktivasi virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Setup Frontend (Node.js)

```bash
cd frontend

# Install dependencies
npm install
# atau
yarn install

# Setup database
npm run db:generate
npm run db:push
```

## 🏃 Cara Menjalankan

### Backend (FastAPI)

```bash
# Pastikan virtual environment aktif
python api.py
```

Backend akan berjalan di: `http://localhost:8000`

API Documentation (Swagger UI) tersedia di: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm start
```

Frontend akan berjalan di: `http://localhost:3000`

### Akses Aplikasi

1. Buka browser dan kunjungi: `http://localhost:3000`
2. Upload gambar gigi Anda
3. Sistem akan menganalisis dan memberikan prediksi penyakit
4. Lihat hasil diagnosis dengan rekomendasi treatment

## 📁 Struktur Proyek

```
Prediksi-Penyakit-Gigi/
├── api.py                          # FastAPI backend utama
├── app2.py                         # Aplikasi alternatif (Streamlit)
├── requirements.txt                # Python dependencies
├── README.md                       # Dokumentasi proyek
│
├── models/                         # Pre-trained models
│   ├── best_cnn.pth               # Trained CNN model
│   ├── best_yolo.pt               # Trained YOLO model
│   ├── class_mapping.json         # Mapping class indices
│   └── evaluation_metrics.json    # Model performance metrics
│
├── data/                          # Dataset mentah
│   ├── Calculus/                  # Data kalkulus gigi
│   ├── Data caries/               # Data gigi berlubang
│   ├── Gingivitis/                # Data radang gusi
│   ├── Healthy/                   # Data gigi sehat
│   ├── Hypodontia/                # Data gigi kurang
│   ├── Mouth Ulcer/               # Data borok mulut
│   ├── Tooth Discoloration/       # Data diskolorasi gigi
│   └── yolo annotated/            # Dataset dengan annotasi YOLO
│
├── dataset_bersih/                # Dataset yang sudah dibersihkan
│   ├── Calculus/
│   ├── Caries/
│   ├── Gingivitis/
│   ├── Healthy/
│   ├── Hypodontia/
│   ├── Mouth_Ulcer/
│   └── Tooth_Discoloration/
│
├── notebooks/                     # Jupyter notebooks
│   ├── Dental_Disease_Detection.ipynb  # Training notebook
│   └── yolov8n.pt                # Pre-trained YOLOv8 base model
│
├── outputs/                       # Output dan hasil training
│   ├── figures/                   # Visualization hasil
│   └── yolo_training/             # YOLO training outputs
│
└── frontend/                      # Next.js frontend
    ├── src/
    │   ├── app/                   # Next.js app router
    │   ├── components/            # React components
    │   ├── hooks/                 # Custom hooks
    │   └── lib/                   # Utilities
    ├── prisma/
    │   └── schema.prisma          # Database schema
    ├── public/
    │   ├── uploads/               # User uploads
    │   └── robots.txt
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── Caddyfile                  # Web server config
```

## 🔌 API Documentation

### Endpoints Utama

#### 1. Health Check
```
GET /health
```
Mengecek status API

#### 2. Predict Disease
```
POST /predict
Content-Type: multipart/form-data

Parameters:
- file: Image file (PNG, JPG, JPEG)
- use_ensemble: boolean (optional, default: true)

Response:
{
  "status": "success",
  "prediction": "Caries",
  "confidence": 0.95,
  "severity": "Tinggi",
  "description": "...",
  "treatment": "...",
  "model_used": "ensemble"
}
```

#### 3. Get Model Metrics
```
GET /metrics
```
Mendapatkan metrik performa model

#### 4. Get Disease Info
```
GET /disease-info/{disease_name}
```
Informasi lengkap tentang penyakit gigi tertentu

Dokumentasi lengkap tersedia di: `http://localhost:8000/docs`

## 🤖 Model Machine Learning

### CNN (Convolutional Neural Network)
- **Arsitektur**: Custom CNN atau Transfer Learning (ResNet, VGG, etc.)
- **Input**: Gambar gigi 224x224 pixels
- **Output**: Klasifikasi 7 kategori penyakit
- **File**: `models/best_cnn.pth`

### YOLOv8 (You Only Look Once)
- **Arsitektur**: YOLOv8 Nano
- **Purpose**: Object detection dan localization penyakit
- **File**: `models/best_yolo.pt`

### Ensemble Method
- Menggabungkan prediksi CNN dan YOLO
- Weighted voting untuk hasil optimal
- Confidence score rata-rata dari kedua model

## 📊 Dataset

### Penyakit yang Dideteksi

| No | Penyakit | Nama Lokal | Severity | Deskripsi |
|----|----------|-----------|----------|-----------|
| 1 | Calculus | Karang Gigi | Sedang | Penumpukan plak yang mengeras |
| 2 | Caries | Gigi Berlubang | Tinggi | Pembusukan gigi akibat bakteri |
| 3 | Gingivitis | Radang Gusi | Sedang | Peradangan pada gusi |
| 4 | Healthy | Gigi Sehat | Rendah | Kondisi gigi normal dan sehat |
| 5 | Hypodontia | Gigi Kurang | Tinggi | Gigi yang tidak tumbuh/kurang |
| 6 | Mouth Ulcer | Borok Mulut | Sedang | Luka terbuka di rongga mulut |
| 7 | Tooth Discoloration | Diskolorasi Gigi | Rendah | Perubahan warna gigi |

### Dataset Statistics
- **Total Samples**: 1000+ images
- **Training Set**: 70%
- **Validation Set**: 15%
- **Test Set**: 15%
- **Augmentation**: Dilakukan untuk balance class distribution

Dataset tersedia di folder `data/` dan `dataset_bersih/`

## 📈 Model Performance

Hasil evaluasi model tersedia di `models/evaluation_metrics.json`

Contoh format:
```json
{
  "accuracy": 0.92,
  "precision": 0.91,
  "recall": 0.90,
  "f1_score": 0.90,
  "class_distribution": {
    "Calculus": 0.88,
    "Caries": 0.94,
    "Gingivitis": 0.89,
    "Healthy": 0.95,
    "Hypodontia": 0.87,
    "Mouth_Ulcer": 0.88,
    "Tooth_Discoloration": 0.91
  }
}
```

## 🔐 Environment Variables

Buat file `.env.local` di folder `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
DATABASE_URL="your_database_url"
```

## 🛣️ Roadmap

- [ ] Integrasi dengan database untuk menyimpan history prediksi
- [ ] Feature untuk tracking progress penyakit
- [ ] API untuk export laporan diagnosis
- [ ] Mobile app version
- [ ] Real-time camera feed analysis
- [ ] Multi-language support
- [ ] User authentication dan profile

## 🐛 Troubleshooting

### Backend tidak bisa connect ke frontend
```bash
# Pastikan CORS di-set dengan benar di api.py
# Allow origins harus mencakup frontend URL
```

### Model loading error
```bash
# Pastikan model files ada di folder models/
# Download model jika diperlukan dari drive/cloud storage
```

### Database connection error
```bash
# Setup prisma schema
cd frontend
npm run db:generate
npm run db:push
```

## 📝 Lisensi

Proyek ini dibuat untuk keperluan penelitian/skripsi. 

## 👥 Kontribusi

Kontribusi sangat diterima! Untuk kontribusi:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📧 Kontak & Support

Jika ada pertanyaan atau issue, silakan:
- Buat GitHub Issue
- Hubungi maintainer di repository

## 📚 Referensi & Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyTorch Documentation](https://pytorch.org/)
- [Ultralytics YOLO](https://docs.ultralytics.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Dikembangkan dengan ❤️ untuk kesehatan gigi yang lebih baik**

*Last Updated: 2026-08-31*
