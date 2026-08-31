/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * generatePdf.ts — PDF report generator for Hai Dent Clinic
 * Fixes: text spacing, baseline issues, and adds confidence explanations.
 */

interface PdfSession {
  id: string;
  url: string;
  patientName: string;
  imageDimensions?: { width: number; height: number } | null;
  result: any;
}

function normalizeClass(cls: string): string {
  if (!cls) return "";
  const n = cls.toLowerCase().replace(/_/g, " ");
  if (n.includes("tooth discoloration") || n.includes("perubahan warna")) return "Tooth_Discoloration";
  if (n.includes("calculus") || n.includes("karang")) return "Calculus";
  if (n.includes("caries") || n.includes("karies") || n.includes("lubang")) return "Caries";
  if (n.includes("gingivitis") || n.includes("radang")) return "Gingivitis";
  if (n.includes("hypodontia") || n.includes("hipodontia")) return "Hypodontia";
  if (n.includes("mouth ulcer") || n.includes("sariawan")) return "Mouth_Ulcer";
  if (n.includes("healthy") || n.includes("sehat")) return "Healthy";
  return cls;
}

function loadImg(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject("fail");
    img.src = src;
  });
}

export async function generateReport(session: PdfSession, diagnosisInfo: any) {
  const jsPDF = (await import("jspdf")).default;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = pdf.internal.pageSize.getWidth();   // 210
  const H = pdf.internal.pageSize.getHeight();  // 297
  const ML = 16;
  const MR = 16;
  const CW = W - ML - MR;
  const FOOTER = 30;
  let y = 16;

  const needPage = (h: number) => {
    if (y + h > H - FOOTER) { pdf.addPage(); y = 16; }
  };

  const measure = (text: string, maxW: number, size: number, lh: number): number => {
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(text, maxW);
    return lines.length * lh;
  };

  // ════════════════════════════════════════════════════
  //  1. HEADER
  // ════════════════════════════════════════════════════
  try {
    const logo = await loadImg("/hai-dent-logo.png");
    pdf.addImage(logo, "PNG", ML, y - 1, 17, 17);
  } catch { /* no logo */ }

  pdf.setFont("helvetica", "bold"); pdf.setFontSize(16);
  pdf.setTextColor(5, 150, 105);
  pdf.text("Hai Dent Clinic", ML + 21, y + 5);

  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  pdf.setTextColor(130, 130, 130);
  pdf.text("Laporan Diagnosis Klinis Dental AI — Kota Bekasi", ML + 21, y + 10);

  const dateStr = new Date().toLocaleDateString("id-ID", {
    year: "numeric", month: "long", day: "numeric",
  });
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(7.5);
  pdf.setTextColor(90, 90, 90);
  pdf.text("Tanggal Analisis", W - MR, y + 4, { align: "right" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  pdf.text(dateStr, W - MR, y + 9, { align: "right" });

  y += 19;
  pdf.setDrawColor(5, 150, 105); pdf.setLineWidth(0.6);
  pdf.line(ML, y, W - MR, y);
  y += 7;

  // ════════════════════════════════════════════════════
  //  2. PATIENT INFO BAR
  // ════════════════════════════════════════════════════
  pdf.setFillColor(246, 248, 250);
  pdf.setDrawColor(218, 222, 228);
  pdf.roundedRect(ML, y, CW, 15, 2, 2, "FD");

  const infoCols = [
    { label: "ID PEMERIKSAAN", val: `${session.id.toUpperCase().slice(0, 8)}-${Date.now().toString().slice(-4)}`, clr: [30, 30, 30] as [number, number, number] },
    { label: "PASIEN", val: session.patientName || "Anonim", clr: [30, 30, 30] as [number, number, number] },
    { label: "ALGORITMA AI", val: "YOLOv8 + ResNet-18", clr: [5, 150, 105] as [number, number, number] },
  ];
  infoCols.forEach((c, i) => {
    const cx = ML + (CW / 3) * i + 6;
    pdf.setFontSize(6); pdf.setFont("helvetica", "bold"); pdf.setTextColor(140, 140, 140);
    pdf.text(c.label, cx, y + 5);
    pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...c.clr);
    pdf.text(c.val, cx, y + 11);
  });
  y += 20;

  // ════════════════════════════════════════════════════
  //  3. CONFIDENCE SCORE BAR WITH EXPLANATION
  // ════════════════════════════════════════════════════
  const mainConf = session.result.diagnosis?.main?.confidence ?? 0;
  const yoloConfs = (session.result.yolo_detections || []).map((d: any) => d.confidence ?? 0);
  const maxYoloConf = yoloConfs.length > 0 ? Math.max(...yoloConfs) : 0;
  const bestConf = Math.max(mainConf, maxYoloConf);
  const confPct = (bestConf * 100).toFixed(1);

  // Measure the explanation text to size the box
  const explanationText = "* Confidence Score adalah persentase tingkat keyakinan kecerdasan buatan (AI) terhadap hasil diagnosis ini berdasarkan kemiripan pola dengan ribuan data klinis yang telah dipelajari. Semakin tinggi persentasenya, semakin akurat deteksinya.";
  const explanationLines = pdf.splitTextToSize(explanationText, CW - 12);
  const explanationH = explanationLines.length * 3.5;
  
  const confBoxH = 18 + explanationH;

  pdf.setFillColor(240, 249, 255);
  pdf.setDrawColor(190, 220, 250);
  pdf.roundedRect(ML, y, CW, confBoxH, 2, 2, "FD");

  pdf.setFontSize(7); pdf.setFont("helvetica", "bold"); pdf.setTextColor(60, 120, 200);
  pdf.text("TINGKAT KEYAKINAN AI (CONFIDENCE SCORE) TERTINGGI", ML + 6, y + 6);

  pdf.setFontSize(14); pdf.setFont("helvetica", "bold"); pdf.setTextColor(30, 100, 200);
  pdf.text(`${confPct}%`, ML + 6, y + 12);

  // Breakdown
  pdf.setFontSize(7); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 100, 100);
  pdf.text(`ResNet-18: ${(mainConf * 100).toFixed(1)}%`, ML + CW * 0.45, y + 9);
  if (maxYoloConf > 0) {
    pdf.text(`YOLOv8: ${(maxYoloConf * 100).toFixed(1)}%`, ML + CW * 0.7, y + 9);
  }

  // Explanation
  pdf.setFontSize(6.5); pdf.setTextColor(100, 120, 150);
  let expY = y + 17;
  for (const line of explanationLines) {
    pdf.text(line, ML + 6, expY);
    expY += 3.5;
  }

  y += confBoxH + 6;

  // ════════════════════════════════════════════════════
  //  4. SECTION TITLE HELPER
  // ════════════════════════════════════════════════════
  const sectionTitle = (title: string) => {
    needPage(14);
    pdf.setFillColor(5, 150, 105);
    pdf.rect(ML, y, 2.5, 5.5, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(title, ML + 5.5, y + 4);
    y += 9;
  };

  // ════════════════════════════════════════════════════
  //  5. VISUAL EVIDENCE
  // ════════════════════════════════════════════════════
  sectionTitle("Bukti Visual (Region & Atensi CNN)");

  const hasYolo = session.result.yolo_detections?.some((d: any) => d.class !== "Healthy") ?? false;
  const hasGcam = session.result.diagnosis.main.class !== "Healthy" && !!session.result.gradcam_base64;
  const slots = 1 + (hasYolo ? 1 : 0) + (hasGcam ? 1 : 0);
  const imgGap = 4;
  const imgW = Math.min((CW - imgGap * (slots - 1)) / slots, 54);
  const imgH = imgW;
  const rowW = imgW * slots + imgGap * (slots - 1);
  const startX = ML + (CW - rowW) / 2;

  needPage(imgH + 14);
  const rowY = y;

  const placeImg = async (src: string, x: number, label: string, labelClr: [number, number, number] = [80, 80, 80]) => {
    pdf.setDrawColor(200, 205, 210); pdf.setLineWidth(0.25);
    pdf.roundedRect(x, rowY, imgW, imgH, 1.5, 1.5, "S");
    try {
      const d = src.startsWith("data:") ? src : await loadImg(src);
      pdf.addImage(d, "PNG", x + 0.5, rowY + 0.5, imgW - 1, imgH - 1);
    } catch {
      pdf.setFillColor(240, 240, 240);
      pdf.rect(x + 0.5, rowY + 0.5, imgW - 1, imgH - 1, "F");
    }
    pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...labelClr);
    pdf.text(label, x + imgW / 2, rowY + imgH + 4, { align: "center" });
  };

  let cx = startX;
  await placeImg(session.url, cx, "Foto Pasien");
  cx += imgW + imgGap;

  if (hasYolo) {
    await placeImg(session.url, cx, "Deteksi YOLOv8");
    if (session.imageDimensions && session.result.yolo_detections) {
      const sx = (imgW - 1) / session.imageDimensions.width;
      const sy = (imgH - 1) / session.imageDimensions.height;
      for (const det of session.result.yolo_detections) {
        if (!det.bbox || det.bbox.length !== 4) continue;
        const [x1, y1, x2, y2] = det.bbox;
        pdf.setDrawColor(220, 50, 50); pdf.setLineWidth(0.35);
        pdf.rect(cx + 0.5 + x1 * sx, rowY + 0.5 + y1 * sy, (x2 - x1) * sx, (y2 - y1) * sy, "S");
      }
    }
    cx += imgW + imgGap;
  }

  if (hasGcam) {
    await placeImg(session.result.gradcam_base64, cx, "Peta Atensi ResNet", [5, 120, 80]);
  }

  y = rowY + imgH + 10;
  pdf.setDrawColor(225, 228, 232); pdf.setLineWidth(0.2);
  pdf.line(ML, y, W - MR, y);
  y += 8;

  // ════════════════════════════════════════════════════
  //  6. DIAGNOSIS CARDS
  // ════════════════════════════════════════════════════
  // Group confidences per class
  const classConfs: Record<string, number> = {};
  
  // Include ALL CNN diagnoses (not just main) for multi-label support
  const allCnnDiagnoses = session.result.diagnosis.all || [session.result.diagnosis.main];
  for (const diag of allCnnDiagnoses) {
    const n = normalizeClass(diag.class);
    if (n !== "") {
      classConfs[n] = Math.max(classConfs[n] || 0, diag.confidence || 0);
    }
  }

  if (session.result.yolo_detections) {
    for (const det of session.result.yolo_detections) {
      const n = normalizeClass(det.class);
      if (n !== "Healthy" && n !== "") {
        classConfs[n] = Math.max(classConfs[n] || 0, det.confidence || 0);
      }
    }
  }

  const allNorm = Object.keys(classConfs).filter(c => c !== "Healthy" && c !== "");
  
  let diseasesToRender: any[] = [];
  if (allNorm.length > 0) {
    diseasesToRender = allNorm.map(c => {
      const kb = diagnosisInfo[c] || { name: c, desc: "-", tx: "-" };
      return { ...kb, conf: classConfs[c] };
    });
  } else {
    const mainClassOriginal = session.result.diagnosis.main.class;
    const kb = diagnosisInfo[mainClassOriginal] || { name: "Gigi Sehat", desc: "-", tx: "-" };
    diseasesToRender = [{ ...kb, conf: session.result.diagnosis.main.confidence || 0 }];
  }

  sectionTitle("Diagnosis Utama & Rekomendasi Medis");

  for (let idx = 0; idx < diseasesToRender.length; idx++) {
    const kb = diseasesToRender[idx];
    const descText = kb.desc || "-";
    const txText = kb.tx || "-";
    const tag = allNorm.length > 1
      ? `PENYAKIT TERDETEKSI (${idx + 1}/${diseasesToRender.length})`
      : (allNorm.length === 0 ? "HASIL DIAGNOSIS" : "PENYAKIT TERDETEKSI");

    const LH = 5;
    const FS = 8.5;
    const innerW = CW - 20;
    const txInnerW = CW - 28;

    const descH = measure(descText, innerW, FS, LH);
    const txH = measure(txText, txInnerW, FS, LH);

    const tagRowH = 9;
    const nameRowH = 11;
    const descLabelH = 9;
    const descGap = 7;
    const txLabelH = 9;
    const txPadBot = 7;
    const cardPadTop = 8;
    const cardPadBot = 8;

    const descPartH = cardPadTop + tagRowH + nameRowH + descLabelH + descH + cardPadBot;
    const txBoxH = txLabelH + txH + txPadBot;
    const txPartH = cardPadTop + txBoxH + cardPadBot;
    const totalH = cardPadTop + tagRowH + nameRowH + descLabelH + descH + descGap + txBoxH + cardPadBot;

    const availableH = H - FOOTER - y;

    // Decide: fit everything on this page, or split across pages
    const fitsOnPage = totalH <= availableH;
    const descFitsOnPage = descPartH <= availableH;

    if (!fitsOnPage && !descFitsOnPage) {
      // Neither part fits → start fresh page
      pdf.addPage(); y = 16;
    }

    // ────────────────────────────────────────────────────
    //  PART 1: Description card
    // ────────────────────────────────────────────────────
    const drawDescCard = () => {
      const partH = fitsOnPage ? totalH : descPartH;
      const cardY = y;

      pdf.setFillColor(248, 253, 249);
      pdf.setDrawColor(200, 238, 210);
      pdf.roundedRect(ML, cardY, CW, partH, 3, 3, "FD");

      pdf.setFillColor(5, 150, 105);
      pdf.rect(ML, cardY + 3, 2.5, partH - 6, "F");

      const px = ML + 12;
      let textY = cardY + cardPadTop;

      // Tag
      pdf.setFontSize(6.5); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(5, 150, 105);
      pdf.text(tag, px, textY + 4);
      textY += tagRowH;

      // Disease name
      pdf.setFontSize(13); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(25, 25, 25);
      pdf.text(kb.name || "Unknown", px, textY + 5.5);

      // Confidence badge
      if (kb.conf) {
        const nameW = pdf.getTextWidth(kb.name || "Unknown");
        const confText = `Keyakinan: ${(kb.conf * 100).toFixed(1)}%`;
        pdf.setFontSize(7.5);
        const confW = pdf.getTextWidth(confText) + 6;
        pdf.setFillColor(16, 185, 129);
        pdf.roundedRect(px + nameW + 4, textY + 1.5, confW, 5.5, 1.5, 1.5, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.text(confText, px + nameW + 7, textY + 5.2);
      }
      textY += nameRowH;

      // "Penyebab / Gejala:" label
      pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(60, 60, 60);
      pdf.text("Penyebab / Gejala:", px, textY + 4.5);
      textY += descLabelH;

      // Description text
      pdf.setFontSize(FS); pdf.setFont("helvetica", "normal");
      pdf.setTextColor(70, 70, 70);
      const descLines = pdf.splitTextToSize(descText, innerW);
      for (const l of descLines) {
        pdf.text(l, px, textY + 3.8);
        textY += LH;
      }

      if (fitsOnPage) {
        // Continue with treatment on same card
        textY += descGap;

        // Treatment box
        const txBoxY = textY - 2;
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(190, 210, 250);
        pdf.roundedRect(ML + 8, txBoxY, CW - 16, txBoxH, 2.5, 2.5, "FD");
        pdf.setFillColor(37, 99, 235);
        pdf.rect(ML + 8, txBoxY + 2.5, 2, txBoxH - 5, "F");

        // "REKOMENDASI MEDIS" label
        pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
        pdf.setTextColor(37, 99, 235);
        pdf.text("REKOMENDASI MEDIS", px + 4, textY + 5.5);
        textY += txLabelH;

        // Treatment text
        pdf.setFontSize(FS); pdf.setFont("helvetica", "normal");
        pdf.setTextColor(40, 40, 40);
        const txLines = pdf.splitTextToSize(txText, txInnerW);
        for (const l of txLines) {
          pdf.text(l, px + 4, textY + 4);
          textY += LH;
        }

        y = cardY + partH + 8;
      } else {
        y = cardY + partH + 8;
      }
    };

    // ────────────────────────────────────────────────────
    //  PART 2: Treatment card (only if split)
    // ────────────────────────────────────────────────────
    const drawTxCard = () => {
      needPage(txPartH);
      const cardY = y;

      // Treatment card background
      pdf.setFillColor(248, 250, 255);
      pdf.setDrawColor(190, 210, 250);
      pdf.roundedRect(ML, cardY, CW, txPartH, 3, 3, "FD");

      // Left blue accent
      pdf.setFillColor(37, 99, 235);
      pdf.rect(ML, cardY + 3, 2.5, txPartH - 6, "F");

      const px = ML + 12;
      let textY = cardY + cardPadTop;

      // "REKOMENDASI MEDIS" label
      pdf.setFontSize(7); pdf.setFont("helvetica", "bold");
      pdf.setTextColor(37, 99, 235);
      pdf.text("REKOMENDASI MEDIS", px + 4, textY + 5.5);
      textY += txLabelH;

      // Treatment text
      pdf.setFontSize(FS); pdf.setFont("helvetica", "normal");
      pdf.setTextColor(40, 40, 40);
      const txLines = pdf.splitTextToSize(txText, txInnerW);
      for (const l of txLines) {
        pdf.text(l, px + 4, textY + 4);
        textY += LH;
      }

      y = cardY + txPartH + 8;
    };

    drawDescCard();
    if (!fitsOnPage) {
      drawTxCard();
    }
  }

  // ════════════════════════════════════════════════════
  //  7. FOOTER (on every page)
  // ════════════════════════════════════════════════════
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    const fy = H - FOOTER;
    pdf.setDrawColor(220, 224, 228); pdf.setLineWidth(0.2);
    pdf.line(ML, fy, W - MR, fy);
    pdf.setFontSize(6); pdf.setFont("helvetica", "normal"); pdf.setTextColor(160, 160, 160);
    pdf.text(
      "Dokumen ini dihasilkan otomatis oleh Hai Dent Clinic AI Diagnosis System. Bersifat penunjang, bukan pengganti spesialis.",
      W / 2, fy + 5, { align: "center" },
    );
    pdf.text(
      `YOLOv8 + ResNet-18 Medical Screening © ${new Date().getFullYear()} — Halaman ${p}/${pages}`,
      W / 2, fy + 9, { align: "center" },
    );
  }

  pdf.save(`Laporan_HaiDent_${Date.now()}.pdf`);
}
