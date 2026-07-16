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
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2, Edit, CheckSquare, LayoutList, Kanban, Clock, MessageSquare, Folder, Paperclip, MoreHorizontal, ChevronDown, AlertTriangle } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    division_id: number | null;
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

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');
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
    });

    // Form for editing event
    const editForm = useForm({
        title: '',
        description: '',
        start_date: '',
        start_time_only: '',
        end_date: '',
        end_time_only: '',
        start_time: '',
        end_time: '',
        division_id: 'company',
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
            const eventStart = new Date(event.start_time);
            return (
                eventStart.getDate() === date.getDate() &&
                eventStart.getMonth() === date.getMonth() &&
                eventStart.getFullYear() === date.getFullYear()
            );
        });
    };

    const currentMonthEvents = events.filter(event => {
        const eventStart = new Date(event.start_time);
        return eventStart.getMonth() === currentDate.getMonth() && eventStart.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const groupedEvents = currentMonthEvents.reduce((acc, event) => {
        const dateKey = new Date(event.start_time).toDateString();
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
            start_time: `${data.start_date} ${data.start_time_only || '08:00'}:00`,
            end_time: `${data.end_date} ${data.end_time_only || '17:00'}:00`,
        }));
        editForm.put(route('events.update', selectedEvent.id), {
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
        });
        setIsCreateOpen(true);
    };

    const openEdit = (event: Event) => {
        setSelectedEvent(event);
        const startObj = new Date(event.start_time);
        const endObj = new Date(event.end_time);
        const startDateStr = startObj.toISOString().slice(0, 10);
        const startTimeStr = startObj.toTimeString().slice(0, 5);
        const endDateStr = endObj.toISOString().slice(0, 10);
        const endTimeStr = endObj.toTimeString().slice(0, 5);

        editForm.setData({
            title: event.title,
            description: event.description,
            start_date: startDateStr,
            start_time_only: startTimeStr,
            end_date: endDateStr,
            end_time_only: endTimeStr,
            start_time: '',
            end_time: '',
            division_id: event.division_id ? String(event.division_id) : 'company',
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

                        <Button
                            type="button"
                            onClick={openCreate}
                            className="bg-[#901418] hover:bg-[#781014] text-white shadow-md font-bold px-5 py-2.5 h-auto rounded-xl transition-all flex items-center gap-2 self-start sm:self-center shrink-0"
                        >
                            <Plus className="h-4 w-4 stroke-[2.5]" />
                            <span>Buat Event</span>
                        </Button>
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
                <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    {/* Sub-toolbar (`+ Add Task` / `< Today >` controls) */}
                    <div className="flex justify-end flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-gray-200/80 bg-gray-50/50">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-lg font-bold text-gray-900 sm:ml-2">
                                {monthName}
                            </span>
                            <div className="flex items-center bg-white border border-gray-200/80 rounded-lg shadow-sm overflow-hidden">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 border-r border-gray-200/80 transition-colors"
                                    title="Bulan Sebelumnya"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentDate(new Date())}
                                    className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors tracking-wider uppercase"
                                >
                                    Hari Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="px-2.5 py-2 hover:bg-gray-100 text-gray-600 border-l border-gray-200/80 transition-colors"
                                    title="Bulan Selanjutnya"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {activeTab === "overview" ? (
                        <div className="flex flex-col bg-[#f9f9f9]/50 min-h-[500px]">
                            {/* Stat Banner */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-white border-b border-gray-200/80">
                                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418]">
                                        <CalendarIcon className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Total Agenda
                                        </p>
                                        <p className="text-2xl font-extrabold text-gray-900">
                                            {currentMonthEvents.length}{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                Event Bulan Ini
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#901418]/10 text-[#901418]">
                                        <Clock className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            BPA
                                        </p>
                                        <p className="text-2xl font-extrabold text-[#901418]">
                                            {
                                                currentMonthEvents.filter(
                                                    (e) => !e.division_id,
                                                ).length
                                            }{" "}
                                            <span className="text-xs font-normal text-gray-500">
                                                Agenda
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                        <Kanban className="size-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Agenda Divisi
                                        </p>
                                        <p className="text-2xl font-extrabold text-blue-600">
                                            {
                                                currentMonthEvents.filter(
                                                    (e) => e.division_id,
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
                                {currentMonthEvents.length === 0 ? (
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
                                                const dateObj = new Date(
                                                    dateString,
                                                );
                                                const isToday =
                                                    dateObj.toDateString() ===
                                                    new Date().toDateString();
                                                const isLastGroup =
                                                    groupIdx === arr.length - 1;

                                                return (
                                                    <div
                                                        key={dateString}
                                                        className="relative flex flex-col md:flex-row gap-4 md:gap-8 items-start"
                                                    >
                                                        {/* Vertical line connecting nodes */}
                                                        {!isLastGroup && (
                                                            <div className="absolute left-[31px] md:left-[55px] top-16 bottom-0 w-0.5 bg-gray-200/80 -mb-8 z-0" />
                                                        )}

                                                        {/* Date Badge Node */}
                                                        <div className="relative z-10 flex shrink-0 items-center md:items-end gap-3 md:flex-col md:w-[110px] md:text-right pt-1">
                                                            <div
                                                                className={`flex flex-col items-center justify-center size-16 rounded-2xl border transition-all ${
                                                                    isToday
                                                                        ? "bg-[#901418] text-white border-[#901418] shadow-md ring-4 ring-[#901418]/15 font-extrabold"
                                                                        : "bg-white text-gray-800 border-gray-200/80 shadow-xs"
                                                                }`}
                                                            >
                                                                <span className="text-2xl font-extrabold leading-none">
                                                                    {dateObj.getDate()}
                                                                </span>
                                                                <span
                                                                    className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isToday ? "text-white/90" : "text-gray-500"}`}
                                                                >
                                                                    {dateObj.toLocaleString(
                                                                        "id-ID",
                                                                        {
                                                                            month: "short",
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span
                                                                    className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-[#901418]" : "text-gray-500"}`}
                                                                >
                                                                    {isToday
                                                                        ? "Hari Ini"
                                                                        : dateObj.toLocaleString(
                                                                              "id-ID",
                                                                              {
                                                                                  weekday:
                                                                                      "long",
                                                                              },
                                                                          )}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Events Cards for this date */}
                                                        <div className="flex-1 w-full space-y-3 pt-1">
                                                            {dateEvents.map(
                                                                (event) => {
                                                                    const isCompany =
                                                                        !event.division_id;
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
                                                                            className="group relative bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#901418]/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full overflow-hidden"
                                                                        >
                                                                            {/* Left color bar accent */}
                                                                            <div
                                                                                className={`absolute top-0 bottom-0 left-0 w-1.5 ${isCompany ? "bg-[#901418]" : "bg-blue-500"}`}
                                                                            />

                                                                            <div className="flex-1 min-w-0 pl-2">
                                                                                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                                                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                                                                                        <Clock className="size-3.5 text-gray-400" />
                                                                                        {new Date(
                                                                                            event.start_time,
                                                                                        ).toLocaleTimeString(
                                                                                            "id-ID",
                                                                                            {
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                            },
                                                                                        )}
                                                                                        {
                                                                                            " - "
                                                                                        }
                                                                                        {new Date(
                                                                                            event.end_time,
                                                                                        ).toLocaleTimeString(
                                                                                            "id-ID",
                                                                                            {
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                            },
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#901418] transition-colors line-clamp-1">
                                                                                    {
                                                                                        event.title
                                                                                    }
                                                                                </h4>
                                                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                                    {event.description ||
                                                                                        "Tidak ada deskripsi tambahan."}
                                                                                </p>
                                                                            </div>

                                                                            <div className="flex items-center justify-between sm:justify-end gap-4 pl-2 sm:pl-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="size-7 rounded-full bg-[#901418] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                                                        {event.creator?.name
                                                                                            ?.charAt(
                                                                                                0,
                                                                                            )
                                                                                            .toUpperCase() ||
                                                                                            "P"}
                                                                                    </div>
                                                                                    <div className="text-left">
                                                                                        <p className="text-xs font-bold text-gray-800 leading-none truncate max-w-[100px]">
                                                                                            {event
                                                                                                .creator
                                                                                                ?.name ||
                                                                                                "Staff"}
                                                                                        </p>
                                                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                                                            Pembuat
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex items-center gap-1.5">
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
                                                                                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                                                                        title="Edit Event"
                                                                                    >
                                                                                        <Edit className="size-3.5" />
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
                                                                                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                                        title="Hapus Event"
                                                                                    >
                                                                                        <Trash2 className="size-3.5" />
                                                                                    </button>
                                                                                    <div className="size-8 rounded-lg border border-gray-200/80 flex items-center justify-center text-gray-400 group-hover:border-[#901418] group-hover:text-[#901418] transition-all">
                                                                                        <ChevronRight className="size-4" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
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
                                                                                {new Date(
                                                                                    event.start_time,
                                                                                ).toLocaleTimeString(
                                                                                    "id-ID",
                                                                                    {
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    },
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        {/* Title */}
                                                                        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover/card:text-[#901418] transition-colors">
                                                                            {
                                                                                event.title
                                                                            }
                                                                        </p>

                                                                        {/* Footer (icons and avatars matching Mondays) */}
                                                                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="flex items-center gap-0.5 font-medium">
                                                                                    <MessageSquare className="size-3" />{" "}
                                                                                    2
                                                                                </span>
                                                                                <span className="flex items-center gap-0.5 font-medium">
                                                                                    <Paperclip className="size-3" />{" "}
                                                                                    1
                                                                                </span>
                                                                            </div>
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
                <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
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
                            <InputError message={createForm.errors.title} className="mt-1" />
                        </div>
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
                            <InputError message={createForm.errors.description} className="mt-1" />
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
                                                createForm.setData("start_date", e.target.value)
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
                                            value={createForm.data.start_time_only}
                                            onChange={(e) =>
                                                createForm.setData("start_time_only", e.target.value)
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError message={createForm.errors.start_time || createForm.errors.start_date || createForm.errors.start_time_only} className="mt-1" />
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
                                                createForm.setData("end_date", e.target.value)
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
                                            value={createForm.data.end_time_only}
                                            onChange={(e) =>
                                                createForm.setData("end_time_only", e.target.value)
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError message={createForm.errors.end_time || createForm.errors.end_date || createForm.errors.end_time_only} className="mt-1" />
                            </div>
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
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl mt-1">
                                    {selectedEvent.title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Deskripsi Kegiatan
                                    </Label>
                                    <p className="text-sm whitespace-pre-wrap mt-1">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Mulai
                                        </Label>
                                        <p className="text-sm mt-0.5 font-medium">
                                            {new Date(
                                                selectedEvent.start_time,
                                            ).toLocaleString("id-ID", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Selesai
                                        </Label>
                                        <p className="text-sm mt-0.5 font-medium">
                                            {new Date(
                                                selectedEvent.end_time,
                                            ).toLocaleString("id-ID", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground border-t pt-3 flex justify-between">
                                    <span>
                                        Dibuat oleh:{" "}
                                        {selectedEvent.creator?.name ||
                                            "Sistem"}
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
                <DialogContent>
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
                            <InputError message={editForm.errors.title} className="mt-1" />
                        </div>
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
                            <InputError message={editForm.errors.description} className="mt-1" />
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
                                                editForm.setData("start_date", e.target.value)
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
                                            value={editForm.data.start_time_only}
                                            onChange={(e) =>
                                                editForm.setData("start_time_only", e.target.value)
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError message={editForm.errors.start_time || editForm.errors.start_date || editForm.errors.start_time_only} className="mt-1" />
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
                                                editForm.setData("end_date", e.target.value)
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
                                                editForm.setData("end_time_only", e.target.value)
                                            }
                                            required
                                            className="rounded-xl border-gray-200 bg-white focus:border-[#901418] font-medium text-center"
                                        />
                                    </div>
                                </div>
                                <InputError message={editForm.errors.end_time || editForm.errors.end_date || editForm.errors.end_time_only} className="mt-1" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-div">Kategori Event</Label>
                            <Select
                                value={editForm.data.division_id}
                                onValueChange={(val) =>
                                    editForm.setData("division_id", val)
                                }
                            >
                                <SelectTrigger id="edit-div">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="company">
                                        Perusahaan (Company-wide)
                                    </SelectItem>
                                    {divisions.map((div) => (
                                        <SelectItem
                                            key={div.id}
                                            value={String(div.id)}
                                        >
                                            Divisi: {div.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
            <Dialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
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
                                        {new Date(eventToDelete.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800/70 block">
                                        Waktu Selesai
                                    </span>
                                    <p className="text-xs font-medium text-gray-800">
                                        {new Date(eventToDelete.end_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
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
