import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ChevronRight, ArrowDown } from 'lucide-react';

export default function PublicAboutIndex() {
    return (
        <PublicLayout active="tentang">
            <Head title="Tentang BPA - PRAJA" />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 pb-2">
                <nav className="flex items-center gap-2 text-xs">
                    <Link
                        href="/"
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Beranda
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">Tentang BPA</span>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 pb-16 sm:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Left Content */}
                    <div className="lg:col-span-7">
                        <h1 className="text-3xl sm:text-4xl md:text-[46px] font-bold text-slate-950 tracking-tight leading-[1.15]">
                            Mendukung kemajuan akademik,
                            <br className="hidden sm:inline" /> bersama.
                        </h1>
                        <p className="mt-5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                            Mengenal Bagian Pengembangan Akademik dan PRAJA — ruang informasi yang
                            menghubungkan kegiatan, dokumen publik, dan komunitas akademik.
                        </p>
                    </div>

                    {/* Right Image */}
                    <div className="lg:col-span-5">
                        <div className="w-full overflow-hidden rounded-2xl shadow-xs border border-slate-100">
                            <img
                                src="/images/gku.jpg"
                                alt="Lingkungan kampus Telkom University"
                                className="w-full h-[260px] sm:h-[320px] object-cover block"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bagian Pengembangan Akademik Content Section */}
            <section
                id="profil-bpa"
                className="w-full bg-[#F7F7F5] border-t border-slate-100 py-14 sm:py-20 px-4 sm:px-6 md:px-8"
            >
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Left Heading */}
                        <div className="lg:col-span-4">
                            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight leading-[1.2]">
                                Bagian
                                <br />
                                Pengembangan
                                <br />
                                Akademik
                            </h2>
                        </div>

                        {/* Right Description */}
                        <div className="lg:col-span-8 space-y-5">
                            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                                BPA diperkenalkan sebagai bagian dari lingkungan akademik Telkom
                                University. Portal ini menjadi ruang untuk mengenal unit serta
                                mengakses informasi yang tersedia bagi publik.
                            </p>

                            <div className="space-y-3 pt-1">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                    Peran dalam pengembangan akademik
                                </h3>
                                <p className="text-xs sm:text-[13px] text-slate-600 leading-[1.85] text-justify">
                                    BPA merupakan unit yang berperan dalam menjaga mutu dan tata
                                    kelola pembelajaran agar tetap konsisten, relevan, dan berdampak
                                    bagi mahasiswa. BPA mengelola mata kuliah wajib seperti MKWK
                                    (Mata Kuliah Wajib Kurikulum) dan MKWU (Mata Kuliah Wajib
                                    Universitas), serta memfasilitasi perkuliahan lintas program
                                    studi. BPA juga menyediakan layanan Rekognisi Pembelajaran
                                    Lampau (RPL), mendukung program WRAP (Work Ready Program) yang
                                    mencakup magang, kewirausahaan, dan riset, serta berperan aktif
                                    dalam pelaksanaan program Merdeka Belajar Kampus Merdeka (MBKM).
                                    Selain itu, BPA mendampingi dosen dan program studi dalam
                                    merancang kurikulum berbasis Outcome-Based Education (OBE),
                                    menyusun Rencana Pembelajaran Semester (RPS), dan mengembangkan
                                    asesmen yang adil dan terukur. Untuk memperkuat literasi baca,
                                    tulis, dan numerasi mahasiswa, BPA mendorong metode pembelajaran
                                    yang sesuai dengan kebutuhan peserta didik. Dalam mendukung
                                    inovasi dan transformasi digital, BPA juga menginisiasi
                                    integrasi teknologi pembelajaran berbasis kecerdasan artifisial
                                    (AI).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
