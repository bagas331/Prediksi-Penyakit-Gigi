'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Heart,
  Star,
  MapPin,
  Phone,
  Clock as ClockIcon,
  ArrowRight,
  Sparkles,
  Award,
  Stethoscope,
  Calendar,
  PhoneCall,
  Brain,
  Cpu,
  History
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DentalClinicLandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openWhatsApp = (message?: string) => {
    const phoneNumber = '6281234567890'
    const text = message ? `?text=${encodeURIComponent(message)}` : ''
    window.open(`https://wa.me/${phoneNumber}${text}`, '_blank')
  }

  const testimonials = [
    {
      name: 'Sarah Wijaya',
      rating: 5,
      text: 'Awalnya takut banget ke dokter gigi, tapi di sini perawatanya benar-benar nyaman dan tidak sakit. Dokternya sangat sabar menjelaskan.'
    },
    {
      name: 'Budi Santoso',
      rating: 5,
      text: 'Harga transparan, tidak ada biaya tersembunyi. Pelayanan ramah dan profesional. Sangat recommended!'
    },
    {
      name: 'Anita Putri',
      rating: 5,
      text: 'Teknologi modern membuat proses lebih cepat dan nyaman. Hasil scaling bersih sekali. Puas banget!'
    }
  ]

  const services = [
    {
      title: 'Scaling (Pembersihan Karang Gigi)',
      description: 'Membersihkan karang gigi dan plak untuk kesehatan mulut yang optimal',
      icon: <Sparkles className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Tambal Gigi',
      description: 'Perbaikan gigi berlubang dengan bahan berkualitas tinggi',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Cabut Gigi',
      description: 'Pencabutan gigi dengan teknik modern dan minim rasa sakit',
      icon: <Stethoscope className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Behel (Orthodontic)',
      description: 'Perapihan susunan gigi untuk senyum yang lebih sempurna',
      icon: <Award className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Whitening',
      description: 'Pemutihan gigi untuk senyum lebih cerah dan percaya diri',
      icon: <Star className="w-8 h-8 text-emerald-600" />
    },
    {
      title: 'Implan Gigi',
      description: 'Penggantian gigi permanen dengan hasil natural',
      icon: <Heart className="w-8 h-8 text-emerald-600" />
    }
  ]

  const prices = [
    {
      name: 'Scaling',
      price: 'Rp150.000',
      description: 'Pembersihan karang gigi'
    },
    {
      name: 'Tambal Gigi',
      price: 'Rp200.000',
      description: 'Tambal dengan bahan berkualitas'
    },
    {
      name: 'Cabut Gigi',
      price: 'Rp250.000',
      description: 'Pencabutan gigi standar'
    },
    {
      name: 'Behel',
      price: 'Rp3.000.000',
      description: 'Pasang behel metal/ceramic'
    },
    {
      name: 'Whitening',
      price: 'Rp1.500.000',
      description: 'Pemutihan gigi profesional'
    },
    {
      name: 'Implan Gigi',
      price: 'Rp5.000.000',
      description: 'Per gigi, dengan crown'
    }
  ]

  const treatmentSteps = [
    {
      step: 1,
      title: 'Konsultasi',
      description: 'Diskusi dengan dokter tentang keluhan dan kebutuhan perawatan',
      icon: <MessageCircle className="w-6 h-6" />
    },
    {
      step: 2,
      title: 'Pemeriksaan',
      description: 'Pemeriksaan menyeluruh dengan teknologi digital X-Ray',
      icon: <Stethoscope className="w-6 h-6" />
    },
    {
      step: 3,
      title: 'Tindakan',
      description: 'Perawatan dilakukan dengan teknik modern dan minim rasa sakit',
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      step: 4,
      title: 'Kontrol',
      description: 'Follow-up untuk memastikan hasil perawatan optimal',
      icon: <Calendar className="w-6 h-6" />
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky WhatsApp Button */}
      <button
        onClick={() => openWhatsApp('Halo, saya ingin konsultasi di klinik gigi')}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image src="/hai-dent-logo.png" alt="Hai Dent Clinic" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-900">Hai Dent Clinic</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('keunggulan')} className="text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                Keunggulan
              </button>
              <button onClick={() => scrollToSection('layanan')} className="text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                Layanan
              </button>
              <button onClick={() => scrollToSection('harga')} className="text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                Harga
              </button>
              <button onClick={() => scrollToSection('testimoni')} className="text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                Testimoni
              </button>
              <button onClick={() => scrollToSection('lokasi')} className="text-gray-600 hover:text-emerald-600 transition-colors text-sm">
                Lokasi
              </button>
              <Link href="/diagnosis" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors text-sm flex items-center gap-1">
                <Brain className="w-4 h-4" />
                AI Diagnosis
              </Link>

            </div>
            <div className="flex items-center gap-3">
              <Link href="/diagnosis">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-4 py-2 text-sm rounded-full gap-1">
                  <Cpu className="w-4 h-4" />
                  Cek AI
                </Button>
              </Link>
              <Button 
                onClick={() => openWhatsApp('Halo, saya ingin booking janji temu')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm rounded-full"
              >
                Booking Sekarang
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-16 sm:py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Klinik Gigi Terpercaya</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Perawatan Gigi Nyaman & <span className="text-emerald-600">Minim Rasa Sakit</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">
                Didukung dokter berpengalaman dan teknologi modern untuk kesehatan gigi terbaik Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => openWhatsApp('Halo, saya ingin booking janji temu')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full w-full sm:w-auto"
                >
                  Booking Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => openWhatsApp('Halo, saya ingin konsultasi terlebih dahulu')}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg rounded-full w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Konsultasi via WhatsApp
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">10+</div>
                  <div className="text-sm text-gray-500">Tahun Pengalaman</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">5000+</div>
                  <div className="text-sm text-gray-500">Pasien Puas</div>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">4.9</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white aspect-square flex items-center justify-center">
                <div className="text-center p-8">
                  <Image src="/hai-dent-logo.png" alt="Hai Dent Clinic" width={300} height={300} className="w-64 h-64 mx-auto object-contain" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                <div className="bg-emerald-100 rounded-full p-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Terpercaya</p>
                  <p className="text-sm text-gray-500">Ribuan pasien puas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section id="keunggulan" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Klinik gigi dengan standar internasional untuk kenyamanan dan keamanan Anda
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Dokter Berpengalaman</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base">
                  Tim dokter gigi profesional dengan pengalaman lebih dari 10 tahun
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Teknologi Modern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base">
                  Peralatan dan teknologi terkini untuk diagnosis dan perawatan akurat
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-lg">Harga Transparan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base">
                  Harga jelas tanpa biaya tersembunyi, sesuai dengan kualitas layanan
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-orange-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Pelayanan Ramah</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm sm:text-base">
                  Tim yang ramah, sabar, dan siap membantu semua kebutuhan Anda
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Layanan Section */}
      <section id="layanan" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Layanan Utama
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Berbagai layanan perawatan gigi dengan kualitas terbaik
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Harga Section */}
      <section id="harga" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Daftar Harga
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Harga transparan tanpa biaya tersembunyi
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {prices.map((item, index) => (
              <Card key={index} className="border border-gray-200 hover:border-emerald-300 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-600">{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Mulai dari</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-gray-500">
              *Harga dapat berbeda tergantung kondisi pasien
            </p>
            <Button 
              onClick={() => openWhatsApp('Halo, saya ingin tanya detail harga layanan')}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <MessageCircle className="mr-2 w-4 h-4" />
              Tanya Detail via WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section id="testimoni" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Pasien Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Ribuan pasien telah merasakan pelayanan terbaik kami
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">&quot;{testimonial.text}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Profil Dokter Section */}
      <section id="dokter" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Profil Dokter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Tim dokter profesional berpengalaman
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-16 h-16 text-white" />
                </div>
                <CardTitle className="text-xl">drg. Sarah Amelia</CardTitle>
                <CardDescription>Spesialis Ortodonti</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Lulusan Universitas Indonesia dengan pengalaman 12 tahun dalam bidang ortodonti
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                    Certified Orthodontist
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Invisalign Provider
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-16 h-16 text-white" />
                </div>
                <CardTitle className="text-xl">drg. Budi Pratama</CardTitle>
                <CardDescription>Spesialis Bedah Mulut</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Spesialis bedah mulut dengan pengalaman 15 tahun, ahli dalam implan dan pencabutan kompleks
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                    Oral Surgeon
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Implant Specialist
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-16 h-16 text-white" />
                </div>
                <CardTitle className="text-xl">drg. Anisa Rahmawati</CardTitle>
                <CardDescription>Dokter Gigi Umum</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Spesialis dalam perawatan gigi estetik dan konservatif dengan pendekatan ramah
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                    Esthetic Dentistry
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Pediatric Friendly
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alur Perawatan Section */}
      <section id="alur" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Alur Perawatan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Proses perawatan yang transparan dan mudah dipahami
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {treatmentSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader>
                    <div className="bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.icon}
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
                {index < treatmentSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-emerald-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Temukan jawaban untuk pertanyaan umum tentang layanan kami
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Apakah perawatan sakit?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Kami menggunakan teknik modern dan anestesi untuk meminimalkan rasa sakit. Sebagian besar pasien merasa perawatan kami nyaman dan tidak menyakitkan. Dokter kami juga sangat sabar dan akan memberikan reassurance selama proses.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Berapa lama prosesnya?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Durasi perawatan bervariasi tergantung jenis layanan. Scaling biasanya 30-45 menit, tambal gigi 30-60 menit, sedangkan behel membutuhkan beberapa kunjungan selama 1-2 tahun. Kami akan memberikan estimasi waktu setelah pemeriksaan awal.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Apakah bisa pakai BPJS?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Saat ini kami melayani pasien umum dan beberapa asuransi swasta. Untuk informasi lebih lanjut tentang kerjasama asuransi, silakan hubungi kami via WhatsApp untuk konfirmasi.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                Apakah harus booking dulu?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Kami sangat menyarankan booking terlebih dahulu untuk menghindari antrean panjang dan memastikan ketersediaan dokter. Anda bisa booking melalui WhatsApp atau dengan datang langsung ke klinik.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Lokasi & Kontak Section */}
      <section id="lokasi" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Lokasi & Kontak
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Kunjungi klinik kami atau hubungi untuk informasi lebih lanjut
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.6!2d106.9630015!3d-6.2934367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698dbf317a983b%3A0x68354a4254142dbd!2sHai%20Dent%20Clinic%20-%20Bekasi!5e0!3m2!1sid!2sid!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Hai Dent Clinic - Bekasi"
                  className="w-full h-full"
                />
              </div>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl mb-6">Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Alamat</h4>
                    <p className="text-gray-600 text-sm">
                      Jl. Raya Jatiasih Ruko No.1D, Jatirasa, Kec. Jatiasih, Kota Bekasi, Jawa Barat 17424
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Jam Operasional</h4>
                    <p className="text-gray-600 text-sm">
                      Senin - Jumat: 09:00 - 20:00<br />
                      Sabtu: 09:00 - 17:00<br />
                      Minggu: Tutup
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <PhoneCall className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                    <Button 
                      onClick={() => openWhatsApp()}
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 mt-2"
                    >
                      <MessageCircle className="mr-2 w-4 h-4" />
                      Chat via WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Diagnosis Feature Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                <Brain className="w-4 h-4" />
                <span>Fitur Terbaru</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Diagnosis Gigi dengan <span className="text-emerald-600">AI Canggih</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Cukup unggah foto gigi Anda, dan teknologi AI kami yang didukung oleh YOLOv8 & ResNet-18 
                akan menganalisis kondisi gigi secara otomatis. Deteksi 7 jenis kondisi dental termasuk 
                karies, kalkulus, gingivitis, dan lainnya.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Analisis real-time dengan Grad-CAM visualization</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Deteksi lokalisasi region dengan YOLOv8</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Laporan diagnosis otomatis yang bisa diunduh</span>
                </div>
              </div>
              <Link href="/diagnosis">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full mt-4">
                  Mulai Diagnosis AI
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-8 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-4 text-center">
                      <Cpu className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-900">YOLOv8</p>
                      <p className="text-xs text-gray-500">Object Detection</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-4 text-center">
                      <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-900">ResNet-18</p>
                      <p className="text-xs text-gray-500">Classification CNN</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md col-span-2">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">7 Disease Classes</p>
                          <p className="text-xs text-gray-500">Karies, Kalkulus, Gingivitis, dll.</p>
                        </div>
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-xs">🦷</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-xs">🔍</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-xs">✅</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Jangan Tunggu Sampai Sakit, Rawat Gigi Anda Sekarang
          </h2>
          <p className="text-lg sm:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Kesehatan gigi adalah investasi terbaik untuk kualitas hidup Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => openWhatsApp('Halo, saya ingin booking janji temu')}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full w-full sm:w-auto"
            >
              Booking Sekarang
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              onClick={() => openWhatsApp('Halo, saya ingin konsultasi terlebih dahulu')}
              variant="outline"
              className="border-white text-white hover:bg-emerald-500 px-8 py-6 text-lg rounded-full w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/hai-dent-logo.png" alt="Hai Dent Clinic" width={28} height={28} className="w-7 h-7 object-contain" />
                <span className="text-lg font-bold">Hai Dent Clinic</span>
              </div>
              <p className="text-gray-400 text-sm">
                Klinik gigi modern dengan pelayanan terbaik untuk kesehatan gigi Anda
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Scaling</li>
                <li>Tambal Gigi</li>
                <li>Cabut Gigi</li>
                <li>Behel</li>
                <li>Whitening</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Jam Operasional</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Senin - Jumat: 09:00 - 20:00</li>
                <li>Sabtu: 09:00 - 17:00</li>
                <li>Minggu: Tutup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Kota Bekasi
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +62 812-3456-7890
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Hai Dent Clinic — Kota Bekasi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
