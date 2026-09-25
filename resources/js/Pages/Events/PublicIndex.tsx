import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { MapPin, CalendarDays, ExternalLink } from 'lucide-react';

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

function formatDateParts(dateStr?: string | null) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return {
        day: date.toLocaleDateString('id-ID', { day: '2-digit' }),
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        full: date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }),
        time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
}

function EventCard({ event, faded = false }: { event: EventItem; faded?: boolean }) {
    const parts = formatDateParts(event.start_time);
    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#901418]/50 transition-all duration-300 flex flex-col group w-full ${
                faded ? 'opacity-80' : ''
            }`}
        >
            <div className="h-44 sm:h-48 w-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
                {event.poster_path ? (
                    <img
                        src={event.poster_path}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="p-6 text-center w-full flex flex-col items-center justify-center bg-gray-100/90 h-full">
                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                            Agenda Kegiatan
                        </span>
                        <span className="text-gray-600 font-bold text-base sm:text-lg line-clamp-3 leading-snug">
                            {event.title}
                        </span>
                    </div>
                )}
                {faded && (
                    <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Selesai
                    </span>
                )}
            </div>

            <div className="p-4 sm:p-5 flex gap-4 flex-1 bg-white">
                <div className="flex flex-col items-center justify-center min-w-[50px] text-[#901418] font-bold shrink-0">
                    <span className="text-[11px] font-semibold leading-none">{parts.month}</span>
                    <span className="text-xl sm:text-2xl font-black leading-tight mt-0.5">{parts.day}</span>
                </div>

                <div className="w-[1px] bg-gray-200 shrink-0 self-stretch" />

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-[#901418] transition-colors">
                        {event.title}
                    </h3>
                    {event.location && (
                        <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                        </p>
                    )}
                    <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mt-1">
                        <CalendarDays className="w-3 h-3 shrink-0" />
                        <span>{parts.full}, {parts.time} WIB</span>
                    </p>
                    {event.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{event.description}</p>
                    )}
                    {event.evidence_link && (
                        <a
                            href={event.evidence_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#901418] hover:text-[#7a1014] mt-2.5"
                        >
                            Lihat detail
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PublicEventsIndex({ upcomingEvents = [], pastEvents = [] }: PageProps) {
    return (
        <PublicLayout active="agenda">
            <Head title="Event - PRAJA" />

            <section className="pt-14 pb-8 px-3 sm:px-6 md:px-8 w-full text-center max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Seluruh Event
                </h1>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Tetap terhubung dengan berbagai kegiatan akademik dan
                    pengembangan diri. Temukan informasi mengenai seminar,
                    workshop, pelatihan, dan acara lainnya.
                </p>
            </section>

            <section className="pb-10 px-3 sm:px-6 md:px-8 w-full max-w-6xl mx-auto">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-5 rounded-full bg-[#901418]" />
                    Akan Datang
                </h2>

                {upcomingEvents.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
                        Belum ada event mendatang yang dijadwalkan.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
                        {upcomingEvents.map((ev) => (
                            <EventCard key={ev.id} event={ev} />
                        ))}
                    </div>
                )}
            </section>

            {pastEvents.length > 0 && (
                <section className="pb-16 px-3 sm:px-6 md:px-8 w-full max-w-6xl mx-auto">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-5 rounded-full bg-slate-300" />
                        Telah Berlangsung
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
                        {pastEvents.map((ev) => (
                            <EventCard key={ev.id} event={ev} faded />
                        ))}
                    </div>
                </section>
            )}
        </PublicLayout>
    );
}
