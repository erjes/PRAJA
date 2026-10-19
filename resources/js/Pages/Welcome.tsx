import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useInView } from '@/hooks/useInView';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import {
    Calendar,
    FileText,
    LayoutGrid,
    ArrowUpRight,
    Clock,
    Search,
    ChevronDown,
    Download,
    X,
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
    category: 'kebijakan' | 'proses_bisnis' | string;
    subcategory?: string | null;
    owner?: string | null;
    effective_date?: string | null;
    created_at?: string | null;
    clause?: string | null;
    visibility: 'public' | 'private';
    status: 'aktif' | 'nonaktif' | 'draft';
    current_version: string;
    versions?: DocumentVersion[];
    uploader?: { id: number; name: string } | null;
}

interface EventItem {
    id: number;
    title: string;
    description?: string | null;
    location?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    evidence_link?: string | null;
    poster_path?: string | null;
    division?: { id: number; name: string } | null;
}

interface PageProps {
    auth: {
        user?: { id: number; name: string; email: string; role?: string } | null;
    };
    publicDocuments?: Document[];
    upcomingEvents?: EventItem[];
    [key: string]: any;
}

const templateEvents: EventItem[] = [
    {
        id: -1,
        title: 'Judul Event',
        description: 'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.',
        location: 'Lokasi Kegiatan',
        start_time: null,
        poster_path: null,
        division: { id: 0, name: 'Kategori' },
    },
    {
        id: -2,
        title: 'Judul Event',
        description: 'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.',
        location: 'Lokasi Kegiatan',
        start_time: null,
        poster_path: null,
        division: { id: 0, name: 'Kategori' },
    },
    {
        id: -3,
        title: 'Judul Event',
        description: 'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.',
        location: 'Lokasi Kegiatan',
        start_time: null,
        poster_path: null,
        division: { id: 0, name: 'Kategori' },
    },
];

const templateDocuments: Document[] = [
    {
        id: -1,
        title: 'Judul Dokumen Publik',
        category: 'Kategori',
        subcategory: 'Subkategori',
        visibility: 'public',
        status: 'aktif',
        current_version: 'v1.0',
    },
    {
        id: -2,
        title: 'Judul Dokumen Publik',
        category: 'Kategori',
        subcategory: 'Subkategori',
        visibility: 'public',
        status: 'aktif',
        current_version: 'v1.0',
    },
    {
        id: -3,
        title: 'Judul Dokumen Publik',
        category: 'Kategori',
        subcategory: 'Subkategori',
        visibility: 'public',
        status: 'aktif',
        current_version: 'v1.0',
    },
];

function formatEventDate(dateStr?: string | null): string {
    if (!dateStr) return 'DD MMM YYYY';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'DD MMM YYYY';
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatEventTime(dateStr?: string | null): string {
    if (!dateStr) return '00:00 WIB';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '00:00 WIB';
    return `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
}

function formatDocCategory(category?: string | null, subcategory?: string | null): string {
    if (subcategory) {
        return subcategory.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    }
    if (category === 'kebijakan') return 'Kebijakan';
    if (category === 'proses_bisnis') return 'Proses Bisnis';
    return category || 'Kategori';
}

export default function Welcome() {
    const { publicDocuments = [], upcomingEvents = [] } = usePage<PageProps>().props;

    const heroAnim = useInView<HTMLElement>();
    const aboutAnim = useInView<HTMLElement>();
    const eventAnim = useInView<HTMLElement>();
    const docsAnim = useInView<HTMLElement>();

    // Search & filter state for Public Documents
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Modal state for fullscreen PDF preview
    const [selectedDocForReview, setSelectedDocForReview] = useState<Document | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const openDocReview = (doc: Document) => {
        if (doc.id < 0) return;
        setSelectedDocForReview(doc);
        setIsReviewOpen(true);
    };

    const eventsToDisplay =
        upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3) : templateEvents;

    const filteredPublicDocs = publicDocuments.filter((doc) => {
        if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
            return false;
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const haystack = [doc.title, doc.document_number, doc.description, doc.category, doc.subcategory]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });

    const docsToDisplay =
        publicDocuments.length > 0 ? filteredPublicDocs.slice(0, 3) : templateDocuments;

    const featureItems = [
        {
            icon: Calendar,
            tag: 'EVENT MANAGEMENT',
            title: 'Manajemen Event',
            description:
                'Temukan seminar, workshop, dan kegiatan akademik yang sudah dipublikasikan, lengkap dengan waktu dan lokasi.',
            linkLabel: 'Jelajahi Event',
            href: '#event',
        },
        {
            icon: FileText,
            tag: 'DOCUMENT MANAGEMENT',
            title: 'Pengelolaan Dokumen',
            description:
                'Akses dokumen publik dengan kategori yang tertata, informasi berkas yang jelas, dan pilihan lihat atau unduh.',
            linkLabel: 'Buka Dokumen Publik',
            href: '#dokumen',
        },
        {
            icon: LayoutGrid,
            tag: 'CENTRALIZED INFORMATION',
            title: 'Informasi Terpusat',
            description:
                'Satu pintu untuk menelusuri informasi akademik. Cari konten yang relevan tanpa berpindah-pindah kanal.',
            linkLabel: 'Kembali ke Beranda',
            href: '#beranda',
        },
    ];

    return (
        <PublicLayout active="beranda">
            <Head title="Selamat Datang - PRAJA" />

            {/* Hero Section */}
            <section
                ref={heroAnim.ref}
                className={`min-h-screen flex flex-col items-center justify-center pt-20 pb-24 sm:pb-32 px-3 sm:px-6 md:px-8 w-full text-center relative overflow-hidden duration-700 delay-150 fill-mode-both ${
                    heroAnim.isInView
                        ? "animate-in fade-in zoom-in-95"
                        : "opacity-0"
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
                        Informasi Akademik, dalam Satu Ruang
                    </h1>
                    <p className="mt-3.5 text-medium sm:text-sm text-white/85 leading-relaxed font-bold max-w-xl mx-auto">
                        Jelajahi informasi kegiatan dan dokumen publik melalui
                        portal Platform Rencana, Aktivitas, dan Jejaring
                        Akademik (PRAJA). Temukan event akademik, dokumen
                        kebijakan, dan informasi terpusat untuk komunitas Telkom
                        University.
                    </p>
                </div>
            </section>
            <div className="w-full relative z-60 flex justify-center pointer-events-none -mt-[180px] -mb-[180px] sm:-mt-[180px] sm:-mb-[180px]">
                <img
                    src="/images/red-ribbon.png"
                    alt="Telkom Red Ribbon Divider"
                    className="w-full max-w-full h-auto object-cover sm:object-fill max-h-[220px] sm:max-h-[280px] select-none block"
                />
            </div>

            {/* Kenali PRAJA Section */}
            <section
                id="tentang"
                ref={aboutAnim.ref}
                className="pt-[130px] sm:pt-[280px] py-10 sm:py-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full relative z-20"
            >
                <div
                    className={`max-w-2xl mb-8 duration-700 ${
                        aboutAnim.isInView
                            ? "animate-in fade-in slide-in-from-bottom-4"
                            : "opacity-0"
                    }`}
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Kenali PRAJA
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        PRAJA menyatukan informasi event dan dokumen publik
                        dalam pengalaman yang sederhana, tertata, dan mudah
                        diakses oleh sivitas akademika maupun masyarakat.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {featureItems.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={item.tag}
                                className={`bg-[#FAFAFA] rounded-2xl p-6 border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between fill-mode-both ${
                                    aboutAnim.isInView
                                        ? "animate-in fade-in slide-in-from-bottom-6"
                                        : "opacity-0"
                                }`}
                                style={{
                                    animationDelay: aboutAnim.isInView
                                        ? `${(idx + 1) * 120}ms`
                                        : undefined,
                                    animationDuration: "600ms",
                                }}
                            >
                                <div>
                                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-[#b91c1c] shadow-2xs mb-4">
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <span className="block text-[9px] font-bold uppercase tracking-wider text-[#b91c1c]">
                                        {item.tag}
                                    </span>
                                    <h3 className="mt-1 text-base font-bold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-5">
                                    <a
                                        href={item.href}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b91c1c] hover:text-[#901418] transition-colors"
                                    >
                                        {item.linkLabel}
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Event Mendatang Section */}
            <section
                id="event"
                ref={eventAnim.ref}
                className="py-10 sm:py-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full"
            >
                <div
                    className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 duration-700 ${
                        eventAnim.isInView
                            ? "animate-in fade-in slide-in-from-bottom-4"
                            : "opacity-0"
                    }`}
                >
                    <div className="max-w-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            Event Mendatang
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Daftar event akademik yang sedang berlangsung dan
                            akan segera dibuka. Tampilkan hanya event yang sudah
                            dipublikasikan.
                        </p>
                    </div>

                    <Link
                        href="/agenda"
                        className="self-start sm:self-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-4 py-2 rounded-full shadow-2xs transition text-xs shrink-0"
                    >
                        Lihat Semua Event
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {eventsToDisplay.map((ev, idx) => (
                        <div
                            key={ev.id || idx}
                            className={`bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group fill-mode-both ${
                                eventAnim.isInView
                                    ? "animate-in fade-in slide-in-from-bottom-6"
                                    : "opacity-0"
                            }`}
                            style={{
                                animationDelay: eventAnim.isInView
                                    ? `${(idx + 1) * 120}ms`
                                    : undefined,
                                animationDuration: "600ms",
                            }}
                        >
                            <div>
                                {/* Thumbnail / Placeholder */}
                                <div className="h-40 sm:h-44 w-full rounded-xl overflow-hidden bg-[#64707d] flex items-center justify-center relative">
                                    {ev.poster_path ? (
                                        <img
                                            src={ev.poster_path}
                                            alt={ev.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="text-white/90 text-xs font-medium select-none">
                                            Gambar
                                        </span>
                                    )}
                                </div>

                                {/* Badge & Date */}
                                <div className="mt-3.5 flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#b91c1c] text-[10px] font-bold">
                                        {ev.division?.name || "Kategori"}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        {formatEventDate(ev.start_time)}
                                    </span>
                                </div>

                                {/* Title & Description */}
                                <h3 className="mt-2 font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                                    {ev.title}
                                </h3>
                                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                                    {ev.description ||
                                        "Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan."}
                                </p>
                            </div>

                            <div className="mt-4 pt-2">
                                {/* Time & Location */}
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>
                                        {formatEventTime(ev.start_time)}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">
                                        {ev.location ||
                                            ev.division?.name ||
                                            "Lokasi Kegiatan"}
                                    </span>
                                </div>

                                {ev.evidence_link ? (
                                    <a
                                        href={ev.evidence_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center bg-[#b91c1c] hover:bg-[#901418] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full transition"
                                    >
                                        Lihat Detail
                                    </a>
                                ) : (
                                    <Link
                                        href="/agenda"
                                        className="inline-flex items-center justify-center bg-[#b91c1c] hover:bg-[#901418] text-white text-[11px] font-semibold px-4 py-1.5 rounded-full transition"
                                    >
                                        Lihat Detail
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dokumen Publik Section */}
            <section
                id="dokumen"
                ref={docsAnim.ref}
                className="py-10 sm:py-14 pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full"
            >
                <div
                    className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 duration-700 ${
                        docsAnim.isInView
                            ? "animate-in fade-in slide-in-from-bottom-4"
                            : "opacity-0"
                    }`}
                >
                    <div className="max-w-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            Dokumen Publik
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Cari dokumen kebijakan, pedoman, dan publikasi resmi
                            yang diterbitkan oleh BPA. Tampilkan hanya dokumen
                            yang sudah dipublikasikan.
                        </p>
                    </div>

                    <Link
                        href="/dokumen"
                        className="self-start sm:self-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold px-4 py-2 rounded-full shadow-2xs transition text-xs shrink-0"
                    >
                        Lihat Semua Dokumen
                    </Link>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari dokumen, judul, atau kategori"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#b91c1c]"
                        />
                    </div>

                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="appearance-none w-full sm:w-auto pl-4 pr-8 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#b91c1c] cursor-pointer"
                        >
                            <option value="all">Semua Kategori</option>
                            <option value="kebijakan">Kebijakan</option>
                            <option value="proses_bisnis">Proses Bisnis</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Document Rows */}
                <div className="space-y-3">
                    {docsToDisplay.map((doc, idx) => {
                        const latestVer =
                            doc.versions && doc.versions.length > 0
                                ? doc.versions[0]
                                : null;
                        const docDate = formatEventDate(
                            doc.effective_date ||
                                latestVer?.created_at ||
                                doc.created_at,
                        );
                        const catLabel = formatDocCategory(
                            doc.category,
                            doc.subcategory,
                        );

                        return (
                            <div
                                key={doc.id || idx}
                                className="bg-white rounded-2xl border border-slate-200/80 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-red-50 text-[#b91c1c] flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                            {doc.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                            <span>{catLabel}</span>
                                            <span>•</span>
                                            <span>{docDate}</span>
                                            <span>•</span>
                                            <span>PDF</span>
                                            <span>•</span>
                                            <span>
                                                {doc.current_version || "v1.0"}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    {doc.id > 0 ? (
                                        <button
                                            type="button"
                                            onClick={() => openDocReview(doc)}
                                            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold transition"
                                        >
                                            Lihat Dokumen
                                        </button>
                                    ) : (
                                        <Link
                                            href="/dokumen"
                                            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-semibold transition"
                                        >
                                            Lihat Dokumen
                                        </Link>
                                    )}

                                    {latestVer ? (
                                        <a
                                            href={route(
                                                "documents.download",
                                                latestVer.id,
                                            )}
                                            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition"
                                        >
                                            Unduh
                                        </a>
                                    ) : (
                                        <Link
                                            href="/dokumen"
                                            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold transition"
                                        >
                                            Unduh
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

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
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
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
        </PublicLayout>
    );
}

