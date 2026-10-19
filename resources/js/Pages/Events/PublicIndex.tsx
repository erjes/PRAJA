import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import {
    MapPin,
    Calendar,
    Clock,
    Search,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from 'lucide-react';

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
    upcomingEvents: EventItem[];
    pastEvents: EventItem[];
    [key: string]: any;
}

const ITEMS_PER_PAGE = 6;

const templateEvents: EventItem[] = Array.from({ length: 6 }, (_, idx) => ({
    id: -(idx + 1),
    title: 'Judul Event',
    description:
        'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.',
    location: 'Lokasi Kegiatan',
    start_time: null,
    end_time: null,
    poster_path: null,
    division: { id: 0, name: 'Kategori' },
}));

function formatBadgeDate(dateStr?: string | null): { day: string; month: string } {
    if (!dateStr) {
        return { day: 'DD', month: 'BLN' };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        return { day: 'DD', month: 'BLN' };
    }
    return {
        day: d.toLocaleDateString('id-ID', { day: '2-digit' }),
        month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
    };
}

function formatFullDate(dateStr?: string | null): string {
    if (!dateStr) return 'DD Bulan YYYY';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'DD Bulan YYYY';
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatTimeRange(startStr?: string | null, endStr?: string | null): string {
    if (!startStr) return '00.00–00.00 WIB';
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return '00.00–00.00 WIB';

    const startTime = start
        .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        .replace(':', '.');

    if (endStr) {
        const end = new Date(endStr);
        if (!isNaN(end.getTime())) {
            const endTime = end
                .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                .replace(':', '.');
            return `${startTime}–${endTime} WIB`;
        }
    }

    return `${startTime} WIB`;
}

export default function PublicEventsIndex({
    upcomingEvents = [],
    pastEvents = [],
}: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

    const allRealEvents = [...upcomingEvents, ...pastEvents];
    const isUsingTemplate = allRealEvents.length === 0;

    const filteredEvents = isUsingTemplate
        ? templateEvents
        : allRealEvents.filter((ev) => {
              if (searchQuery.trim() === '') return true;
              const q = searchQuery.toLowerCase();
              const haystack = [
                  ev.title,
                  ev.description,
                  ev.location,
                  ev.division?.name,
              ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();
              return haystack.includes(q);
          });

    const totalItems = filteredEvents.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const paginatedEvents = filteredEvents.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE,
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <PublicLayout active="agenda">
            <Head title="Jelajahi Event - PRAJA" />

            {/* Top Header & Breadcrumb */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 pt-6 pb-8">
                    <nav className="flex items-center gap-2 text-xs mb-4">
                        <Link
                            href="/"
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Beranda
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-900">Event</span>
                    </nav>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
                        Jelajahi Event
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
                        Temukan ruang untuk belajar, berdiskusi, dan berkolaborasi. Jelajahi
                        kegiatan akademik yang terbuka untuk publik.
                    </p>
                </div>
            </section>

            {/* Main Event Listing Section */}
            <section className="bg-[#FAFAFA] py-8 sm:py-10 pb-16 px-4 sm:px-6 md:px-8 flex-1">
                <div className="max-w-7xl mx-auto w-full">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Cari nama atau topik event"
                            className="w-full pl-11 pr-5 py-3 rounded-full border border-slate-200/90 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9b1c1c] shadow-2xs"
                        />
                    </div>

                    {/* Section Header Bar */}
                    <div className="mt-6 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1.5">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                                Event mendatang
                            </h2>
                            <span className="text-xs text-slate-400">
                                / {totalItems} event
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Hanya event publik yang telah terbit
                        </span>
                    </div>

                    {/* Event Grid */}
                    {paginatedEvents.length === 0 ? (
                        <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200/80">
                            Tidak ada event yang cocok dengan pencarian Anda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedEvents.map((ev, idx) => {
                                const badgeDate = formatBadgeDate(ev.start_time);
                                const fullDate = formatFullDate(ev.start_time);
                                const timeRange = formatTimeRange(
                                    ev.start_time,
                                    ev.end_time,
                                );

                                return (
                                    <div
                                        key={ev.id || idx}
                                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div>
                                            {/* Image & Date Badge */}
                                            <div className="h-44 sm:h-48 w-full relative bg-[#64707d] overflow-hidden flex items-center justify-center">
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

                                                {/* Top-left Date Badge */}
                                                <div className="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 shadow-sm flex flex-col items-center justify-center min-w-[42px] text-center">
                                                    <span className="text-sm font-extrabold text-slate-900 leading-none">
                                                        {badgeDate.day}
                                                    </span>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#9b1c1c] mt-0.5 leading-none">
                                                        {badgeDate.month}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-5 pb-3">
                                                {/* Category Pill & Status */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#9b1c1c] text-[10px] font-semibold">
                                                        {ev.division?.name || 'Kategori'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {ev.id < 0
                                                            ? 'Contoh • Publik • Terbit'
                                                            : 'Publik • Terbit'}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="mt-2.5 font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                                                    {ev.title}
                                                </h3>

                                                {/* Description */}
                                                <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                    {ev.description ||
                                                        'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer Info & Button */}
                                        <div className="px-5 pb-5 pt-2">
                                            <div className="space-y-1.5 text-[11px] text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{fullDate}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{timeRange}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {ev.location ||
                                                            ev.division?.name ||
                                                            'Lokasi Kegiatan'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                {ev.evidence_link ? (
                                                    <a
                                                        href={ev.evidence_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 bg-[#9b1c1c] hover:bg-[#801515] text-white text-[11px] font-semibold px-4 py-2 rounded-full transition shadow-2xs"
                                                    >
                                                        <span>Lihat Detail</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedEvent(ev)}
                                                        className="inline-flex items-center gap-1.5 bg-[#9b1c1c] hover:bg-[#801515] text-white text-[11px] font-semibold px-4 py-2 rounded-full transition shadow-2xs"
                                                    >
                                                        <span>Lihat Detail</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom Info & Pagination */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">
                            Menampilkan {totalItems === 0 ? 0 : startIndex + 1}–
                            {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} dari{' '}
                            {totalItems} event{isUsingTemplate ? ' contoh' : ''}
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition ${
                                            page === safePage
                                                ? 'bg-[#9b1c1c] text-white shadow-2xs'
                                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ),
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                disabled={safePage >= totalPages}
                                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition"
                                aria-label="Halaman berikutnya"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Detail Modal */}
            <Dialog
                open={!!selectedEvent}
                onOpenChange={(open) => !open && setSelectedEvent(null)}
            >
                <DialogContent className="sm:max-w-lg rounded-2xl">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#9b1c1c] text-[10px] font-semibold">
                                        {selectedEvent.division?.name || 'Kategori'}
                                    </span>
                                </div>
                                <DialogTitle className="text-lg font-bold text-slate-900">
                                    {selectedEvent.title}
                                </DialogTitle>
                            </DialogHeader>

                            {selectedEvent.poster_path && (
                                <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100">
                                    <img
                                        src={selectedEvent.poster_path}
                                        alt={selectedEvent.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                {selectedEvent.description ||
                                    'Deskripsi singkat mengenai kegiatan atau event akademik yang dipublikasikan.'}
                            </p>

                            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#9b1c1c] shrink-0" />
                                    <span>{formatFullDate(selectedEvent.start_time)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#9b1c1c] shrink-0" />
                                    <span>
                                        {formatTimeRange(
                                            selectedEvent.start_time,
                                            selectedEvent.end_time,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#9b1c1c] shrink-0" />
                                    <span>
                                        {selectedEvent.location ||
                                            selectedEvent.division?.name ||
                                            'Lokasi Kegiatan'}
                                    </span>
                                </div>
                            </div>

                            {selectedEvent.evidence_link && (
                                <div className="pt-2">
                                    <a
                                        href={selectedEvent.evidence_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-[#9b1c1c] hover:bg-[#801515] text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                                    >
                                        <span>Buka Tautan Kegiatan</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}

