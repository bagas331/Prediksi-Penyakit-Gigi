"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UploadCloud,
  Camera,
  CameraOff,
  SwitchCamera,
  CircleDot,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  FileImage,
  ShieldAlert,
  Cpu,
  Download,
  XCircle,
  ArrowLeft,
  Heart,
  CheckCircle2,
  Sparkles,
  Brain,
  Eye,
  ChevronDown,
  Activity,
  Zap,
  Shield,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/* ── Diagnosis Knowledge Base ── */
const DIAGNOSIS_INFO: Record<
  string,
  { name: string; severity: string; desc: string; tx: string; color: string }
> = {
  Calculus: {
    name: "Kalkulus (Karang Gigi)",
    severity: "Sedang",
    desc: "Terjadi karena plak gigi yang tidak dibersihkan sehingga menumpuk dan mengeras di permukaan gigi. Plak ini berasal dari sisa makanan yang bercampur dengan bakteri dan air liur di mulut.",
    tx: "Lakukan pembersihan profesional di dokter gigi melalui tindakan scaling karena karang yang sudah mengeras tidak bisa hilang dengan sikat gigi biasa.",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  Caries: {
    name: "Karies (Berlubang)",
    severity: "Tinggi",
    desc: "Terjadi karena lapisan terluar gigi (enamel) rusak oleh asam yang dihasilkan bakteri dari sisa makanan manis dan bertepung yang menempel sebagai plak di gigi.",
    tx: "Untuk lubang kecil, dokter bisa melakukan perawatan fluoride yang dioleskan ke gigi agar enamel menguat dan proses berlubang melambat. Jika lubang sudah terlihat, biasanya gigi harus dibersihkan lalu ditambal agar tidak makin besar dan tidak sakit lagi. Pada kasus lebih parah, dokter bisa menyarankan pemasangan crown (mahkota gigi) atau perawatan saluran akar, dan bila gigi sudah tidak bisa diselamatkan baru dipertimbangkan pencabutan",
    color: "text-red-600 bg-red-50 border-red-200",
  },
  Gingivitis: {
    name: "Gingivitis (Radang Gusi)",
    severity: "Sedang-Tinggi",
    desc: "Ini disebabkan oleh penumpukan plak di tepi gusi, yaitu lapisan lengket berisi bakteri dan sisa makanan yang tidak dibersihkan dengan baik saat menyikat gigi. Plak yang dibiarkan akan mengeras menjadi karang gigi, bakteri di dalamnya mengiritasi jaringan gusi sehingga gusi menjadi merah, bengkak, dan mudah berdarah.",
    tx: "Lakukan perawatan ke dokter gigi dan perbaikan kebersihan mulut di rumah. Dokter gigi biasanya akan membersihkan plak dan karang gigi (scaling) serta memperbaiki gigi yang berlubang atau tidak rapi bila itu ikut memicu iritasi gusi. Hindari merokok, kurangi makanan/minuman manis atau terlalu panas/keras, dan perbanyak air putih agar produksi air liur baik sehingga bakteri lebih terkendali.",
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  Healthy: {
    name: "Gigi Sehat",
    severity: "Normal",
    desc: "Gigi Normal, Tidak ada lesi terdeteksi.",
    tx: "Pertahankan sikat gigi 2 kali sehari (setelah sarapan dan sebelum tidur) selama ±2 menit sambil juga membersihkan lidah. Gunakan benang gigi sekali sehari dan boleh ditambah obat kumur antiseptik (sebaiknya tanpa alkohol) untuk membersihkan sela gigi dan menurunkan jumlah bakteri. Batasi makanan/minuman manis atau lengket, perbanyak buah, sayur, dan air putih, serta hindari merokok agar gigi dan gusi tetap kuat.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  Hypodontia: {
    name: "Hipodontia",
    severity: "Struktural",
    desc: "Faktor genetik atau keturunan, yaitu adanya mutasi pada gen yang mengatur pembentukan gigi sehingga sebagian gigi gagal terbentuk. Kondisi ini juga dapat berkaitan dengan kelainan bawaan atau sindrom tertentu, misalnya displasia ektodermal, Down syndrome, bibir dan langit‑langit sumbing, serta gangguan saat janin dalam kandungan (infeksi, kekurangan gizi, atau paparan obat tertentu) yang mengganggu perkembangan gigi.",
    tx: "Hipodontia tidak bisa “disembuhkan” jadi solusinya adalah mengganti atau menutup celah gigi yang hilang dan merapikan susunannya. Dokter gigi dapat merencanakan perawatan seperti kawat gigi untuk merapatkan jarak gigi yang renggang, mempertahankan dan membentuk ulang gigi susu agar tampak seperti gigi permanen, atau memasang gigi tiruan (denture, bridge, maupun implan) agar fungsi mengunyah dan penampilan tetap baik. Pemeriksaan sejak dini penting supaya rencana perawatan (ortodonti + gigi palsu/implan) bisa diatur sesuai usia, kondisi tulang rahang, dan jumlah gigi yang hilang..",
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  Mouth_Ulcer: {
    name: "Sariawan",
    severity: "Menengah-Rendah",
    desc: "Muncul karena lapisan dalam mulut (mukosa) iritasi atau meradang, misalnya karena tergigit, tersikat terlalu keras, kawat gigi, atau tepi gigi/tambalan yang tajam sehingga melukai jaringan. Kondisi ini lebih mudah terjadi bila tubuh sedang lelah atau stres, kekurangan nutrisi tertentu (vitamin B kompleks, zat besi, folat, zinc), imunitas menurun, perubahan hormon, infeksi virus/jamur, atau adanya penyakit sistemik seperti penyakit celiac, Crohn, dan gangguan autoimun.",
    tx: "Sariawan dapat diringankan dengan berkumur air garam hangat, menjaga kebersihan mulut, menghindari makanan pedas/asam/terlalu panas yang memperih, cukup minum air, dan bila perlu memakai obat oles atau obat kumur khusus sariawan sesuai anjuran dokter atau petunjuk kemasan. Jika sariawan sangat besar, sangat sering kambuh, atau tidak sembuh lebih dari 2 minggu, perlu diperiksakan ke dokter untuk mencari penyebab lain yang lebih serius.",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  Tooth_Discoloration: {
    name: "Perubahan Warna",
    severity: "Estetik",
    desc: "Terjadi karena faktor luar dan dalam gigi. Faktor luar misalnya kebiasaan minum kopi, teh, soda, anggur merah, makan makanan berpigmen kuat, merokok (nikotin dan tar), serta kebersihan mulut yang kurang sehingga plak dan karang menumpuk dan membuat gigi tampak kuning atau kecokelatan. Faktor dalam meliputi penipisan enamel karena usia, karies, trauma gigi, kelainan bawaan enamel/dentin, penggunaan obat tertentu (misalnya tetrasiklin saat masa pertumbuhan gigi), penyakit sistemik, dan kelebihan fluoride (fluorosis) yang menimbulkan bercak putih atau coklat..",
    tx: "Untuk noda di permukaan gigi dapat dilakukan pembersihan profesional (scaling dan polishing) dan jika perlu pemutihan gigi (bleaching) di bawah pengawasan dokter gigi. Di rumah, jaga kebersihan mulut dengan sikat gigi dan flossing teratur, batasi kopi/teh/soda dan makanan berwarna pekat, serta berhenti merokok agar noda baru tidak mudah terbentuk. Untuk perubahan warna yang berat atau karena kerusakan struktur gigi (misalnya gigi hitam, fluorosis berat, atau kerusakan pasca trauma), dokter bisa menyarankan veneer, mahkota (crown), atau perawatan saluran akar sebelum restorasi estetik.",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
};

type SessionStatus = "idle" | "loading" | "success" | "error";

interface DiagnosisResult {
  diagnosis: {
    main: {
      class: string;
      confidence: number;
      info?: { name: string; severity: string; desc: string; tx: string };
    };
    all: Array<{
      class: string;
      confidence: number;
      info: { name: string; severity: string; desc: string; tx: string };
    }>;
  };
  yolo_detections: Array<{
    class: string;
    confidence: number;
    bbox?: [number, number, number, number];
    info?: { name: string; severity: string };
  }>;
  cnn_probabilities: Record<string, number>;
  gradcam_base64: string;
  complication?: {
    is_multi_label: boolean;
    complication_text: string;
  };
}

interface Session {
  id: string;
  file: File;
  url: string;
  status: SessionStatus;
  result: DiagnosisResult | null;
  error: string;
  patientName: string;
  imageDimensions?: { width: number; height: number };
}

function getSeverityBadgeVariant(
  severity: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "Tinggi" || severity === "Sedang-Tinggi")
    return "destructive";
  if (severity === "Normal") return "default";
  return "secondary";
}

export default function DiagnosisPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [globalError, setGlobalError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  /* ── File handling ── */
  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(f.type),
    );
    if (validFiles.length === 0) {
      setGlobalError("Format tidak didukung. Harap gunakan JPG/PNG.");
      return;
    }
    setGlobalError("");

    const newSessions: Session[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      status: "idle" as SessionStatus,
      result: null,
      error: "",
      patientName: "",
    }));

    setSessions((prev) => [...prev, ...newSessions]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  /* ── Camera state ── */
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ── Camera functions ── */
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    setCameraError("");
    setCameraReady(false);
    setCapturedImage(null);
    stopCameraStream();

    const constraints = {
      video: {
        facingMode: { exact: facing },
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
      audio: false,
    };

    // Fallback constraints (without exact) for devices that don't support switching
    const fallbackConstraints = {
      video: {
        facingMode: facing,
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
      audio: false,
    };

    try {
      let stream: MediaStream;
      try {
        // Try exact facingMode first (required for reliable front/back switching on mobile)
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback: some desktop browsers/devices don't support exact facingMode
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch (err: any) {
      let msg = "Gagal mengakses kamera.";
      if (err.name === "NotAllowedError") {
        msg = "Izin kamera ditolak. Harap izinkan akses kamera di pengaturan browser Anda.";
      } else if (err.name === "NotFoundError") {
        msg = "Kamera tidak ditemukan di perangkat Anda.";
      } else if (err.name === "NotReadableError") {
        msg = "Kamera sedang digunakan oleh aplikasi lain.";
      } else if (err.name === "OverconstrainedError") {
        msg = `Kamera ${facing === "user" ? "depan" : "belakang"} tidak tersedia di perangkat ini.`;
      }
      setCameraError(msg);
    }
  }, [stopCameraStream]);

  const openCamera = useCallback(() => {
    setCameraOpen(true);
    setCapturedImage(null);
    setCameraError("");
    // startCamera is called via useEffect when dialog opens
  }, []);

  const closeCamera = useCallback(() => {
    stopCameraStream();
    setCameraOpen(false);
    setCapturedImage(null);
    setCameraError("");
  }, [stopCameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCameraStream();
  }, [stopCameraStream]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera(facingMode);
  }, [startCamera, facingMode]);

  const acceptPhoto = useCallback(() => {
    if (!capturedImage) return;
    // Convert dataURL to File
    const byteString = atob(capturedImage.split(",")[1]);
    const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const file = new File([blob], `kamera-${timestamp}.jpg`, { type: "image/jpeg" });
    processFiles([file]);
    closeCamera();
  }, [capturedImage, processFiles, closeCamera]);

  const switchCameraFacing = useCallback(() => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    if (cameraOpen && !capturedImage) {
      startCamera(newFacing);
    }
  }, [facingMode, cameraOpen, capturedImage, startCamera]);

  // Start camera when dialog opens
  useEffect(() => {
    if (cameraOpen && !capturedImage) {
      // Small delay to let the dialog render the video element
      const timer = setTimeout(() => startCamera(facingMode), 150);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCameraStream();
  }, [stopCameraStream]);

  /* ── API call ── */
  const runAnalysis = async (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "loading" as SessionStatus, error: "" }
          : s,
      ),
    );

    const sessionToRun = sessions.find((x) => x.id === sessionId);
    const sessionFile = sessionToRun?.file ?? null;

    if (!sessionFile || !sessionToRun) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "error" as SessionStatus,
                error: "File tidak ditemukan di memori.",
              }
            : s,
        ),
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", sessionFile);
      if (sessionToRun.patientName.trim()) {
        formData.append("patientName", sessionToRun.patientName.trim());
      }

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errStr = "Gagal menghubungi server AI.";
        try {
          const errData = await response.json();
          if (errData.detail) errStr = errData.detail;
        } catch {}
        throw new Error(errStr);
      }

      const result: DiagnosisResult = await response.json();

      // Validasi Frontend: Mencegah model asal menebak gambar random / bukan gigi.
      // Jika YOLOv8 sama sekali tidak mendeteksi objek (array yolo_detections kosong)
      // DAN ResNet-18 memberikan nilai confidence di bawah 60% (0.60), kita tolak gambarnya.
      if (
        (!result.yolo_detections || result.yolo_detections.length === 0) &&
        result.diagnosis?.main?.confidence < 0.60
      ) {
        throw new Error(
          `Gambar Ditolak: Sistem tidak mendeteksi struktur gigi yang jelas (Confidence hanya ${(result.diagnosis.main.confidence * 100).toFixed(1)}%). Harap pastikan Anda mengunggah foto area gigi.`
        );
      }

      // Menerapkan Knowledge Base lokal ke hasil API
      if (result.diagnosis && result.diagnosis.main) {
        const mainClass = result.diagnosis.main.class;
        const kbInfo = DIAGNOSIS_INFO[mainClass];
        if (kbInfo) {
          result.diagnosis.main.info = {
            ...kbInfo,
            ...result.diagnosis.main.info,
            desc: kbInfo.desc,
            tx: kbInfo.tx,
          };
        }
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, status: "success" as SessionStatus, result };
        }),
      );
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          return { ...s, status: "error" as SessionStatus, error: err.message };
        }),
      );
    }
  };

  const runAllIdle = () => {
    sessions
      .filter((s) => s.status === "idle")
      .forEach((s) => runAnalysis(s.id));
  };

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  /* ── Report download ── */
  const downloadReport = async (session: Session) => {
    if (!session.result) return;
    try {
      const { generateReport } = await import("@/lib/generatePdf");
      await generateReport(
        {
          id: session.id,
          url: session.url,
          patientName: session.patientName,
          imageDimensions: session.imageDimensions,
          result: session.result,
        },
        DIAGNOSIS_INFO,
      );
    } catch (err) {
      console.error("Gagal mencetak PDF:", err);
      alert("Terjadi kesalahan saat mengekspor laporan.");
    }
  };

  const hasPending = sessions.some((s) => s.status === "idle");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/hai-dent-logo.png" alt="Hai Dent Clinic" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-900">
                Hai Dent Clinic
              </span>
            </Link>
            <div className="flex items-center gap-2">

              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-emerald-600 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ HERO HEADER ═══ */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12 sm:py-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            <span>AI-Powered Dental Diagnosis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Konsultasi AI Klinis{" "}
            <span className="text-emerald-600">Terpadu</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Ambil foto langsung dari kamera atau unggah gambar klinis gigi
            Anda untuk didiagnosis oleh YOLOv8 + ResNet-18 secara
            komprehensif. Mendukung banyak gambar sekaligus.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span>Real-time Analysis</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Grad-CAM Visualization</span>
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>7 Disease Classes</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-10">
          {/* ── UPLOAD & CAMERA ZONE ── */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              {/* Tab-style toggle: Upload vs Camera */}
              <div className="flex border-b border-gray-100 m-6 mb-0 rounded-t-xl overflow-hidden">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Gambar
                </button>
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50 border-b-2 border-transparent hover:border-emerald-300 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Ambil Foto Langsung
                </button>
              </div>

              {/* Upload drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
                }}
                className={`relative border-2 border-dashed rounded-xl m-6 p-10 sm:p-14 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer group
                  ${
                    isDragOver
                      ? "border-emerald-500 bg-emerald-50/80 scale-[1.01]"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                  }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  id="file-upload"
                />
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300
                  ${isDragOver ? "bg-emerald-100 scale-110" : "bg-gray-100 group-hover:bg-emerald-100"}`}
                >
                  <UploadCloud
                    className={`w-10 h-10 transition-colors duration-300
                    ${isDragOver ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"}`}
                  />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Tarik & Lepas gambar di sini
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Atau klik untuk memilih file dari perangkat Anda (JPG, PNG)
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-3 shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform pointer-events-none">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Jelajahi File
                  </Button>
                </div>
              </div>

              {/* Camera quick-launch banner */}
              <div className="mx-6 mb-6 flex items-center gap-4 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/50 rounded-xl p-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Gunakan Kamera Perangkat
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Foto langsung area gigi tanpa perlu upload file terpisah
                  </p>
                </div>
                <Button
                  onClick={openCamera}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2.5 shadow-md shadow-blue-600/20 gap-2 hover:scale-105 transition-all text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Buka Kamera
                </Button>
              </div>

              {globalError && (
                <div className="mx-6 mb-6 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{globalError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── CAMERA DIALOG ── */}
          <Dialog open={cameraOpen} onOpenChange={(open) => { if (!open) closeCamera(); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-2 text-gray-900">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Ambil Foto Gigi
                  <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                    facingMode === "environment"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Arahkan kamera ke area gigi yang ingin diperiksa, lalu tekan tombol ambil foto.
                  Gunakan tombol ganti kamera untuk beralih antara kamera depan dan belakang.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 pb-6 space-y-4">
                {/* Camera error */}
                {cameraError && (
                  <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
                    <CameraOff className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">Kamera Tidak Tersedia</p>
                      <p className="text-xs mt-0.5">{cameraError}</p>
                    </div>
                  </div>
                )}

                {/* Video / Captured preview */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[4/3] shadow-inner">
                  {!capturedImage ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                      />
                      {/* Camera overlay guides */}
                      {cameraReady && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Corner guides */}
                          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
                          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
                          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
                          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
                          {/* Center reticle */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/30 rounded-full" />
                        </div>
                      )}
                      {/* Loading state */}
                      {!cameraReady && !cameraError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
                          <RefreshCw className="w-8 h-8 text-white animate-spin mb-3" />
                          <p className="text-white/80 text-sm">Mengaktifkan kamera...</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                  {!capturedImage ? (
                    <>
                      {/* Switch camera - prominent with label */}
                      <Button
                        onClick={switchCameraFacing}
                        variant="outline"
                        disabled={!cameraReady}
                        className="h-12 rounded-full border-gray-300 hover:bg-gray-100 disabled:opacity-40 gap-2 px-4"
                        title="Ganti Kamera"
                      >
                        <SwitchCamera className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {facingMode === "environment" ? "Ke Depan" : "Ke Belakang"}
                        </span>
                      </Button>

                      {/* Capture button */}
                      <button
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="w-18 h-18 rounded-full bg-white border-4 border-emerald-500 hover:border-emerald-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                        title="Ambil Foto"
                      >
                        <CircleDot className="w-8 h-8 text-emerald-600" />
                      </button>

                      {/* Close camera */}
                      <Button
                        onClick={closeCamera}
                        variant="outline"
                        size="icon"
                        className="w-12 h-12 rounded-full border-red-300 hover:bg-red-50 text-red-500"
                        title="Tutup Kamera"
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Retake */}
                      <Button
                        onClick={retakePhoto}
                        variant="outline"
                        className="rounded-full gap-2 border-gray-300 hover:bg-gray-100 px-6 py-3"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Ulangi
                      </Button>

                      {/* Accept */}
                      <Button
                        onClick={acceptPhoto}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full gap-2 px-8 py-3 shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Gunakan Foto Ini
                      </Button>
                    </>
                  )}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-xs text-emerald-700 text-center">
                    💡 <strong>Tips:</strong> Pastikan area gigi terlihat jelas, pencahayaan cukup, dan gambar tidak buram untuk hasil diagnosis yang akurat.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* ── BATCH ACTION ── */}
          {hasPending && (
            <div className="flex justify-end">
              <Button
                onClick={runAllIdle}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 py-3 shadow-lg shadow-emerald-600/20 gap-2 hover:-translate-y-0.5 transition-all"
              >
                <Activity className="w-4 h-4" />
                Proses Semua Gambar Tertunda (
                {sessions.filter((s) => s.status === "idle").length})
              </Button>
            </div>
          )}

          {/* ═══ SESSION CARDS ═══ */}
          <div className="space-y-8">
            {sessions.map((session, index) => (
              <Card
                key={session.id}
                className="border-0 shadow-lg overflow-hidden"
              >
                {/* Session Header */}
                <CardHeader className="bg-gray-50 border-b border-gray-100 py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileImage className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-gray-900">
                          Foto #{index + 1}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                          {session.file?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {session.status === "success" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(session)}
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-full gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Laporan</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSession(session.id)}
                        className="text-red-500 border-red-200 hover:bg-red-50 rounded-full"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  {/* ── IDLE STATE ── */}
                  {session.status === "idle" && (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <img
                        src={session.url}
                        className="w-36 h-36 object-cover rounded-2xl shadow-md border border-gray-100"
                        alt="Preview"
                        onLoad={(e) => {
                          const t = e.target as HTMLImageElement;
                          if (!session.imageDimensions) {
                            setSessions((prev) =>
                              prev.map((s) =>
                                s.id === session.id
                                  ? {
                                      ...s,
                                      imageDimensions: {
                                        width: t.naturalWidth,
                                        height: t.naturalHeight,
                                      },
                                    }
                                  : s,
                              ),
                            );
                          }
                        }}
                      />
                      <div className="text-center sm:text-left flex-1">
                        <p className="text-gray-600 mb-4">
                          Menunggu konfirmasi untuk meluncurkan analisis Hybrid
                          AI (YOLOv8 + CNN) pada gambar ini.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            placeholder="Nama Pasien (Opsional)"
                            value={session.patientName}
                            onChange={(e) =>
                              setSessions((prev) =>
                                prev.map((s) =>
                                  s.id === session.id
                                    ? { ...s, patientName: e.target.value }
                                    : s,
                                ),
                              )
                            }
                            className="px-4 py-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                          />
                          <Button
                            onClick={() => runAnalysis(session.id)}
                            variant="outline"
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full gap-2 w-full sm:w-auto"
                          >
                            <Sparkles className="w-4 h-4" />
                            Analisis Gambar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── LOADING STATE ── */}
                  {session.status === "loading" && (
                    <div className="py-14 flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                          <RefreshCw className="w-9 h-9 text-emerald-600 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-300 animate-ping opacity-30" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg text-gray-900 mb-2">
                          Memindai Spasial & Atensi Klinis...
                        </p>
                        <p className="text-sm text-gray-500">
                          Analisis YOLOv8 + ResNet-18 sedang berjalan
                        </p>
                      </div>
                      <div className="w-64">
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  )}

                  {/* ── ERROR STATE ── */}
                  {session.status === "error" && (
                    <div className="py-10 flex flex-col items-center justify-center space-y-4 bg-red-50 rounded-2xl border border-red-200 p-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                      </div>
                      <p className="font-semibold text-xl text-red-800">
                        Gagal Menjalankan Model AI
                      </p>
                      <div className="text-sm font-mono bg-white text-gray-700 p-4 rounded-xl shadow-sm border border-red-100 max-w-md">
                        {session.error}
                      </div>
                      <Button
                        onClick={() => runAnalysis(session.id)}
                        variant="outline"
                        className="border-red-400 text-red-600 hover:bg-red-100 rounded-full gap-2 mt-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Mulai Ulang Analisis
                      </Button>
                    </div>
                  )}

                  {/* ═══ SUCCESS STATE ═══ */}
                  {session.status === "success" &&
                    session.result &&
                    (() => {

                      const normalizeClass = (cls: string) => {
                        if (!cls) return "";
                        const normalized = cls.toLowerCase().replace(/_/g, " ");
                        if (normalized.includes("tooth discoloration") || normalized.includes("perubahan warna")) return "Tooth_Discoloration";
                        if (normalized.includes("calculus") || normalized.includes("karang")) return "Calculus";
                        if (normalized.includes("caries") || normalized.includes("karies") || normalized.includes("lubang")) return "Caries";
                        if (normalized.includes("gingivitis") || normalized.includes("radang")) return "Gingivitis";
                        if (normalized.includes("hypodontia") || normalized.includes("hipodontia")) return "Hypodontia";
                        if (normalized.includes("mouth ulcer") || normalized.includes("sariawan")) return "Mouth_Ulcer";
                        if (normalized.includes("healthy") || normalized.includes("sehat")) return "Healthy";
                        return cls;
                      };

                      const rawYoloClasses = session.result.yolo_detections?.map((d: any) => d.class) || [];
                      const allCnnClasses = (session.result.diagnosis.all || [session.result.diagnosis.main]).map((d: any) => d.class);
                      const uniqueClassesRaw = Array.from(new Set([
                        ...allCnnClasses,
                        ...rawYoloClasses
                      ]));
                      
                      const uniqueClasses = Array.from(new Set(
                        uniqueClassesRaw.map(normalizeClass)
                      )).filter((c) => c !== "Healthy" && c !== "");

                      return (
                        <div className="space-y-8 animate-in fade-in duration-500">

                          {/* ── Visual Result ── */}
                          <div className="flex flex-col md:flex-row gap-6 bg-white border border-gray-100 p-6 rounded-2xl mt-6 shadow-sm">
                            <div className="flex-shrink-0">
                              <img
                                src={session.url}
                                className="w-full md:w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200"
                                alt="Uploaded Original"
                              />
                            </div>
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-2">
                                {session.result.diagnosis.main.class ===
                                "Healthy" ? (
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <ShieldAlert className="w-6 h-6 text-red-500" />
                                )}
                                <h3 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-3">
                                  {session.result.diagnosis.main.info?.name ||
                                    session.result.diagnosis.main.class}
                                  <span
                                    className={`px-2 py-1 flex items-center rounded-md text-xs font-semibold ${
                                      session.result.diagnosis.main.class ===
                                      "Healthy"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    Keyakinan{" "}
                                    {(
                                      session.result.diagnosis.main.confidence *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </h3>
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 border border-gray-100 space-y-4">
                                {uniqueClasses.length <= 1 ? (
                                  <div className="space-y-2">
                                    <p>
                                      <strong className="text-gray-900">Penyebab / Gejala:</strong>{" "}
                                      {session.result.diagnosis.main.info?.desc || "-"}
                                    </p>
                                    <div className="h-px bg-gray-200 w-full" />
                                    <p>
                                      <strong className="text-emerald-700">Saran Medis:</strong>{" "}
                                      {session.result.diagnosis.main.info?.tx || "-"}
                                    </p>
                                  </div>
                                ) : (
                                  uniqueClasses.map((cls, idx) => {
                                    const kb = DIAGNOSIS_INFO[cls] || {
                                      name: cls,
                                      desc: "-",
                                      tx: "-"
                                    };
                                    return (
                                      <div key={idx} className="space-y-2">
                                        <p className="font-bold text-gray-900 border-b pb-1 mb-2">Penanganan {kb.name}</p>
                                        <p>
                                          <strong className="text-gray-900">Penyebab / Gejala:</strong>{" "}
                                          {kb.desc}
                                        </p>
                                        <p>
                                          <strong className="text-emerald-700">Saran Medis:</strong>{" "}
                                          {kb.tx}
                                        </p>
                                        {idx < uniqueClasses.length - 1 && <div className="h-px bg-gray-200 w-full my-4" />}
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                                <p className="text-xs text-gray-500 text-center sm:text-left">
                                  Unduh laporan PDF untuk melihat markah visual
                                  (Bounding Box AI).
                                </p>
                                <Button
                                  onClick={() => downloadReport(session)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full gap-2 shadow-md w-full sm:w-auto"
                                >
                                  <Download className="w-4 h-4" />
                                  Unduh Laporan Lengkap
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Empty state ── */}
          {sessions.length === 0 && (
            <div className="text-center py-14">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
                <FileImage className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">
                Belum ada gambar yang diunggah
              </p>
              <p className="text-gray-400 text-sm">
                Ambil foto dari kamera atau unggah gambar di area di atas untuk memulai diagnosis AI
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Hai Dent Clinic — Kota Bekasi | AI Dental Diagnosis
            powered by YOLOv8 + ResNet-18
          </p>
        </div>
      </footer>
    </div>
  );
}
