"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  History,
  LayoutDashboard,
  Image as ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryRecord {
  id: string;
  patientName: string;
  mainDiagnosis: string;
  confidence: number;
  severity: string;
  complications: string | null;
  createdAt: string;
  imagePath?: string | null;
}

function getSeverityBadgeVariant(
  severity: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "Tinggi" || severity === "Sedang-Tinggi")
    return "destructive";
  if (severity === "Normal") return "default";
  if (severity === "Struktural" || severity === "Estetik") return "secondary";
  return "outline";
}

export default function RiwayatPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (!res.ok) throw new Error("Gagal mengambil data dari server.");
        const data = await res.json();
        setRecords(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/hai-dent-logo.png" alt="Hai Dent Clinic" width={36} height={36} className="w-9 h-9 object-contain" />
              <span className="text-xl font-bold text-gray-900">
                Riwayat Diagnosa
              </span>
            </Link>
            <div className="flex gap-2">
              <Link href="/diagnosis">
                <Button
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 hidden sm:block" />
                  Ke Pendeteksi
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="text-gray-600 gap-2 hidden sm:flex"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Beranda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-100">
              <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-500" />
                Data Riwayat Pasien
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Daftar histori deteksi penyakit gigi menggunakan YOLOv8 +
                ResNet-18
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Memuat data dari database...</p>
                </div>
              ) : error ? (
                <div className="py-20 text-center text-red-500">
                  <p className="font-semibold">{error}</p>
                </div>
              ) : records.length === 0 ? (
                <div className="py-24 text-center text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    Belum ada riwayat yang tersimpan.
                  </p>
                  <p className="text-sm">
                    Silakan lakukan deteksi gigi terlebih dahulu di halaman
                    Pendeteksi.
                  </p>
                  <Link href="/diagnosis">
                    <Button className="mt-6 bg-emerald-600 hover:bg-emerald-700">
                      Mulai Diagnosis
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow>
                        <TableHead className="w-[180px] font-semibold text-gray-900">
                          Tanggal & Waktu
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">
                          Foto
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">
                          Nama Pasien
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">
                          Diagnosa Utama (CNN)
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">
                          Confidence
                        </TableHead>
                        <TableHead className="font-semibold text-gray-900">
                          Severitas / Bahaya
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow
                          key={record.id}
                          className="hover:bg-emerald-50/30 transition-colors"
                        >
                          <TableCell className="font-medium text-gray-500 text-sm">
                            {new Date(record.createdAt).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </TableCell>
                          <TableCell>
                            {record.imagePath ? (
                              <img
                                src={record.imagePath}
                                alt="Foto Gigi"
                                className="w-12 h-12 rounded-lg object-cover border border-emerald-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-100 shadow-inner">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-900 font-medium">
                            {record.patientName}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-gray-900 block">
                              {record.mainDiagnosis}
                            </span>
                            {record.complications && (
                              <div
                                className="text-xs text-red-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                                title={record.complications}
                              >
                                + Ada Komplikasi
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono bg-white text-gray-700 border-gray-200"
                            >
                              {(record.confidence * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getSeverityBadgeVariant(record.severity)}
                              className="capitalize"
                            >
                              {record.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
