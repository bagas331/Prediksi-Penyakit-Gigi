import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const history = await db.diagnosisHistory.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 100 // Limit to 100 latest items for now
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch diagnosis history GET /api/history:", error);
    return NextResponse.json(
      { detail: "Gagal mengambil riwayat diagnosa." },
      { status: 500 }
    );
  }
}
