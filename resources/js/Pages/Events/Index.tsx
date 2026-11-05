import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import InputError from '@/Components/InputError';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import TimePicker from '@/Components/ui/time-picker';
import DatePicker from '@/Components/ui/date-picker';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Trash2,
    Edit,
    CheckSquare,
    Clock,
    AlertTriangle,
    Link as LinkIcon,
    ExternalLink,
    MapPin,
    Users,
    Filter,
    X,
} from 'lucide-react';

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
    const user = auth?.user || {};

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
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const monthIndex = parseInt(m) - 1;
        const monthName = months[monthIndex] || m;

        return `${parseInt(d)} ${monthName} ${y}${timePart ? `, ${timePart}` : ''}`;
    };

    const formatTimelineDate = (dateStr?: string | null) => {
        if (!dateStr) return { time: '--:--', dateFormatted: '-' };
        const cleanStr = dateStr.replace(' ', 'T');
        const [datePart, timeRaw] = cleanStr.split('T');
        const time = timeRaw ? timeRaw.slice(0, 5) : '00:00';

        if (!datePart) return { time, dateFormatted: '-' };
        const [y, m, d] = datePart.split('-');

        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        const dayName = days[date.getDay()];
        const dayNum = parseInt(d);
        const monthName = months[parseInt(m) - 1] || m;

        return {
            time,
            dateFormatted: `${dayName}, ${dayNum} ${monthName}`,
        };
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

    // Filters state
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedDivision, setSelectedDivision] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const isFilterActive =
        selectedMonth !== 'all' ||
        selectedYear !== 'all' ||
        selectedDivision !== 'all' ||
        searchQuery.trim().length > 0;

    const resetFilters = () => {
        setSelectedMonth('all');
        setSelectedYear('all');
        setSelectedDivision('all');
        setSearchQuery('');
        setIsFilterOpen(false);
    };

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
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const monthDays = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    const getEventsForDate = (date: Date) => {
        return events.filter((event) => {
            const eventStart = parseLocal(event.start_time);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    // Filtered events list for timeline
    const filteredEvents = events
        .filter((event) => {
            // Category filter
            if (activeCategory === 'internal' && event.category && event.category !== 'internal') return false;
            if (activeCategory === 'public' && event.category !== 'public') return false;

            const eventStart = parseLocal(event.start_time);

            // Year filter
            if (selectedYear !== 'all' && eventStart.getFullYear() !== parseInt(selectedYear)) return false;

            // Month filter
            if (selectedMonth !== 'all' && eventStart.getMonth() !== parseInt(selectedMonth)) return false;

            // Division filter
            if (selectedDivision !== 'all' && String(event.division_id) !== selectedDivision) return false;

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = event.title?.toLowerCase().includes(query);
                const descMatch = event.description?.toLowerCase().includes(query);
                const locMatch = event.location?.toLowerCase().includes(query);
                if (!titleMatch && !descMatch && !locMatch) return false;
            }

            return true;
        })
        .sort((a, b) => parseLocal(a.start_time).getTime() - parseLocal(b.start_time).getTime());

    const isCreateTimeInvalid = () => {
        if (!createForm.data.start_date || !createForm.data.end_date) return false;
        const start = new Date(`${createForm.data.start_date}T${createForm.data.start_time_only || '08:00'}:00`).getTime();
        const end = new Date(`${createForm.data.end_date}T${createForm.data.end_time_only || '17:00'}:00`).getTime();
        return end <= start;
    };

    const isEditTimeInvalid = () => {
        if (!editForm.data.start_date || !editForm.data.end_date) return false;
        const start = new Date(`${editForm.data.start_date}T${editForm.data.start_time_only || '08:00'}:00`).getTime();
        const end = new Date(`${editForm.data.end_date}T${editForm.data.end_time_only || '17:00'}:00`).getTime();
        return end <= start;
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreateTimeInvalid()) {
            createForm.setError('end_time', 'Waktu selesai harus lebih besar dari waktu mulai.');
            return;
        }
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
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        if (isEditTimeInvalid()) {
            editForm.setError('end_time', 'Waktu selesai harus lebih besar dari waktu mulai.');
            return;
        }
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
            },
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
            },
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

    const currentYear = currentDate.getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    return (
        <>
            <Head title="Events" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#fafafa] min-h-screen">
                {/* Header Card */}
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#901418] shrink-0">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900">
                                Events
                            </h1>
                            <p className="text-xs font-normal text-gray-500 mt-0.5">
                                Kelola dan lihat kalender kegiatan
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-6 border-b border-gray-100 text-sm overflow-x-auto pb-px -mb-5 md:-mb-6 pt-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center gap-2 pb-3.5 transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'overview'
                                    ? 'border-b-2 border-[#901418] font-bold text-[#901418] -mb-px'
                                    : 'text-gray-500 font-normal hover:text-gray-800'
                            }`}
                        >
                            <CheckSquare
                                className={`size-4 ${activeTab === 'overview' ? 'text-[#901418]' : 'text-gray-400'}`}
                            />
                            <span>Timeline</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('calendar')}
                            className={`flex items-center gap-2 pb-3.5 transition-all duration-200 whitespace-nowrap ${
                                activeTab === 'calendar'
                                    ? 'border-b-2 border-[#901418] font-bold text-[#901418] -mb-px'
                                    : 'text-gray-500 font-normal hover:text-gray-800'
                            }`}
                        >
                            <CalendarIcon
                                className={`size-4 ${activeTab === 'calendar' ? 'text-[#901418]' : 'text-gray-400'}`}
                            />
                            <span>Calendar</span>
                        </button>
                    </div>
                </div>

                {/* Sub Toolbar (Categories, Filter, Tambah Acara) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 ${
                                activeCategory === 'all'
                                    ? 'bg-[#901418] text-white font-bold shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveCategory('internal')}
                            className={`px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 ${
                                activeCategory === 'internal'
                                    ? 'bg-[#901418] text-white font-bold shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal'
                            }`}
                        >
                            Internal
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveCategory('public')}
                            className={`px-4 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 ${
                                activeCategory === 'public'
                                    ? 'bg-[#901418] text-white font-bold shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal'
                            }`}
                        >
                            Eksternal
                        </button>
                    </div>

                    {/* Filter and Tambah Acara Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`bg-white border rounded-lg px-4 py-2 text-xs md:text-sm font-normal text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 shadow-xs ${
                                isFilterOpen || isFilterActive
                                    ? 'border-[#901418] text-[#901418]'
                                    : 'border-gray-200'
                            }`}
                        >
                            <Filter className="size-4 text-inherit" />
                            <span>Filter</span>
                            {isFilterActive && <span className="size-2 rounded-full bg-[#901418]" />}
                        </button>

                        <Button
                            type="button"
                            onClick={openCreate}
                            className="bg-[#901418] hover:bg-[#781014] text-white font-bold px-4 py-2 h-auto text-xs md:text-sm rounded-lg transition-all duration-200 shadow-xs flex items-center gap-2"
                        >
                            <span>Tambah Acara</span>
                        </Button>

                        {/* Floating Filter Popover */}
                        {isFilterOpen && (
                            <div className="absolute right-0 top-11 mt-1 w-80 bg-white border border-gray-200/90 rounded-2xl shadow-xl p-4 z-30 transition-all duration-200">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                        <Filter className="size-4 text-[#901418]" />
                                        <span>Filter Agenda</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>

                                <div className="space-y-3.5 py-3">
                                    {/* Search Input */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-gray-700">Pencarian</Label>
                                        <Input
                                            placeholder="Cari judul, lokasi, rincian..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-9 text-xs rounded-xl border-gray-200 font-normal focus:border-[#901418] focus:ring-[#901418]"
                                        />
                                    </div>

                                    {/* Month Selector */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-gray-700">Bulan</Label>
                                        <Select
                                            value={selectedMonth}
                                            onValueChange={(val) => setSelectedMonth(val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs rounded-xl border-gray-200 bg-white font-normal">
                                                <SelectValue placeholder="Pilih Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Bulan</SelectItem>
                                                {[
                                                    'Januari',
                                                    'Februari',
                                                    'Maret',
                                                    'April',
                                                    'Mei',
                                                    'Juni',
                                                    'Juli',
                                                    'Agustus',
                                                    'September',
                                                    'Oktober',
                                                    'November',
                                                    'Desember',
                                                ].map((m, idx) => (
                                                    <SelectItem key={idx} value={String(idx)}>
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Year Selector */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-gray-700">Tahun</Label>
                                        <Select
                                            value={selectedYear}
                                            onValueChange={(val) => setSelectedYear(val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs rounded-xl border-gray-200 bg-white font-normal">
                                                <SelectValue placeholder="Pilih Tahun" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Tahun</SelectItem>
                                                {years.map((y) => (
                                                    <SelectItem key={y} value={String(y)}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Division Selector */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-gray-700">Divisi</Label>
                                        <Select
                                            value={selectedDivision}
                                            onValueChange={(val) => setSelectedDivision(val)}
                                        >
                                            <SelectTrigger className="h-9 text-xs rounded-xl border-gray-200 bg-white font-normal">
                                                <SelectValue placeholder="Pilih Divisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Divisi</SelectItem>
                                                {divisions.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="text-xs font-normal text-gray-500 hover:text-[#901418] transition-colors"
                                    >
                                        Reset Filter
                                    </button>
                                    <Button
                                        type="button"
                                        onClick={() => setIsFilterOpen(false)}
                                        className="h-8 px-3 text-xs font-bold bg-[#901418] hover:bg-[#781014] text-white rounded-lg"
                                    >
                                        Terapkan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Views (Timeline vs Calendar) */}
                {activeTab === 'overview' ? (
                    <div className="flex flex-col gap-3.5">
                        {filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-200/80 rounded-2xl shadow-xs">
                                <div className="size-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
                                    <CalendarIcon className="size-6 stroke-[1.5]" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-800 mb-1">
                                    Belum Ada Agenda
                                </h3>
                                <p className="text-xs font-normal text-gray-500 max-w-sm mb-5">
                                    Tidak ada jadwal atau kegiatan yang tercatat sesuai kriteria saat ini.
                                </p>
                                <Button
                                    onClick={openCreate}
                                    className="bg-[#901418] hover:bg-[#781014] text-white font-bold text-xs px-4 py-2 rounded-lg h-auto"
                                >
                                    Tambah Acara
                                </Button>
                            </div>
                        ) : (
                            filteredEvents.map((event) => {
                                const { time, dateFormatted } = formatTimelineDate(event.start_time);
                                const isInternal = !event.category || event.category === 'internal';

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => openDetail(event)}
                                        className="bg-white border border-gray-200/80 rounded-2xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                                    >
                                        {/* Left: Time & Day/Date */}
                                        <div className="w-full md:w-36 shrink-0 flex flex-row md:flex-col items-baseline md:items-start justify-between md:justify-center gap-0.5">
                                            <span className="text-base md:text-lg font-bold text-gray-900 leading-tight">
                                                {time}
                                            </span>
                                            <span className="text-xs md:text-sm font-normal text-gray-500">
                                                {dateFormatted}
                                            </span>
                                        </div>

                                        {/* Middle: Title, Description, Location, Participants */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#901418] transition-colors truncate">
                                                {event.title}
                                            </h3>
                                            <p className="text-xs md:text-sm font-normal text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                {event.description || 'Tidak ada deskripsi kegiatan.'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-5 mt-2.5 text-xs font-normal text-gray-500">
                                                {event.location && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="size-3.5 text-gray-400 shrink-0" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="size-3.5 text-gray-400 shrink-0" />
                                                    <span>
                                                        {event.division
                                                            ? event.division.name
                                                            : isInternal
                                                              ? 'Internal BPA'
                                                              : 'Eksternal BPA'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Badge */}
                                        <div className="flex items-center justify-end shrink-0">
                                            {isInternal ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-normal bg-red-50 text-red-600">
                                                    Internal
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-normal bg-blue-50 text-blue-600">
                                                    Eksternal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    /* Calendar View */
                    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                        {/* Month navigation */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200/80 bg-gray-50/50">
                            <h2 className="text-base font-bold text-gray-900 tracking-tight">
                                {monthName}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevMonth}
                                    className="h-8 w-8 p-0 rounded-lg border-gray-200 font-normal"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentDate(new Date())}
                                    className="h-8 px-3 text-xs font-normal rounded-lg border-gray-200"
                                >
                                    Hari Ini
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextMonth}
                                    className="h-8 w-8 p-0 rounded-lg border-gray-200 font-normal"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Days of week */}
                        <div className="grid grid-cols-7 border-b border-gray-200/80 bg-gray-50/80 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                                <div key={day} className="py-3.5 border-r border-gray-200/80 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days matrix */}
                        <div className="grid grid-cols-7 bg-gray-200/80 gap-px">
                            {monthDays.map((day, i) => {
                                const dayEvents = day ? getEventsForDate(day) : [];
                                const isToday = day && day.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-[140px] bg-white p-2.5 transition-colors hover:bg-gray-50/70 flex flex-col justify-between ${
                                            !day ? 'bg-gray-50/40' : ''
                                        }`}
                                    >
                                        {day ? (
                                            <>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span
                                                        className={`text-xs size-6 flex items-center justify-center rounded-full transition-all ${
                                                            isToday
                                                                ? 'bg-[#901418] text-white shadow-xs font-bold'
                                                                : 'text-gray-700 font-normal'
                                                        }`}
                                                    >
                                                        {day.getDate()}
                                                    </span>
                                                    {dayEvents.length > 0 && (
                                                        <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                            {dayEvents.length}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[160px] pr-0.5">
                                                    {dayEvents.map((event) => {
                                                        const isInternal = !event.category || event.category === 'internal';
                                                        const accentBarClass = isInternal ? 'bg-[#901418]' : 'bg-blue-500';

                                                        return (
                                                            <div
                                                                key={event.id}
                                                                onClick={() => openDetail(event)}
                                                                className="group/card relative bg-white border border-gray-200/80 rounded-xl p-2.5 shadow-2xs hover:shadow-sm hover:border-[#901418]/50 transition-all duration-200 cursor-pointer text-left flex flex-col gap-1 w-full"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className={`h-1.5 w-6 rounded-full ${accentBarClass}`} />
                                                                    <span className="text-[9px] font-normal text-gray-400">
                                                                        {formatTimeOnly(event.start_time)}
                                                                    </span>
                                                                </div>

                                                                <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover/card:text-[#901418] transition-colors">
                                                                    {event.title}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Event Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418]">
                                <CalendarIcon className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-gray-900">
                                    Buat Event Baru
                                </DialogTitle>
                                <p className="text-xs font-normal text-gray-500">
                                    Isi formulir di bawah ini untuk menambahkan jadwal kegiatan baru.
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="create-title" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Judul Kegiatan
                            </Label>
                            <Input
                                id="create-title"
                                placeholder="Contoh: Rapat Koordinasi Mingguan"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                required
                                className="rounded-xl border-gray-200 font-normal focus:border-[#901418] focus:ring-[#901418]"
                            />
                            <InputError message={createForm.errors.title} className="mt-1" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-category" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Kategori Agenda
                            </Label>
                            <select
                                id="create-category"
                                value={createForm.data.category || 'internal'}
                                onChange={(e) => createForm.setData('category', e.target.value as any)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-normal text-gray-800 focus:border-[#901418] focus:outline-none focus:ring-1 focus:ring-[#901418]"
                            >
                                <option value="internal">Internal</option>
                                <option value="public">Eksternal</option>
                            </select>
                            <p className="text-[11px] font-normal text-gray-400 mt-1">
                                Pilih <strong className="font-bold text-gray-600">Eksternal</strong> untuk event umum.
                            </p>
                        </div>
                        {createForm.data.category === 'public' && (
                            <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-2xl space-y-2">
                                <Label htmlFor="create-poster" className="text-xs font-bold text-[#901418] uppercase tracking-wider block">
                                    File Poster (Opsional)
                                </Label>
                                <Input
                                    id="create-poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        createForm.setData(
                                            'poster_file',
                                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                                        )
                                    }
                                    className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal text-xs py-1.5 cursor-pointer"
                                />
                                <p className="text-[11px] font-normal text-gray-600 leading-snug">
                                    Unggah file poster kegiatan untuk ditampilkan di Landing Page.
                                </p>
                                <InputError message={createForm.errors.poster_file} className="mt-1" />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor="create-desc" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Deskripsi Kegiatan
                            </Label>
                            <Textarea
                                id="create-desc"
                                placeholder="Jelaskan detail agenda atau rincian kegiatan..."
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                required
                                className="rounded-xl border-gray-200 font-normal focus:border-[#901418] focus:ring-[#901418] min-h-[90px]"
                            />
                            <InputError message={createForm.errors.description} className="mt-1" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="create-location" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Tempat Diselenggarakan
                            </Label>
                            <Input
                                id="create-location"
                                placeholder="Contoh: Ruang Rapat Utama"
                                value={createForm.data.location || ''}
                                onChange={(e) => createForm.setData('location', e.target.value)}
                                className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal"
                            />
                            <InputError message={createForm.errors.location} className="mt-1" />
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-[#901418]" />
                                    <span>Waktu Mulai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label htmlFor="create-start-date" className="text-[11px] font-normal text-gray-600">
                                            Tanggal
                                        </Label>
                                        <DatePicker
                                            id="create-start-date"
                                            value={createForm.data.start_date}
                                            onChange={(newStart) => {
                                                createForm.setData((prev) => ({
                                                    ...prev,
                                                    start_date: newStart,
                                                    end_date: prev.end_date < newStart ? newStart : prev.end_date,
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label htmlFor="create-start-time" className="text-[11px] font-normal text-gray-600">
                                            Jam Mulai
                                        </Label>
                                        <TimePicker
                                            id="create-start-time"
                                            value={createForm.data.start_time_only}
                                            onChange={(val) => createForm.setData('start_time_only', val)}
                                            label="Enter time"
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

                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-gray-600" />
                                    <span>Waktu Selesai Agenda</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label htmlFor="create-end-date" className="text-[11px] font-normal text-gray-600">
                                            Tanggal
                                        </Label>
                                        <DatePicker
                                            id="create-end-date"
                                            min={createForm.data.start_date}
                                            value={createForm.data.end_date}
                                            onChange={(newEnd) => createForm.setData('end_date', newEnd)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label htmlFor="create-end-time" className="text-[11px] font-normal text-gray-600">
                                            Jam Selesai
                                        </Label>
                                        <TimePicker
                                            id="create-end-time"
                                            value={createForm.data.end_time_only}
                                            onChange={(val) => createForm.setData('end_time_only', val)}
                                            label="Enter time"
                                        />
                                    </div>
                                </div>

                                {isCreateTimeInvalid() && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
                                        <AlertTriangle className="size-4 shrink-0 text-red-600" />
                                        <span>Waktu selesai tidak boleh sama atau kurang dari waktu mulai.</span>
                                    </div>
                                )}

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

                        <div className="pt-1">
                            <Label htmlFor="create-evidence-link" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Evidence (Opsional)
                            </Label>
                            <Input
                                id="create-evidence-link"
                                type="url"
                                placeholder="https://example.com/folder-evidence atau tautan drive..."
                                value={createForm.data.evidence_link || ''}
                                onChange={(e) => createForm.setData('evidence_link', e.target.value)}
                                className="mt-1 rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal"
                            />
                            <p className="text-[11px] font-normal text-gray-400 mt-1">
                                Masukkan URL tautan Google Drive, DropBox, atau dokumentasi lainnya jika ada.
                            </p>
                            <InputError message={createForm.errors.evidence_link} className="mt-1" />
                        </div>

                        <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-xl px-5 font-normal"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing || isCreateTimeInvalid()}
                                className="bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <DialogTitle className="text-xl font-bold leading-snug">
                                        {selectedEvent.title}
                                    </DialogTitle>
                                    <span
                                        className={`w-fit px-3 py-1 rounded-md text-xs font-normal shrink-0 ${
                                            selectedEvent.category === 'public'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-red-50 text-red-600'
                                        }`}
                                    >
                                        {selectedEvent.category === 'public' ? 'Eksternal' : 'Internal'}
                                    </span>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label className="text-xs font-normal text-muted-foreground">
                                        Deskripsi Kegiatan
                                    </Label>
                                    <p className="text-sm font-normal whitespace-pre-wrap mt-1 text-gray-800 leading-relaxed">
                                        {selectedEvent.description || 'Tidak ada deskripsi.'}
                                    </p>
                                </div>
                                {selectedEvent.location && (
                                    <div className="mt-4">
                                        <Label className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
                                            <MapPin className="size-3.5 text-[#901418]" />
                                            <span>Tempat Diselenggarakan</span>
                                        </Label>
                                        <p className="text-sm mt-1 text-gray-800">
                                            {/^(https?:\/\/|www\.)/i.test(selectedEvent.location) ? (
                                                <a
                                                    href={
                                                        selectedEvent.location.startsWith('http')
                                                            ? selectedEvent.location
                                                            : `https://${selectedEvent.location}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline transition-colors break-all flex items-center gap-1.5 font-normal"
                                                >
                                                    {selectedEvent.location}
                                                    <ExternalLink className="size-3" />
                                                </a>
                                            ) : (
                                                <span className="font-bold">
                                                    {selectedEvent.location}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
                                    <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                            <Clock className="size-3.5 text-[#901418]" />
                                            <span>Waktu Mulai</span>
                                        </Label>
                                        <p className="text-sm mt-1 font-bold text-gray-900">
                                            {formatDisplayDateTime(selectedEvent.start_time)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                                            <Clock className="size-3.5 text-gray-600" />
                                            <span>Waktu Selesai</span>
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
                                            <span>Link Evidence / Bukti Kegiatan</span>
                                        </Label>
                                        <a
                                            href={selectedEvent.evidence_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center gap-2 p-3 rounded-xl bg-red-50/70 border border-red-100 text-sm font-normal text-[#901418] hover:bg-red-50 transition-colors w-full break-all"
                                        >
                                            <ExternalLink className="size-4 shrink-0 text-[#901418]" />
                                            <span className="line-clamp-2">
                                                {selectedEvent.evidence_link}
                                            </span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1 font-bold">
                                            <LinkIcon className="size-3.5 text-gray-400" />
                                            <span>Link Evidence / Bukti Kegiatan</span>
                                        </Label>
                                        <p className="text-xs font-normal text-gray-400 italic bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                            Belum ada tautan evidence yang dilampirkan pada agenda ini.
                                        </p>
                                    </div>
                                )}
                                <div className="text-xs font-normal text-muted-foreground border-t pt-3 flex items-center justify-between">
                                    <span>
                                        Dibuat oleh:{' '}
                                        <strong className="font-bold text-gray-700">
                                            {selectedEvent.creator?.name || 'Sistem'}
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
                                        className="rounded-xl px-4 font-normal"
                                    >
                                        <Edit className="mr-2 size-4" />
                                        <span>Edit Event</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleDelete(selectedEvent)}
                                        className="flex items-center gap-1.5 bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-4 mr-auto font-bold transition-colors"
                                    >
                                        <Trash2 className="size-4" />
                                        <span>Hapus</span>
                                    </Button>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDetailOpen(false)}
                                    className="rounded-xl px-4 font-normal"
                                >
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Event Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Edit Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-title" className="text-xs font-bold text-gray-700">Judul Kegiatan</Label>
                            <Input
                                id="edit-title"
                                value={editForm.data.title}
                                onChange={(e) => editForm.setData('title', e.target.value)}
                                required
                                className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                            />
                            <InputError message={editForm.errors.title} className="mt-1" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-category" className="text-xs font-bold text-gray-700">Kategori Agenda</Label>
                            <select
                                id="edit-category"
                                value={editForm.data.category || 'internal'}
                                onChange={(e) => editForm.setData('category', e.target.value as any)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-800 focus:border-[#901418] focus:outline-none focus:ring-1 focus:ring-[#901418]"
                            >
                                <option value="internal">Internal</option>
                                <option value="public">Eksternal</option>
                            </select>
                        </div>
                        {editForm.data.category === 'public' && (
                            <div className="p-3.5 bg-red-50/60 border border-red-100 rounded-2xl space-y-2">
                                <Label
                                    htmlFor="edit-poster"
                                    className="text-xs font-bold text-[#901418] uppercase tracking-wider flex items-center justify-between"
                                >
                                    <span>File Poster (Opsional)</span>
                                    {selectedEvent?.poster_path && (
                                        <span className="text-[10px] font-normal text-gray-500">
                                            Sudah ada poster tersimpan
                                        </span>
                                    )}
                                </Label>
                                <Input
                                    id="edit-poster"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        editForm.setData(
                                            'poster_file',
                                            e.target.files && e.target.files[0] ? e.target.files[0] : null
                                        )
                                    }
                                    className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal text-xs py-1.5 cursor-pointer"
                                />
                                <InputError message={editForm.errors.poster_file} className="mt-1" />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="edit-desc" className="text-xs font-bold text-gray-700">Deskripsi</Label>
                            <Textarea
                                id="edit-desc"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                required
                                className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                            />
                            <InputError message={editForm.errors.description} className="mt-1" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-location" className="text-xs font-bold text-gray-700">
                                Tempat Diselenggarakan
                            </Label>
                            <Input
                                id="edit-location"
                                placeholder="Contoh: Ruang Rapat Utama"
                                value={editForm.data.location || ''}
                                onChange={(e) => editForm.setData('location', e.target.value)}
                                className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal"
                            />
                            <InputError message={editForm.errors.location} className="mt-1" />
                        </div>
                        <div className="space-y-3 pt-1">
                            {/* Waktu Mulai */}
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-[#901418]" />
                                    <span>Waktu Mulai</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label htmlFor="edit-start-date" className="text-[11px] font-normal text-gray-600">
                                            Tanggal
                                        </Label>
                                        <DatePicker
                                            id="edit-start-date"
                                            value={editForm.data.start_date}
                                            onChange={(newStart) => {
                                                editForm.setData((prev) => ({
                                                    ...prev,
                                                    start_date: newStart,
                                                    end_date: prev.end_date < newStart ? newStart : prev.end_date,
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label htmlFor="edit-start-time" className="text-[11px] font-normal text-gray-600">
                                            Jam Mulai
                                        </Label>
                                        <TimePicker
                                            id="edit-start-time"
                                            value={editForm.data.start_time_only}
                                            onChange={(val) => editForm.setData('start_time_only', val)}
                                            label="Enter time"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Waktu Selesai */}
                            <div className="p-3.5 bg-gray-50/70 border border-gray-200/80 rounded-2xl space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    <Clock className="size-3.5 text-gray-600" />
                                    <span>Waktu Selesai</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                    <div className="sm:col-span-3 space-y-1">
                                        <Label htmlFor="edit-end-date" className="text-[11px] font-normal text-gray-600">
                                            Tanggal
                                        </Label>
                                        <DatePicker
                                            id="edit-end-date"
                                            min={editForm.data.start_date}
                                            value={editForm.data.end_date}
                                            onChange={(newEnd) => editForm.setData('end_date', newEnd)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <Label htmlFor="edit-end-time" className="text-[11px] font-normal text-gray-600">
                                            Jam Selesai
                                        </Label>
                                        <TimePicker
                                            id="edit-end-time"
                                            value={editForm.data.end_time_only}
                                            onChange={(val) => editForm.setData('end_time_only', val)}
                                            label="Enter time"
                                        />
                                    </div>
                                </div>

                                {isEditTimeInvalid() && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
                                        <AlertTriangle className="size-4 shrink-0 text-red-600" />
                                        <span>Waktu selesai tidak boleh sama atau kurang dari waktu mulai.</span>
                                    </div>
                                )}

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

                        {/* Evidence link */}
                        <div className="pt-1">
                            <Label htmlFor="edit-evidence-link" className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                <LinkIcon className="size-3.5 text-[#901418]" />
                                <span>Link Evidence / Bukti Kegiatan (Opsional)</span>
                            </Label>
                            <Input
                                id="edit-evidence-link"
                                type="url"
                                placeholder="https://example.com/folder-evidence atau tautan drive..."
                                value={editForm.data.evidence_link || ''}
                                onChange={(e) => editForm.setData('evidence_link', e.target.value)}
                                className="mt-1 rounded-xl border-gray-200 bg-white focus:border-[#901418] font-normal"
                            />
                        </div>

                        <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="rounded-xl px-5 font-normal"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing || isEditTimeInvalid()}
                                className="bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <DialogContent className="max-w-md rounded-2xl p-6 overflow-hidden bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader className="flex flex-col items-center text-center gap-3 pt-2">
                        <div className="size-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="size-7 text-[#901418]" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Konfirmasi Hapus Agenda
                            </DialogTitle>
                            <DialogDescription className="text-sm font-normal text-gray-500">
                                Apakah Anda yakin ingin menghapus agenda atau kegiatan ini?
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {eventToDelete && (
                        <div className="my-3 p-4 rounded-xl bg-red-50/70 border border-red-100/80 space-y-2 text-left">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-red-800/70 block">
                                    Judul Kegiatan
                                </span>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                    {eventToDelete.title}
                                </p>
                            </div>
                            {eventToDelete.description && (
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Deskripsi
                                    </span>
                                    <p className="text-xs font-normal text-gray-600 line-clamp-2 mt-0.5">
                                        {eventToDelete.description}
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-red-200/60">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Waktu Mulai
                                    </span>
                                    <p className="text-xs font-normal text-gray-800">
                                        {new Date(eventToDelete.start_time).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Waktu Selesai
                                    </span>
                                    <p className="text-xs font-normal text-gray-800">
                                        {new Date(eventToDelete.end_time).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs font-normal text-amber-800 flex items-start gap-2.5">
                        <Trash2 className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                            Tindakan ini bersifat permanen. Data agenda yang dihapus tidak dapat dipulihkan kembali.
                        </span>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 mt-2 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEventToDelete(null)}
                            className="w-full sm:w-auto rounded-xl px-5 font-normal hover:bg-gray-100 border-gray-200"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={editForm.processing}
                            onClick={confirmDelete}
                            className="w-full sm:w-auto bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-xs transition-all flex items-center justify-center gap-2"
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

Index.layout = (page: React.ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'Events', href: '/events' }]}>
        {page}
    </AppSidebarLayout>
);
