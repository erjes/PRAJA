import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { useInView } from '@/hooks/useInView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { 
    ChevronLeft, 
    ChevronRight, 
    Download, 
    Eye, 
    MapPin, 
    Mail, 
    X, 
    Search, 
    BookOpen
} from 'lucide-react';

interface DocumentVersion {
    id: number;
    version_number: string;
    file_path: string;
    created_at: string;
    creator?: { id: number; name: string } | null;
}

interface Document {
    id: number;
    title: string;
    document_number?: string | null;
    description?: string | null;
    category: 'kebijakan' | 'proses_bisnis';
    subcategory: string;
    owner?: string | null;
    effective_date?: string | null;
    clause?: string | null;
    visibility: 'public' | 'private';
    status: 'aktif' | 'nonaktif' | 'draft';
    current_version: string;
    versions?: DocumentVersion[];
    uploader?: { id: number; name: string } | null;
}

interface Project {
    id: number;
    title: string;
    description?: string | null;
    status: string;
    start_date?: string | null;
    division?: { id: number; name: string } | null;
}

interface EventItem {
    id: number;
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    division?: { id: number; name: string } | null;
}

interface PageProps {
    auth: {
        user?: { id: number; name: string; email: string; role?: string } | null;
    };
    publicDocuments?: Document[];
    recentProjects?: Project[];
    upcomingEvents?: EventItem[];
    [key: string]: any;
}

export default function Welcome() {
    const { auth, publicDocuments = [], recentProjects = [], upcomingEvents = [] } = usePage<PageProps>().props;

    const heroAnim = useInView<HTMLElement>();
    const eventAnim = useInView<HTMLElement>();
    const docsAnim = useInView<HTMLElement>();
    const footerAnim = useInView<HTMLElement>();

    // Carousel Activities
    const defaultActivities = [
        {
            id: 101,
            title: 'Market Day 2026',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        },
        {
            id: 102,
            title: 'Audit Gedung Kuliah Bersama',
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        },
        {
            id: 103,
            title: 'Sidang Senat Terbuka Wisuda',
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
        }
    ];

    const activitiesList = recentProjects.length > 0 
        ? recentProjects.map((p, idx) => ({
            id: p.id,
            title: p.title,
            image: defaultActivities[idx % defaultActivities.length].image
        }))
        : defaultActivities;

    const [activeSlide, setActiveSlide] = useState(0);

    const nextSlide = () => {
        setActiveSlide((prev) => (prev + 1) % activitiesList.length);
    };

    const prevSlide = () => {
        setActiveSlide((prev) => (prev - 1 + activitiesList.length) % activitiesList.length);
    };

    // Events for Event Mendatang
    const defaultEvents = [
        {
            id: 201,
            title: 'Market Day 2026',
            day: '20',
            month: 'Nov',
            location: 'Gedung Tokong Nanas, Telkom University',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 202,
            title: 'Market Day 2026',
            day: '20',
            month: 'Nov',
            location: 'Gedung Tokong Nanas, Telkom University',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 203,
            title: 'Market Day 2026',
            day: '20',
            month: 'Nov',
            location: 'Gedung Tokong Nanas, Telkom University',
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'
        }
    ];

    const eventsList = upcomingEvents.length > 0
        ? upcomingEvents.slice(0, 3).map((e: any, idx) => {
            const dateObj = e.start_time ? new Date(e.start_time) : new Date();
            const day = dateObj.toLocaleDateString('id-ID', { day: '2-digit' });
            const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
            return {
                id: e.id,
                title: e.title,
                day,
                month,
                location: e.division?.name ? `${e.division.name}, Telkom University` : 'Gedung Tokong Nanas, Telkom University',
                image: e.poster_path ? e.poster_path : null
            };
        })
        : defaultEvents;

    // Sample fallback documents if database is empty
    const defaultDocs: Document[] = [
        {
            id: 301,
            title: 'Dokumen Kebijakan 1',
            category: 'kebijakan',
            subcategory: 'pedoman',
            visibility: 'public',
            status: 'aktif',
            current_version: 'v1.0'
        },
        {
            id: 302,
            title: 'Laporan Tracer Study 2025 Kampus Bandung',
            document_number: 'BPA/2025/TS/01',
            description: 'Laporan komprehensif penelusuran lulusan dan relevansi kurikulum dengan kebutuhan industri digital masa kini.',
            category: 'kebijakan',
            subcategory: 'laporan_tahunan',
            visibility: 'public',
            status: 'aktif',
            current_version: 'v1.0',
            versions: [{ id: 1, version_number: 'v1.0', file_path: '', created_at: '2025-12-01' }]
        },
        {
            id: 303,
            title: 'Dokumen Kebijakan 2',
            category: 'kebijakan',
            subcategory: 'sop',
            visibility: 'public',
            status: 'aktif',
            current_version: 'v1.0'
        },
        {
            id: 304,
            title: 'Dokumen Kebijakan 3',
            category: 'kebijakan',
            subcategory: 'panduan',
            visibility: 'public',
            status: 'aktif',
            current_version: 'v1.0'
        }
    ];

    const displayDocs = publicDocuments.length > 0 ? publicDocuments : defaultDocs;

    // Modal state for viewing all documents & fullscreen PDF preview
    const [isAllDocsOpen, setIsAllDocsOpen] = useState(false);
    const [selectedDocForReview, setSelectedDocForReview] = useState<Document | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const openDocReview = (doc: Document) => {
        setSelectedDocForReview(doc);
        setIsReviewOpen(true);
    };

    const filteredModalDocs = displayDocs.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.document_number && d.document_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1b1b18] font-sans antialiased overflow-x-hidden flex flex-col">
            <Head title="Selamat Datang - PRAJA" />

            {/* Top Header Navigation */}
            <header className="sticky top-0 z-50 w-full bg-[#F9F9F9]/95 backdrop-blur-md transition-colors border-b border-gray-200/60 shadow-xs animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-full px-4 sm:px-6 md:px-8 h-18 sm:h-20 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
                    >
                        <img
                            src="/logo.png"
                            alt="PRAJA Logo"
                            className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-xl sm:text-2xl md:text-[26px] font-black tracking-widest text-slate-900 uppercase">
                            PRAJA
                        </span>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section 
                ref={heroAnim.ref}
                className={`min-h-screen flex flex-col items-center justify-center pt-20 pb-24 sm:pb-32 px-3 sm:px-6 md:px-8 w-full text-center relative overflow-hidden duration-700 delay-150 fill-mode-both ${
                    heroAnim.isInView ? 'animate-in fade-in zoom-in-95' : 'opacity-0'
                }`}
            >
                {/* Background Image */}
                <img
                    src="/images/gku.jpg"
                    alt="Gedung Kampus Telkom University"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay gradasi gelap ke merah PRAJA */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/65 via-slate-900/50 to-[#901418]/70" />

                {/* Konten di atas overlay */}
                <div className="max-w-3xl mx-auto relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-[52px] font-bold text-white tracking-tight leading-tight">
                        Bangun Kolaborasi Bersama PRAJA
                    </h1>
                    <p className="mt-3.5 text-medium sm:text-sm text-white/85 leading-relaxed font-bold max-w-xl mx-auto">
                        PRAJA adalah portal terpadu yang dirancang untuk
                        mendukung pengelolaan aktivitas dan sumber daya
                        akademik. Melalui satu platform, pengguna dapat
                        mengakses informasi kebijakan, mengelola event, memantau
                        proyek, serta berkolaborasi secara lebih efektif.
                    </p>
                    <div className="mt-6">
                        <Link
                            href={login()}
                            className="inline-block bg-white hover:bg-gray-100 text-[#901418] px-8 py-2.5 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all text-sm tracking-wide active:scale-95"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </section>

            <div className="w-full relative z-60 flex justify-center pointer-events-none -mt-[180px] -mb-[180px] sm:-mt-[180px] sm:-mb-[180px]">
                <img
                    src="/images/red-ribbon.png"
                    alt="Telkom Red Ribbon Divider"
                    className="w-full max-w-full h-auto object-cover sm:object-fill max-h-[220px] sm:max-h-[280px] select-none block"
                />
            </div>

            {/* Event Mendatang Section */}
            <section ref={eventAnim.ref} className="pt-[130px] sm:pt-[280px] pb-16 px-3 sm:px-6 md:px-8 w-full relative z-20">
                <div className={`text-center max-w-2xl mx-auto mb-10 duration-700 ${
                    eventAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
                }`}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Event Mendatang
                    </h2>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Tetap terhubung dengan berbagai kegiatan akademik dan
                        pengembangan diri. Temukan informasi mengenai seminar,
                        workshop, pelatihan, dan acara lainnya yang akan segera
                        berlangsung.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
                    {eventsList.map((ev, idx) => (
                        <div
                            key={ev.id || idx}
                            className={`bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#901418]/50 transition-all duration-300 flex flex-col group w-full fill-mode-both ${
                                eventAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-8' : 'opacity-0'
                            }`}
                            style={{
                                animationDelay: eventAnim.isInView ? `${(idx + 1) * 150}ms` : undefined,
                                animationDuration: "700ms",
                            }}
                        >
                            <div className="h-44 sm:h-48 w-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
                                {ev.image ? (
                                    <img
                                        src={ev.image}
                                        alt={ev.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="p-6 text-center w-full flex flex-col items-center justify-center bg-gray-100/90 h-full">
                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                            Agenda Kegiatan
                                        </span>
                                        <span className="text-gray-600 font-bold text-base sm:text-lg line-clamp-3 leading-snug">
                                            {ev.title}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 sm:p-5 flex items-center gap-4 flex-1 bg-white">
                                <div className="flex flex-col items-center justify-center min-w-[50px] text-[#901418] font-bold shrink-0">
                                    <span className="text-[11px] font-semibold leading-none">
                                        {ev.month}
                                    </span>
                                    <span className="text-xl sm:text-2xl font-black leading-tight mt-0.5">
                                        {ev.day}
                                    </span>
                                </div>

                                <div className="w-[1px] h-8 bg-gray-200 shrink-0" />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-[#901418] transition-colors">
                                        {ev.title}
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                                        {ev.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Document Kebijakan Section with clean white theme & #901418 accent */}
            <section ref={docsAnim.ref} className="py-12 sm:py-16 px-3 sm:px-6 md:px-8 w-full">
                <div className={`text-center max-w-2xl mx-auto mb-10 duration-700 ${
                    docsAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
                }`}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Document Kebijakan
                    </h2>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        Akses berbagai dokumen kebijakan dan pedoman resmi yang
                        tersusun secara terpusat untuk mendukung tata kelola dan
                        pengambilan keputusan yang lebih efektif.
                    </p>
                </div>

                {/* Grid of 4 Documents full-width across screen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch w-full">
                    {displayDocs.slice(0, 4).map((doc, idx) => {
                        const isFeatured =
                            idx === 1 ||
                            (idx === 0 && displayDocs.length === 1);
                        const latestVer =
                            doc.versions && doc.versions.length > 0
                                ? doc.versions[0]
                                : null;

                        if (isFeatured) {
                            return (
                                <div
                                    key={doc.id || idx}
                                    onClick={() => openDocReview(doc)}
                                    className={`bg-white text-slate-900 rounded-2xl p-6 shadow-md border-2 border-[#901418]/30 hover:border-[#901418] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[320px] sm:min-h-[340px] z-10 w-full group fill-mode-both ${
                                        docsAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-8' : 'opacity-0'
                                    }`}
                                    style={{
                                        animationDelay: docsAnim.isInView ? `${(idx + 1) * 150}ms` : undefined,
                                        animationDuration: "700ms",
                                    }}
                                >
                                    <div className="text-center mt-2">
                                        <div className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-[#901418] text-white mb-2.5 shadow-2xs">
                                            {doc.current_version || "2025"}
                                        </div>
                                        <p className="text-[10px] uppercase tracking-wider text-[#901418] font-extrabold">
                                            Laporan / Pedoman
                                        </p>
                                        <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-1 text-slate-900 group-hover:text-[#901418] transition-colors">
                                            {doc.title.includes("Tracer")
                                                ? "TRACER STUDY"
                                                : doc.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-semibold mt-1">
                                            {doc.title.includes("Tracer")
                                                ? "2025"
                                                : ""}
                                        </p>
                                        <div className="inline-block mt-2.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#901418] text-[10px] font-bold">
                                            Kampus Bandung
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center border-t border-gray-100 pt-3.5">
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {doc.description ||
                                                "Bridging Education and Workforce Evolution - Direktorat Penjaminan Mutu & Audit"}
                                        </p>
                                        {latestVer && (
                                            <a
                                                href={route(
                                                    "documents.download",
                                                    latestVer.id,
                                                )}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#901418] hover:bg-[#7a1014] text-white transition shadow-sm"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Unduh PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Surrounding clean white cards with #901418 accent
                        return (
                            <div
                                key={doc.id || idx}
                                onClick={() => openDocReview(doc)}
                                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#901418]/60 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[280px] sm:min-h-[300px] border border-gray-200/80 w-full group fill-mode-both ${
                                    docsAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-8' : 'opacity-0'
                                }`}
                                style={{
                                    animationDelay: docsAnim.isInView ? `${(idx + 1) * 150}ms` : undefined,
                                    animationDuration: "700ms",
                                }}
                            >
                                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-red-50/80 border border-red-100 group-hover:bg-[#901418] transition-colors flex items-center justify-center text-[#901418] group-hover:text-white font-extrabold text-sm tracking-tight shadow-2xs">
                                    PDF
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mt-4 text-center line-clamp-2 group-hover:text-[#901418] transition-colors">
                                    {doc.title}
                                </h4>
                                <span className="text-[11px] text-slate-400 font-semibold mt-1">
                                    {doc.current_version || "v1.0"}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Lihat Selengkapnya Button */}
                <div className="mt-10 text-center">
                    <button
                        onClick={() => setIsAllDocsOpen(true)}
                        className="bg-[#901418] hover:bg-[#7a1014] text-white font-semibold px-8 py-2.5 rounded-full shadow hover:shadow-lg hover:-translate-y-0.5 transition-all transform hover:scale-105 active:scale-95 text-xs sm:text-sm tracking-wide"
                    >
                        Lihat Selengkapnya
                    </button>
                </div>
            </section>

            {/* Footer Section exactly with #901418 */}
            <footer ref={footerAnim.ref} className={`mt-auto bg-[#901418] text-white pt-12 pb-10 px-4 sm:px-8 lg:px-12 shadow-inner duration-700 ${
                footerAnim.isInView ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}>
                <div className="w-full flex flex-col items-start gap-8">
                    {" "}
                    {/* Logo & PRAJA text */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow">
                            <img
                                src="/logo.png"
                                alt="PRAJA Logo"
                                className="h-8 w-auto object-contain"
                            />
                        </div>
                        <span className="text-3xl font-black tracking-widest text-white uppercase">
                            PRAJA
                        </span>
                    </div>
                    {/* Contact & Address */}
                    <div className="space-y-3.5 text-xs sm:text-sm text-red-100/90">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-white shrink-0" />
                            <span className="font-medium">
                                Gedung Tokong Nanas Telkom University
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-white shrink-0" />
                            <a
                                href="mailto:kampusmerdeka@telkomuniversity.ac.id"
                                className="font-medium underline underline-offset-4 hover:text-white transition"
                            >
                                kampusmerdeka@telkomuniversity.ac.id
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* All Public Documents Modal */}
            <Dialog open={isAllDocsOpen} onOpenChange={setIsAllDocsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6 bg-white text-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-slate-900">
                            <BookOpen className="w-5 h-5 text-[#901418]" />
                            Daftar Seluruh Dokumen Kebijakan & Pedoman Publik
                        </DialogTitle>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative my-2">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama dokumen, nomor dokumen, atau kata kunci..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#901418] text-slate-900"
                        />
                    </div>

                    {/* Documents List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-2">
                        {filteredModalDocs.length === 0 ? (
                            <div className="py-12 text-center text-sm text-slate-500">
                                Dokumen tidak ditemukan.
                            </div>
                        ) : (
                            filteredModalDocs.map((doc, idx) => {
                                const latestVer =
                                    doc.versions && doc.versions.length > 0
                                        ? doc.versions[0]
                                        : null;
                                return (
                                    <div
                                        key={doc.id || idx}
                                        className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-red-500/40 transition shadow-sm"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div className="w-11 h-11 rounded-xl bg-red-50 text-[#901418] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                PDF
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                                                    {doc.title}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                                    {doc.document_number && (
                                                        <span className="font-semibold text-slate-600">
                                                            {
                                                                doc.document_number
                                                            }
                                                        </span>
                                                    )}
                                                    <span>•</span>
                                                    <span>
                                                        {doc.category ===
                                                        "kebijakan"
                                                            ? "Kebijakan"
                                                            : "Proses Bisnis"}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="text-[#901418] font-semibold">
                                                        {doc.current_version ||
                                                            "v1.0"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                                            <button
                                                onClick={() => {
                                                    setIsAllDocsOpen(false);
                                                    openDocReview(doc);
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                                Pratinjau
                                            </button>

                                            {latestVer && (
                                                <a
                                                    href={route(
                                                        "documents.download",
                                                        latestVer.id,
                                                    )}
                                                    className="px-4 py-1.5 rounded-xl bg-[#901418] hover:bg-[#7a1014] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Unduh
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Fullscreen PDF Preview Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="!max-w-screen !w-screen !h-screen !max-h-screen !rounded-none !p-0 !border-0 flex flex-col bg-slate-900 text-white overflow-hidden z-[100]">
                    {selectedDocForReview && (
                        <>
                            <div className="h-12 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-6 h-6 rounded bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">
                                        PDF
                                    </div>
                                    <span className="text-sm font-bold truncate text-slate-200">
                                        {selectedDocForReview.title}
                                    </span>
                                    {selectedDocForReview.current_version && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                            {
                                                selectedDocForReview.current_version
                                            }
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {selectedDocForReview.versions &&
                                        selectedDocForReview.versions.length >
                                            0 && (
                                            <a
                                                href={route(
                                                    "documents.download",
                                                    selectedDocForReview
                                                        .versions[0].id,
                                                )}
                                                className="px-3 py-1.5 rounded bg-[#901418] hover:bg-[#7a1014] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Unduh Berkas
                                            </a>
                                        )}
                                    <button
                                        onClick={() => setIsReviewOpen(false)}
                                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                        title="Tutup"
                                    ></button>
                                </div>
                            </div>

                            <div className="flex-1 w-full h-full relative bg-slate-900 flex items-center justify-center">
                                {selectedDocForReview.versions &&
                                selectedDocForReview.versions.length > 0 ? (
                                    <iframe
                                        src={route(
                                            "documents.preview",
                                            selectedDocForReview.versions[0].id,
                                        )}
                                        className="w-full h-full border-0 absolute inset-0"
                                        title={selectedDocForReview.title}
                                    />
                                ) : (
                                    <div className="text-center p-8 text-slate-400 max-w-md">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 font-black flex items-center justify-center mx-auto mb-3 text-lg">
                                            PDF
                                        </div>
                                        <p className="text-base font-semibold text-slate-300">
                                            Pratinjau langsung tidak tersedia
                                        </p>
                                        <p className="text-xs mt-1 text-slate-500">
                                            Berkas dokumen ini belum diunggah
                                            atau berformat internal.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
