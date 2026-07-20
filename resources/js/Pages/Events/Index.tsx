import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/InputError';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit, CheckSquare, LayoutList, Kanban, Clock, MessageSquare, Folder, Paperclip, MoreHorizontal, ChevronDown, AlertTriangle, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    division_id: number | null;
    evidence_link?: string | null;
    location?: string | null;
    poster_path?: string | null;
    category?: 'internal' | 'public' | null;
    division?: { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
}

interface Division {
    id: number;
    name: string;
    description: string | null;
}

interface EventsProps {
    events: Event[];
    divisions: Division[];
}

export default function Index({ events, divisions }: EventsProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isStaff = user.role === 'staff';

    const parseLocal = (dateStr?: string | null) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.replace(' ', 'T'));
    };

    const formatDisplayDateTime = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        const cleanStr = dateStr.replace(' ', 'T');
        const [datePart, timePartRaw] = cleanStr.split('T');
        const timePart = timePartRaw ? timePartRaw.slice(0, 5) : '';
        
        if (!datePart) return dateStr;
        const [y, m, d] = datePart.split('-');
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        const monthIndex = parseInt(m) - 1;
        const monthName = months[monthIndex] || m;
        
        return `${parseInt(d)} ${monthName} ${y}${timePart ? `, ${timePart}` : ''}`;
    };

    const formatTimeOnly = (dateStr?: string | null) => {
        if (!dateStr) return '';
        const clean = dateStr.replace(' ', 'T');
        const parts = clean.split('T');
        return parts[1] ? parts[1].slice(0, 5) : '';
    };

    const formatLocalPart = (dateStr?: string | null, defaultTime = '08:00') => {
        if (!dateStr) return { date: new Date().toISOString().slice(0, 10), time: defaultTime };
        const clean = dateStr.replace(' ', 'T');
        const [datePart, timeRaw] = clean.split('T');
        const timePart = timeRaw ? timeRaw.slice(0, 5) : defaultTime;
        return { date: datePart || new Date().toISOString().slice(0, 10), time: timePart };
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');
    const [activeCategory, setActiveCategory] = useState<'all' | 'internal' | 'public'>('all');
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    // Form for creating event
    const createForm = useForm({
        title: '',
        description: '',
        start_date: '',
        start_time_only: '08:00',
        end_date: '',
        end_time_only: '17:00',
        start_time: '',
        end_time: '',
        division_id: user.division_id ? String(user.division_id) : 'company',
        evidence_link: '',
        location: '',
        category: 'internal' as 'internal' | 'public',
        poster_file: null as File | null,
    });

    // Form for editing event
    const editForm = useForm({
        _method: 'put',
        title: '',
        description: '',
        start_date: '',
        start_time_only: '',
        end_date: '',
        end_time_only: '',
        start_time: '',
        end_time: '',
        division_id: 'company',
        evidence_link: '',
        location: '',
        category: 'internal' as 'internal' | 'public',
        poster_file: null as File | null,
    });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week (0-6)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Shift first day of week: Sunday (0) to end of week, or adjust so Mon is index 0
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Fill leading empty slots
        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(null);
        }

        // Fill days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const monthDays = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventStart = parseLocal(event.start_time);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    const currentMonthEventsBase = events.filter(event => {
        const eventStart = parseLocal(event.start_time);
        return eventStart.getMonth() === currentDate.getMonth() && eventStart.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => parseLocal(a.start_time).getTime() - parseLocal(b.start_time).getTime());

    const currentMonthEventsFiltered = currentMonthEventsBase.filter(event => {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'internal') return !event.category || event.category === 'internal';
        if (activeCategory === 'public') return event.category === 'public';
        return true;
    });

    const groupedEvents = currentMonthEventsFiltered.reduce((acc, event) => {
        const dateKey = parseLocal(event.start_time).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.transform((data) => ({
            ...data,
            start_time: `${data.start_date} ${data.start_time_only || '08:00'}:00`,
            end_time: `${data.end_date} ${data.end_time_only || '17:00'}:00`,
        }));
        createForm.post(route('events.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
            onError: (errors) => {
                console.error('Create event errors:', errors);
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        editForm.transform((data) => ({
            ...data,
            _method: 'put',
            start_time: `${data.start_date} ${data.start_time_only || '08:00'}:00`,
            end_time: `${data.end_date} ${data.end_time_only || '17:00'}:00`,
        }));
        editForm.post(route('events.update', selectedEvent.id), {
            forceFormData: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedEvent(null);
                editForm.reset();
            },
            onError: (errors) => {
                console.error('Edit event errors:', errors);
            }
        });
    };

    const handleDelete = (event: Event) => {
        setEventToDelete(event);
    };

    const confirmDelete = () => {
        if (!eventToDelete) return;
        editForm.delete(route('events.destroy', eventToDelete.id), {
            onSuccess: () => {
                setEventToDelete(null);
                setIsDetailOpen(false);
                setSelectedEvent(null);
            }
        });
    };

    const openCreate = () => {
        const today = new Date().toISOString().slice(0, 10);
        createForm.reset();
        createForm.clearErrors();
        createForm.setData({
            title: '',
            description: '',
            start_date: today,
            start_time_only: '08:00',
            end_date: today,
            end_time_only: '17:00',
            start_time: '',
            end_time: '',
            division_id: user.division_id ? String(user.division_id) : 'company',
            evidence_link: '',
            location: '',
            category: 'internal',
            poster_file: null,
        });
        setIsCreateOpen(true);
    };

    const openEdit = (event: Event) => {
        setSelectedEvent(event);
        const startParts = formatLocalPart(event.start_time, '08:00');
        const endParts = formatLocalPart(event.end_time, '17:00');

        editForm.setData({
            _method: 'put',
            title: event.title,
            description: event.description,
            start_date: startParts.date,
            start_time_only: startParts.time,
            end_date: endParts.date,
            end_time_only: endParts.time,
            start_time: '',
            end_time: '',
            division_id: event.division_id ? String(event.division_id) : 'company',
            evidence_link: event.evidence_link || '',
            location: event.location || '',
            category: event.category || 'internal',
            poster_file: null,
        });
        setIsDetailOpen(false);
        setIsEditOpen(true);
    };

    const openDetail = (event: Event) => {
        setSelectedEvent(event);
        setIsDetailOpen(true);
    };

    return (
        <>
            <Head title="Jadwal Event BPA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#f9f9f9] min-h-screen">
                {/* Mondays style Header Section */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418] shadow-sm">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                        Events
                                    </h1>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Kelola dan lihat kalender kegiatan internal
                                    BPA.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mondays style Tabs Bar */}
                    <div className="flex items-center gap-6 border-b border-gray-200/80 text-sm font-medium overflow-x-auto pb-px -mb-5 sm:-mb-6 pt-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center gap-2 pb-3.5 transition-colors whitespace-nowrap ${
                                activeTab === "overview"
                                    ? "border-b-2 border-[#901418] font-bold text-[#901418] -mb-px"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <CheckSquare
                                className={`size-4 ${activeTab === "overview" ? "text-[#901418]" : "text-gray-400"}`}
                            />
                            <span>Timeline</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("calendar")}
                            className={`flex items-center gap-2 pb-3.5 transition-colors whitespace-nowrap ${
                                activeTab === "calendar"
                                    ? "border-b-2 border-[#901418] font-bold text-[#901418] -mb-px"
                                    : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            <CalendarIcon
                                className={`size-4 ${activeTab === "calendar" ? "text-[#901418]" : "text-gray-400"}`}
                            />
                            <span>Calendar</span>
                        </button>
                    </div>
                </div>

                {/* Mondays style Calendar Container */}
                <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col ">
                    {/* Sub-toolbar (`+ Add Task` / `< Today >` controls) */}
                    {/* Sub-toolbar (`+ Add Task` / `< Bulan >` controls & Year/Month Filters) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-200/80 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight sm:ml-1">
                                {monthName}
                            </h2>
                        </div>

                        {/* Filter Bulan & Tahun di Kanan */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Select
                                value={String(currentDate.getMonth())}
                                onValueChange={(val) => {
                                    setCurrentDate(
                                        new Date(
                                            currentDate.getFullYear(),
                                            parseInt(val),
                                            1,
                                        ),
                                    );
                                }}
                            >
                                <SelectTrigger className="bg-white border border-gray-200/80 rounded-xl h-9 px-3 font-semibold text-xs text-gray-700 shadow-xs focus:ring-[#901418] w-[120px]">
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        "Januari",
                                        "Februari",
                                        "Maret",
                                        "April",
                                        "Mei",
                                        "Juni",
                                        "Juli",
                                        "Agustus",
                                        "September",
                                        "Oktober",
                                        "November",
                                        "Desember",
                                    ].map((m, idx) => (
                                        <SelectItem
                                            key={idx}
                                            value={String(idx)}
                                        >
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={String(currentDate.getFullYear())}
                                onValueChange={(val) => {
                                    setCurrentDate(
                                        new Date(
                                            parseInt(val),
                                            currentDate.getMonth(),
                                            1,
                                        ),
                                    );
                                }}
                            >
                                <SelectTrigger className="bg-white border border-gray-200/80 rounded-xl h-9 px-3 font-bold text-xs text-gray-800 shadow-xs focus:ring-[#901418] w-[95px]">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        currentDate.getFullYear() - 3,
                                        currentDate.getFullYear() - 2,
                                        currentDate.getFullYear() - 1,
                                        currentDate.getFullYear(),
                                        currentDate.getFullYear() + 1,
                                        currentDate.getFullYear() + 2,
                                        currentDate.getFullYear() + 3,
                                        currentDate.getFullYear() + 4,
                                        currentDate.getFullYear() + 5,
                                    ].map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                type="button"
                                onClick={openCreate}
                                className="bg-[#901418] hover:bg-[#781014] text-white shadow-md font-bold px-5 py-2.5 h-auto rounded-xl transition-all flex items-center gap-2 self-start sm:self-center shrink-0"
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                                <span>Buat Event</span>
                            </Button>
                        </div>
                    </div>

                    {activeTab === "overview" ? (
                        <div className="flex flex-col bg-[#f9f9f9]/50 min-h-[500px]">
                            {/* Stat Banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white border-b border-gray-200/80">
                                <div 
                                    onClick={() => setActiveCategory('all')}
                                    className={`rounded-xl p-4 border shadow-xs flex items-center gap-4 cursor-pointer transition-all ${activeCategory === 'all' ? 'bg-gray-100 border-gray-300 ring-2 ring-gray-200' : 'bg-gray-50/80 border-gray-200/80 hover:bg-gray-100'}`}
                                >
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418]">
                                        <CalendarIcon className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Total Agenda bulan ini
                                        </p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {currentMonthEventsBase.length}{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                Event
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => setActiveCategory('internal')}
                                    className={`rounded-xl p-4 border shadow-xs flex items-center gap-4 cursor-pointer transition-all ${activeCategory === 'internal' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200' : 'bg-gray-50/80 border-gray-200/80 hover:bg-orange-50/50'}`}
                                >
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                        <Clock className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Agenda Internal
                                        </p>
                                        <p className="text-2xl font-extrabold text-amber-600">
                                            {
                                                currentMonthEventsBase.filter(
                                                    (e) => !e.category || e.category === "internal"
                                                ).length
                                            }{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                Agenda
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => setActiveCategory('public')}
                                    className={`rounded-xl p-4 border shadow-xs flex items-center gap-4 cursor-pointer transition-all ${activeCategory === 'public' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200' : 'bg-gray-50/80 border-gray-200/80 hover:bg-blue-50/50'}`}
                                >
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                        <Kanban className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Agenda Umum
                                        </p>
                                        <p className="text-2xl font-extrabold text-blue-600">
                                            {
                                                currentMonthEventsBase.filter(
                                                    (e) => e.category === "public"
                                                ).length
                                            }{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                Agenda
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Content */}
                            <div className="p-6 md:p-8 flex-1">
                                {currentMonthEventsFiltered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-200/80 rounded-2xl shadow-xs max-w-xl mx-auto my-6">
                                        <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                                            <CalendarIcon className="size-8 stroke-[1.5]" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 mb-1">
                                            Belum Ada Agenda Bulan Ini
                                        </h3>
                                        <p className="text-sm text-gray-500 max-w-sm mb-6">
                                            Tidak ada jadwal atau kegiatan yang
                                            tercatat pada bulan {monthName}.
                                        </p>
                                        <Button
                                            onClick={openCreate}
                                            className="bg-[#901418] hover:bg-[#781014] text-white shadow-sm font-semibold px-5 py-2.5 rounded-xl h-auto"
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Buat Event Baru
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 max-w-4xl mx-auto w-full">
                                        {Object.entries(groupedEvents).map(
                                            (
                                                [dateString, dateEvents],
                                                groupIdx,
                                                arr,
                                            ) => {
                                                const dateObj = new Date(dateString);
                                                const isLastGroup = groupIdx === arr.length - 1;
                                                const firstEvent = dateEvents[0];
                                                const firstIsCompany = !firstEvent.division_id;
                                                const dateColor = firstIsCompany ? "text-[#901418]" : "text-blue-600";

                                                return (
                                                    <div key={dateString} className="relative flex flex-col md:flex-row gap-6 md:gap-10 items-start w-full group/timeline">
                                                        {/* Date Box (Left side) */}
                                                        <div className="flex-shrink-0 w-24 md:w-28 bg-white border border-gray-100 rounded-3xl py-5 flex flex-col items-center justify-center shadow-sm relative z-10 transition-shadow hover:shadow-md">
                                                            <span className={`text-[32px] font-extrabold leading-none ${dateColor}`}>{dateObj.getDate()}</span>
                                                            <span className="text-[11px] font-bold text-gray-500 uppercase mt-2.5 tracking-wider">{dateObj.toLocaleString("id-ID", { month: "short" })}</span>
                                                            <span className="text-[10px] font-semibold text-gray-400 uppercase mt-2.5 tracking-widest">{dateObj.toLocaleString("id-ID", { weekday: "long" })}</span>
                                                        </div>

                                                        {/* Timeline Vertical Line connecting dots */}
                                                        {!isLastGroup && (
                                                            <div className="absolute left-[48px] md:left-[140px] top-6 bottom-[-32px] w-px bg-gray-200 z-0 hidden md:block" />
                                                        )}

                                                        {/* Events Cards for this date */}
                                                        <div className="flex-1 w-full space-y-6 md:pt-1 relative z-10">
                                                            {dateEvents.map((event) => {
                                                                const isInternal = !event.category || event.category === 'internal';
                                                                const eventColorBg = isInternal ? "bg-[#901418]" : "bg-blue-500";
                                                                const eventColorText = isInternal ? "text-[#901418]" : "text-blue-500";
                                                                const eventColorLightBg = isInternal ? "bg-[#901418]/10" : "bg-blue-500/10";
                                                                
                                                                return (
                                                                    <div key={event.id} className="relative flex items-start w-full">
                                                                        {/* Dot on the timeline */}
                                                                        <div className={`absolute -left-[45.5px] top-7 w-3 h-3 rounded-full ring-4 ring-[#f9f9f9] shadow-sm z-10 hidden md:block ${eventColorBg}`} />

                                                                        {/* Card Content */}
                                                                        <div onClick={() => openDetail(event)} className="group bg-white border border-gray-100 rounded-[20px] shadow-sm hover:shadow-md transition-all cursor-pointer w-full overflow-hidden flex flex-col md:flex-row items-stretch">
                                                                            {/* Left Color Border */}
                                                                            <div className={`w-1.5 shrink-0 ${eventColorBg}`} />
                                                                            
                                                                            <div className="flex-1 p-5 md:p-6 flex flex-col w-full min-w-0 gap-5 md:gap-7">
                                                                                {/* Top Row: Info and Actions */}
                                                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 w-full">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2 mb-2.5 text-[13px] font-semibold text-gray-500">
                                                                                            <Clock className="size-4 text-gray-400" />
                                                                                            {formatTimeOnly(event.start_time)} - {formatTimeOnly(event.end_time)}
                                                                                        </div>
                                                                                        <h4 className="text-[17px] font-bold text-gray-900 group-hover:text-gray-700 transition-colors mb-2 truncate">
                                                                                            {event.title}
                                                                                        </h4>
                                                                                        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                                                                                            {event.description || "Tidak ada deskripsi tambahan."}
                                                                                        </p>
                                                                                    </div>
                                                                                    
                                                                                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 w-full md:w-auto">
                                                                                        {/* User */}
                                                                                        <div className="flex items-center gap-3.5">
                                                                                            <div className={`size-10 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm ${eventColorBg}`}>
                                                                                                {event.creator?.name?.charAt(0).toUpperCase() || "A"}
                                                                                            </div>
                                                                                            <div className="text-left flex flex-col">
                                                                                                <span className="text-[13px] font-bold text-gray-900 truncate max-w-[120px]">
                                                                                                    {event.creator?.name || "Administrator"}
                                                                                                </span>
                                                                                                <span className="text-[11px] font-semibold text-gray-400 mt-0.5">
                                                                                                    Pembuat
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                        
                                                                                        {/* Actions */}
                                                                                        <div className="flex items-center gap-2">
                                                                                            <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(event); }} className="size-[34px] rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center transition-colors">
                                                                                                <Edit className="size-4" />
                                                                                            </button>
                                                                                            <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(event); }} className="size-[34px] rounded-xl border border-red-100 bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                                                                                                <Trash2 className="size-4" />
                                                                                            </button>
                                                                                            <div className="size-[34px] rounded-xl border border-gray-200 bg-white text-gray-400 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                                                                                                <ChevronRight className="size-4" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Bottom Row: Badges */}
                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                                                                    <div className="flex flex-wrap gap-3">
                                                                                        {event.location && (
                                                                                            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold ${eventColorLightBg} ${eventColorText}`}>
                                                                                                <svg className="size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                                                                                {event.location}
                                                                                            </span>
                                                                                        )}
                                                                                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold ${eventColorLightBg} ${eventColorText}`}>
                                                                                            {isInternal ? "Internal" : "Umum"}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Days of week header */}
                            <div className="grid grid-cols-7 border-b border-gray-200/80 bg-gray-50/80 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                                {[
                                    "Sen",
                                    "Sel",
                                    "Rab",
                                    "Kam",
                                    "Jum",
                                    "Sab",
                                    "Min",
                                ].map((day) => (
                                    <div
                                        key={day}
                                        className="py-3.5 border-r border-gray-200/80 last:border-r-0"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days Matrix */}
                            <div className="grid grid-cols-7 bg-gray-200/80 gap-px">
                                {monthDays.map((day, i) => {
                                    const dayEvents = day
                                        ? getEventsForDate(day)
                                        : [];
                                    const isToday =
                                        day &&
                                        day.toDateString() ===
                                            new Date().toDateString();

                                    return (
                                        <div
                                            key={i}
                                            className={`min-h-[140px] bg-white p-2.5 transition-colors hover:bg-gray-50/70 flex flex-col justify-between ${
                                                !day ? "bg-gray-50/40" : ""
                                            }`}
                                        >
                                            {day ? (
                                                <>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span
                                                            className={`text-xs font-bold size-6 flex items-center justify-center rounded-full transition-all ${
                                                                isToday
                                                                    ? "bg-[#901418] text-white shadow-sm ring-4 ring-[#901418]/15 font-extrabold"
                                                                    : "text-gray-700 font-semibold"
                                                            }`}
                                                        >
                                                            {day.getDate()}
                                                        </span>
                                                        {dayEvents.length >
                                                            0 && (
                                                            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                                {
                                                                    dayEvents.length
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[160px] pr-0.5">
                                                        {dayEvents.map(
                                                            (event) => {
                                                                const isCompany =
                                                                    !event.division_id;
                                                                const accentBarClass =
                                                                    isCompany
                                                                        ? "bg-[#901418]"
                                                                        : "bg-blue-500";

                                                                return (
                                                                    <div
                                                                        key={
                                                                            event.id
                                                                        }
                                                                        onClick={() =>
                                                                            openDetail(
                                                                                event,
                                                                            )
                                                                        }
                                                                        className="group/card relative bg-white border border-gray-200/80 rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_14px_rgba(144,20,24,0.14)] hover:border-[#901418]/50 transition-all cursor-pointer text-left flex flex-col gap-1.5 w-full"
                                                                    >
                                                                        {/* Top colored status/category bar */}
                                                                        <div className="flex items-center justify-between">
                                                                            <span
                                                                                className={`h-1.5 w-7 rounded-full ${accentBarClass}`}
                                                                            />
                                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                                                                                {formatTimeOnly(event.start_time)}
                                                                            </span>
                                                                        </div>

                                                                        {/* Title */}
                                                                        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover/card:text-[#901418] transition-colors">
                                                                            {
                                                                                event.title
                                                                            }
                                                                        </p>

                                                                        {/* Footer (icons and avatars matching Mondays) */}
                                                                        <div className="flex items-center justify-end gap-1 mt-1 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        openEdit(
                                                                                            event,
                                                                                        );
                                                                                    }}
                                                                                    className="p-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                                                    title="Edit Event"
                                                                                >
                                                                                    <Edit className="size-3" />
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        handleDelete(
                                                                                            event,
                                                                                        );
                                                                                    }}
                                                                                    className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                                    title="Hapus Agenda"
                                                                                >
                                                                                    <Trash2 className="size-3" />
                                                                                </button>
                                                                                <div className="flex -space-x-1.5 overflow-hidden ml-1">
                                                                                    <div
                                                                                        className="size-5 rounded-full ring-1 ring-white bg-[#901418] text-[9px] font-bold text-white flex items-center justify-center shadow-xs"
                                                                                        title={
                                                                                            event
                                                                                                .creator
                                                                                                ?.name ||
                                                                                            "User"
                                                                                        }
                                                                                    >
                                                                                        {event.creator?.name
                                                                                            ?.charAt(
                                                                                                0,
                                                                                            )
                                                                                            .toUpperCase() ||
                                                                                            "P"}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Event Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-white-200/80 shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418]">
                                <CalendarIcon className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-gray-900">
                                    Buat Event Baru
                                </DialogTitle>
                                <p className="text-xs text-gray-500">
                                    Isi formulir di bawah ini untuk menambahkan
                                    jadwal kegiatan baru.
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    <form
                        onSubmit={handleCreateSubmit}
                        className="space-y-4 pt-2"
                    >
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="create-title"
                                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                                Judul Kegiatan
                            </Label>
                            <Input
                                id="create-title"
                                placeholder="Contoh: Rapat Koordinasi Mingguan"
                                value={createForm.data.title}
                                onChange={(e) =>
                                    createForm.setData("title", e.target.value)
                                }
                                required
                                className="rounded-xl border-gray-200 focus:border-[#901418] focus:ring-[#901418]"
                            />
                            <InputError
                                message={createForm.errors.title}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="create-category"
                                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                                Kategori Agenda
                            </Label>
                            <select
                                id="create-category"
                                value={createForm.data.category || "internal"}
                                onChange={(e) =>
                                    createForm.setData("category", e.target.value as any)
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 focus:border-[#901418] focus:outline-none focus:ring-1 focus:ring-[#901418]"
                            >
                                <option value="internal">Internal</option>
                                <option value="public">Publik</option>
                            </select>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Pilih <strong className="text-gray-600">Publik</strong> untuk event umum.
                            </p>
                        </div>
                        {createForm.data.category === "public" && (
                            <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-2xl space-y-2 animate-in fade-in duration-300">
                                <Label
                                    htmlFor="create-poster"
                                    className="text-xs font-bold text-[#901418] uppercase tracking-wider block"
                                >
                                    File Poster (Opsional)
                                </Label>
                                <Input
                                    id="create-poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        createForm.setData(
                                            "poster_file",
                                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                                        )
                                    }
                                    className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-xs py-1.5 cursor-pointer"
                                />
                                <p className="text-[11px] text-gray-600 leading-snug">
                                    Unggah file poster kegiatan untuk ditampilkan di Landing Page. Jika tidak dicantumkan, sistem akan menampilkan nama kegiatan dalam kotak abu-abu.
                                </p>
                                <InputError
                                    message={createForm.errors.poster_file}
                                    className="mt-1"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="create-desc"
                                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                                Deskripsi Kegiatan
                            </Label>
                            <Textarea
                                id="create-desc"
                                placeholder="Jelaskan detail agenda atau rincian kegiatan..."
                                value={createForm.data.description}
                                onChange={(e) =>
                                    createForm.setData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                required
                                className="rounded-xl border-gray-200 focus:border-[#901418] focus:ring-[#901418] min-h-[90px]"
                            />
                            <InputError
                                message={createForm.errors.description}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="create-location"
                                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                                Tempat Diselenggarakan
                            </Label>
                            <Input
                                id="create-location"
                                placeholder="Contoh: Ruang Rapat Utama"
                                value={createForm.data.location || ""}
                                onChange={(e) =>
                                    createForm.setData(
                                        "location",
                                        e.target.value,
                                    )
                                }
                                className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                            />
                            <InputError
                                message={createForm.errors.location}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-[#901418]" />
                                    <span>Waktu Mulai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label
                                            htmlFor="create-start-date"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Tanggal
                                        </Label>
                                        <Input
                                            id="create-start-date"
                                            type="date"
                                            value={createForm.data.start_date}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    "start_date",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label
                                            htmlFor="create-start-time"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Jam
                                        </Label>
                                        <Input
                                            id="create-start-time"
                                            type="time"
                                            value={
                                                createForm.data.start_time_only
                                            }
                                            onChange={(e) =>
                                                createForm.setData(
                                                    "start_time_only",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        createForm.errors.start_time ||
                                        createForm.errors.start_date ||
                                        createForm.errors.start_time_only
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Waktu Selesai */}
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-gray-600" />
                                    <span>Waktu Selesai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label
                                            htmlFor="create-end-date"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Tanggal
                                        </Label>
                                        <Input
                                            id="create-end-date"
                                            type="date"
                                            value={createForm.data.end_date}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    "end_date",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label
                                            htmlFor="create-end-time"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Jam
                                        </Label>
                                        <Input
                                            id="create-end-time"
                                            type="time"
                                            value={
                                                createForm.data.end_time_only
                                            }
                                            onChange={(e) =>
                                                createForm.setData(
                                                    "end_time_only",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        createForm.errors.end_time ||
                                        createForm.errors.end_date ||
                                        createForm.errors.end_time_only
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Link Evidence (Optional) */}
                        <div className="pt-1">
                            <Label
                                htmlFor="create-evidence-link"
                                className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                            >
                                Evidence (Optional)
                            </Label>
                            <Input
                                id="create-evidence-link"
                                type="url"
                                placeholder="https://example.com/folder-evidence atau tautan drive..."
                                value={createForm.data.evidence_link || ""}
                                onChange={(e) =>
                                    createForm.setData(
                                        "evidence_link",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                Masukkan URL tautan Google Drive, DropBox, atau
                                dokumentasi lainnya jika ada.
                            </p>
                            <InputError
                                message={createForm.errors.evidence_link}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-xl px-5 font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-sm"
                            >
                                Simpan Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Event Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                                    <DialogTitle className="text-xl leading-snug">
                                        {selectedEvent.title}
                                    </DialogTitle>
                                    <span
                                        className={`w-fit px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                                            selectedEvent.category === "public"
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                        }`}
                                    >
                                        {selectedEvent.category === "public"
                                            ? "Publik "
                                            : "Internal "}
                                    </span>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Deskripsi Kegiatan
                                    </Label>
                                    <p className="text-sm whitespace-pre-wrap mt-1 text-gray-800">
                                        {selectedEvent.description || "Tidak ada deskripsi."}
                                    </p>
                                </div>
                                {selectedEvent.location && (
                                    <div className="mt-4">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <svg className="size-3.5 text-[#901418]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                            Tempat Diselenggarakan
                                        </Label>
                                        <p className="text-sm mt-1 text-gray-800">
                                            {/^(https?:\/\/|www\.)/i.test(selectedEvent.location) ? (
                                                <a 
                                                    href={selectedEvent.location.startsWith('http') ? selectedEvent.location : `https://${selectedEvent.location}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline hover:text-blue-800 transition-colors break-all flex items-center gap-1.5"
                                                >
                                                    {selectedEvent.location}
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            ) : (
                                                <span className="font-semibold">{selectedEvent.location}</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                                    <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                            <Clock className="size-3.5 text-[#901418]" />
                                            Waktu Mulai
                                        </Label>
                                        <p className="text-sm mt-1 font-bold text-gray-900">
                                            {formatDisplayDateTime(selectedEvent.start_time)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                            <Clock className="size-3.5 text-gray-600" />
                                            Waktu Selesai
                                        </Label>
                                        <p className="text-sm mt-1 font-bold text-gray-900">
                                            {formatDisplayDateTime(selectedEvent.end_time)}
                                        </p>
                                    </div>
                                </div>
                                {selectedEvent.poster_path && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2 font-bold">
                                            <span>Poster Kegiatan</span>
                                        </Label>
                                        <div className="rounded-xl overflow-hidden border border-gray-200 max-h-56 bg-gray-50 flex items-center justify-center p-1">
                                            <img
                                                src={selectedEvent.poster_path}
                                                alt="Poster Event"
                                                className="w-full h-auto max-h-52 object-contain rounded-lg"
                                            />
                                        </div>
                                    </div>
                                )}
                                {selectedEvent.evidence_link ? (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5 font-bold">
                                            <LinkIcon className="size-3.5 text-[#901418]" />
                                            Link Evidence / Bukti Kegiatan
                                        </Label>
                                        <a
                                            href={selectedEvent.evidence_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center gap-2 p-3 rounded-xl bg-red-50/70 border border-red-100 text-sm font-semibold text-[#901418] hover:bg-red-50 transition-colors w-full break-all shadow-2xs"
                                        >
                                            <ExternalLink className="size-4 shrink-0 text-[#901418]" />
                                            <span className="line-clamp-2">{selectedEvent.evidence_link}</span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1 font-bold">
                                            <LinkIcon className="size-3.5 text-gray-400" />
                                            Link Evidence / Bukti Kegiatan
                                        </Label>
                                        <p className="text-xs text-gray-400 italic bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                            Belum ada tautan evidence yang dilampirkan pada agenda ini.
                                        </p>
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground border-t pt-3 flex items-center justify-between">
                                    <span>
                                        Dibuat oleh:{" "}
                                        <strong className="text-gray-700">
                                            {selectedEvent.creator?.name || "Sistem"}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                            <DialogFooter className="flex items-center justify-between gap-2 border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => openEdit(selectedEvent)}
                                        className="rounded-xl px-4 font-semibold"
                                    >
                                        <Edit className="mr-2 size-4" />
                                        Edit Event
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(selectedEvent)
                                        }
                                        className="flex items-center gap-1.5 bg-[#901418] hover:bg-white-700 text-white rounded-xl px-4 mr-auto font-medium transition-colors"
                                    >
                                        <Trash2 className="size-4" />
                                        <span>Hapus</span>
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Event Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-title">Judul Kegiatan</Label>
                            <Input
                                id="edit-title"
                                value={editForm.data.title}
                                onChange={(e) =>
                                    editForm.setData("title", e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={editForm.errors.title}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-category">Kategori Agenda</Label>
                            <select
                                id="edit-category"
                                value={editForm.data.category || "internal"}
                                onChange={(e) =>
                                    editForm.setData("category", e.target.value as any)
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:border-[#901418] focus:outline-none focus:ring-1 focus:ring-[#901418]"
                            >
                                <option value="internal">Internal </option>
                                <option value="public">Publik </option>
                            </select>
                        </div>
                        {editForm.data.category === "public" && (
                            <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-2xl space-y-2 animate-in fade-in duration-300">
                                <Label
                                    htmlFor="edit-poster"
                                    className="text-xs font-bold text-[#901418] uppercase tracking-wider flex items-center justify-between"
                                >
                                    <span>File Poster (Opsional)</span>
                                    {selectedEvent?.poster_path && (
                                        <span className="text-[10px] text-gray-500 font-normal">Sudah ada poster tersimpan</span>
                                    )}
                                </Label>
                                <Input
                                    id="edit-poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        editForm.setData(
                                            "poster_file",
                                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                                        )
                                    }
                                    className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-xs py-1.5 cursor-pointer"
                                />
                                <p className="text-[11px] text-gray-600 leading-snug">
                                    Unggah file poster baru jika ingin menggantikan poster lama. Jika tidak ada/kosong, akan menampilkan poster lama atau kotak abu-abu.
                                </p>
                                <InputError
                                    message={editForm.errors.poster_file}
                                    className="mt-1"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="edit-desc">Deskripsi</Label>
                            <Textarea
                                id="edit-desc"
                                value={editForm.data.description}
                                onChange={(e) =>
                                    editForm.setData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                                required
                            />
                            <InputError
                                message={editForm.errors.description}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-location">Tempat Diselenggarakan</Label>
                            <Input
                                id="edit-location"
                                placeholder="Contoh: Ruang Rapat Utama"
                                value={editForm.data.location || ""}
                                onChange={(e) =>
                                    editForm.setData(
                                        "location",
                                        e.target.value,
                                    )
                                }
                                className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                            />
                            <InputError
                                message={editForm.errors.location}
                                className="mt-1"
                            />
                        </div>
                        <div className="space-y-3 pt-1">
                            {/* Waktu Mulai */}
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-[#901418]" />
                                    <span>Waktu Mulai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label
                                            htmlFor="edit-start-date"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Tanggal (Kalender)
                                        </Label>
                                        <Input
                                            id="edit-start-date"
                                            type="date"
                                            value={editForm.data.start_date}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    "start_date",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label
                                            htmlFor="edit-start-time"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Jam (Manual HH:mm)
                                        </Label>
                                        <Input
                                            id="edit-start-time"
                                            type="time"
                                            value={
                                                editForm.data.start_time_only
                                            }
                                            onChange={(e) =>
                                                editForm.setData(
                                                    "start_time_only",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        editForm.errors.start_time ||
                                        editForm.errors.start_date ||
                                        editForm.errors.start_time_only
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {/* Waktu Selesai */}
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-gray-600" />
                                    <span>Waktu Selesai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label
                                            htmlFor="edit-end-date"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Tanggal
                                        </Label>
                                        <Input
                                            id="edit-end-date"
                                            type="date"
                                            value={editForm.data.end_date}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    "end_date",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label
                                            htmlFor="edit-end-time"
                                            className="text-[11px] font-semibold text-gray-600"
                                        >
                                            Jam
                                        </Label>
                                        <Input
                                            id="edit-end-time"
                                            type="time"
                                            value={editForm.data.end_time_only}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    "end_time_only",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        editForm.errors.end_time ||
                                        editForm.errors.end_date ||
                                        editForm.errors.end_time_only
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Link Evidence (Optional) */}
                        <div className="pt-1">
                            <Label
                                htmlFor="edit-evidence-link"
                                className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
                            >
                                <LinkIcon className="size-3.5 text-[#901418]" />
                                <span>
                                    Link Evidence / Bukti Kegiatan (Opsional)
                                </span>
                            </Label>
                            <Input
                                id="edit-evidence-link"
                                type="url"
                                placeholder="https://example.com/folder-evidence atau tautan drive..."
                                value={editForm.data.evidence_link || ""}
                                onChange={(e) =>
                                    editForm.setData(
                                        "evidence_link",
                                        e.target.value,
                                    )
                                }
                                className="mt-1 rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">
                                Masukkan URL tautan Google Drive, DropBox, atau
                                dokumentasi lainnya jika ada.
                            </p>
                            <InputError
                                message={editForm.errors.evidence_link}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Event Confirmation Dialog */}
            <Dialog
                open={!!eventToDelete}
                onOpenChange={(open) => !open && setEventToDelete(null)}
            >
                <DialogContent className="max-w-md rounded-2xl p-6 overflow-hidden">
                    <DialogHeader className="flex flex-col items-center text-center gap-3 pt-2">
                        <div className="size-14 rounded-full bg-red-100 flex items-center justify-center shrink-0 shadow-inner">
                            <AlertTriangle className="size-7 text-[#901418]" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Konfirmasi Hapus Agenda
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                Apakah Anda yakin ingin menghapus agenda atau
                                kegiatan ini?
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {eventToDelete && (
                        <div className="my-3 p-4 rounded-xl bg-red-50/70 border border-red-100/80 space-y-2 text-left">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800/70 block">
                                    Judul Kegiatan
                                </span>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                    {eventToDelete.title}
                                </p>
                            </div>
                            {eventToDelete.description && (
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Deskripsi
                                    </span>
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                        {eventToDelete.description}
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-red-200/60">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Waktu Mulai
                                    </span>
                                    <p className="text-xs font-medium text-gray-800">
                                        {new Date(
                                            eventToDelete.start_time,
                                        ).toLocaleString("id-ID", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Waktu Selesai
                                    </span>
                                    <p className="text-xs font-medium text-gray-800">
                                        {new Date(
                                            eventToDelete.end_time,
                                        ).toLocaleString("id-ID", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
                        <Trash2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                            Tindakan ini bersifat permanen. Data agenda yang
                            dihapus tidak dapat dipulihkan kembali.
                        </span>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 mt-2 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEventToDelete(null)}
                            className="w-full sm:w-auto rounded-xl px-5 font-semibold hover:bg-gray-100 border-gray-200"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={editForm.processing}
                            onClick={confirmDelete}
                            className="w-full sm:w-auto bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="size-4" />
                            <span>Ya, Hapus</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Events', href: '/events' }]}
    >
        {page}
    </AppSidebarLayout>
);
