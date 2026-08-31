import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${FASTAPI_URL}/api/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: "Gagal menghubungi server AI.",
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const result = await response.json();

    // -- SIMPAN RIWAYAT KE DATABASE --
    try {
      if (result && !result.error && result.diagnosis) {
        const main = result.diagnosis.main;
        let mainDiagnosisLabel = main.info?.name || main.class;
        
        if (result.yolo_detections && result.yolo_detections.length > 0) {
           const yoloNames = result.yolo_detections.map((d: any) => d.info?.name || d.class_name);
           const uniqueYolos = Array.from(new Set<string>(yoloNames)).filter((name: string) => name !== mainDiagnosisLabel && name !== "Gigi Sehat");
           if (uniqueYolos.length > 0) {
              if (mainDiagnosisLabel === "Gigi Sehat") {
                  mainDiagnosisLabel = `Terdeteksi ${uniqueYolos.join(" dan ")}`;
              } else {
                  mainDiagnosisLabel = `Terdeteksi ${mainDiagnosisLabel} dan ${uniqueYolos.join(" dan ")}`;
              }
              // Inject back to result so frontend automatically displays the combined string
              if (main.info) {
                  main.info.name = mainDiagnosisLabel;
              } else {
                  main.info = { name: mainDiagnosisLabel, severity: "Bervariasi" };
              }
           }
        }
        
        let imagePath: string | null = null;
        const file = formData.get("file") as File | null;
        const patientName = (formData.get("patientName") as string) || "Anonim";
        
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          // Bersihkan nama dari spasi/karakter spesial untuk folder
          const safeFolderName = mainDiagnosisLabel.replace(/[^a-zA-Z0-9]/g, "_");
          const uploadDir = path.join(process.cwd(), "public", "uploads", safeFolderName);
          
          await fs.mkdir(uploadDir, { recursive: true });
          
          const timestamp = Date.now();
          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
          const finalFileName = `${timestamp}_${cleanFileName}`;
          
          const fullFilePath = path.join(uploadDir, finalFileName);
          await fs.writeFile(fullFilePath, buffer);
          
          imagePath = `/uploads/${safeFolderName}/${finalFileName}`;
        }

        await db.diagnosisHistory.create({
          data: {
            patientName: patientName,
            mainDiagnosis: mainDiagnosisLabel,
            confidence: main.confidence,
            severity: main.info?.severity || "Unknown",
            complications: result.complication?.is_multi_label ? result.complication.complication_text : null,
            yoloDetections: JSON.stringify(result.yolo_detections || []),
            cnnProbabilities: JSON.stringify(result.cnn_probabilities || {}),
            imagePath: imagePath,
          }
        });
      }
    } catch (saveError) {
      console.error("Gagal menyimpan riwayat ke database:", saveError);
    }
    // ---------------------------------

    return NextResponse.json(result);
  } catch (error) {
    console.error("Predict API proxy error:", error);
    return NextResponse.json(
      { detail: "Tidak dapat terhubung ke server AI. Pastikan backend berjalan." },
      { status: 502 }
    );
  }
}
