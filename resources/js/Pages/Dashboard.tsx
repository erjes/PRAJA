import { Head, usePage } from '@inertiajs/react';
import { ReactNode, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { CheckSquare, CalendarDays, BookOpen, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/Components/ui/input';

interface Task {
    id: number;
    title: string;
    status: string;
    due_date: string | null;
    project?: { id: number; title: string };
}

interface Event {
    id: number;
    title: string;
    start_time: string;
    division_id: number | null;
}

interface Policy {
    id: number;
    title: string;
    current_version: string;
    updated_at: string;
}

interface DashboardProps {
    uncompletedTasks?: Task[];
    upcomingEvents?: Event[];
    latestPolicies?: Policy[];
}

const statusColor: Record<string, string> = {
    pending: 'text-muted-foreground',
    in_progress: 'text-blue-600 dark:text-blue-400',
    review: 'text-amber-600 dark:text-amber-400',
    completed: 'text-green-600 dark:text-green-400',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function Dashboard({
    uncompletedTasks = [],
    upcomingEvents = [],
    latestPolicies = [],
}: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Selamat Pagi';
        if (h < 17) return 'Selamat Siang';
        return 'Selamat Sore';
    })();

    // Simple Calendar Logic
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Trigger animations after mount
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Progress Logic for Tasks
    const inProgressTasks = uncompletedTasks.filter(t => t.status === 'in_progress' || t.status === 'review').length;
    const totalUncompleted = uncompletedTasks.length;
    const progressPercent = totalUncompleted === 0 ? 0 : Math.round((inProgressTasks / totalUncompleted) * 100);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#f9f9f9] min-h-screen">
                {/* Greeting & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {greeting}, {user?.name}!
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Berikut adalah ringkasan aktivitas portal hari ini.
                        </p>
                    </div>
                    <div className="relative w-full sm:w-72 shadow-sm rounded-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari data..."
                            className="pl-9 bg-white border-gray-200/80 rounded-xl"
                        />
                    </div>
                </div>

                {/* Stat Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                    <Card className="bg-white border-gray-200/80 shadow-sm relative overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Tugas Aktif
                                <div className="p-2 bg-red-50 rounded-lg text-[#901418] transition-colors group-hover:bg-[#901418] group-hover:text-white">
                                    <CheckSquare className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">
                                {uncompletedTasks.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200/80 shadow-sm relative overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Event Bulan Ini
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">
                                {upcomingEvents.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200/80 shadow-sm relative overflow-hidden group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                                Kebijakan Baru
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">
                                {latestPolicies.length}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Uncompleted Tasks Preview */}
                        <Card className="bg-white border-gray-200/80 shadow-sm">
                            <CardHeader className="border-b border-gray-200/80 pb-4">
                                <div className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base font-bold text-gray-900">
                                            Tugas Aktif
                                        </CardTitle>
                                        <span className="rounded-full bg-[#901418]/10 px-2.5 py-0.5 text-xs font-semibold text-[#901418]">
                                            {uncompletedTasks.length}
                                        </span>
                                    </div>
                                    <a
                                        href="/tasks"
                                        className="text-xs font-bold text-[#901418] hover:underline flex items-center gap-1"
                                    >
                                        Lihat Semua{" "}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {uncompletedTasks.length === 0 ? (
                                    <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
                                        Semua tugas selesai!
                                    </p>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {uncompletedTasks
                                            .slice(0, 5)
                                            .map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group/task"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#901418]" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-[15px] font-bold text-gray-900 leading-tight">
                                                                    {task.title}
                                                                </p>
                                                                {task.project ? (
                                                                    <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
                                                                        {
                                                                            task
                                                                                .project
                                                                                .title
                                                                        }
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-xs font-medium text-muted-foreground mt-1 truncate">
                                                                        Tidak
                                                                        ada
                                                                        proyek
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`flex-shrink-0 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-gray-100 ${statusColor[task.status]}`}
                                                        >
                                                            {task.status.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between ml-5">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            <span>
                                                                Due:{" "}
                                                                {task.due_date
                                                                    ? formatDate(
                                                                          task.due_date,
                                                                      )
                                                                    : "Tidak ditentukan"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden flex">
                                                                <div
                                                                    className="bg-[#901418] h-full rounded-full transition-all duration-1000 ease-out"
                                                                    style={{
                                                                        width: isMounted ? (
                                                                            task.status === "in_progress"
                                                                                ? "50%"
                                                                                : task.status === "review"
                                                                                  ? "90%"
                                                                                  : "10%"
                                                                        ) : "0%",
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-600 w-6 text-right">
                                                                {task.status ===
                                                                "in_progress"
                                                                    ? "50%"
                                                                    : task.status ===
                                                                        "review"
                                                                      ? "90%"
                                                                      : "10%"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Events Preview */}
                        <Card className="bg-white border-gray-200/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/80 pb-4">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base font-bold text-gray-900">
                                        Event Bulan Ini
                                    </CardTitle>
                                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                                        {upcomingEvents.length}
                                    </span>
                                </div>
                                <a
                                    href="/events"
                                    className="text-xs font-bold text-[#901418] hover:underline flex items-center gap-1"
                                >
                                    Lihat Semua{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </a>
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcomingEvents.length === 0 ? (
                                    <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
                                        Tidak ada event bulan ini.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {upcomingEvents
                                            .slice(0, 4)
                                            .map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-white text-red-800 border border-red-100 shadow-xs">
                                                        <span className="text-lg font-black leading-none">
                                                            {new Date(
                                                                event.start_time,
                                                            ).getDate()}
                                                        </span>
                                                        <span className="text-[9px] uppercase font-bold mt-0.5">
                                                            {new Date(
                                                                event.start_time,
                                                            ).toLocaleString(
                                                                "id-ID",
                                                                {
                                                                    month: "short",
                                                                },
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-gray-800">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                                            {formatDate(
                                                                event.start_time,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Latest Policy Docs */}
                        <Card className="bg-white border-gray-200/80 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/80 pb-4">
                                <CardTitle className="text-base font-bold text-gray-900">
                                    Kebijakan Terbaru
                                </CardTitle>
                                <a
                                    href="/documents"
                                    className="text-xs font-bold text-[#901418] hover:underline flex items-center gap-1"
                                >
                                    Lihat Semua{" "}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </a>
                            </CardHeader>
                            <CardContent className="p-0">
                                {latestPolicies.length === 0 ? (
                                    <p className="py-8 text-center text-sm font-semibold text-muted-foreground">
                                        Belum ada dokumen kebijakan.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {latestPolicies
                                            .slice(0, 4)
                                            .map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-gray-800">
                                                            {doc.title}
                                                        </p>
                                                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                                            Diperbarui{" "}
                                                            {formatDate(
                                                                doc.updated_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span className="flex-shrink-0 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 shadow-2xs">
                                                        {doc.current_version}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Calendar Widget */}
                        <Card className="bg-white border-gray-200/80 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-gray-900">
                                        Kalender
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() -
                                                            1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setCurrentDate(
                                                    new Date(
                                                        currentDate.getFullYear(),
                                                        currentDate.getMonth() +
                                                            1,
                                                        1,
                                                    ),
                                                )
                                            }
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm font-black text-[#901418] mt-1.5 capitalize tracking-wide">
                                    {currentDate.toLocaleString("id-ID", {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black text-gray-400 mb-2 uppercase">
                                    <div>M</div>
                                    <div>S</div>
                                    <div>S</div>
                                    <div>R</div>
                                    <div>K</div>
                                    <div>J</div>
                                    <div>S</div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold">
                                    {Array.from({ length: firstDay }).map(
                                        (_, i) => (
                                            <div
                                                key={`empty-${i}`}
                                                className="p-2"
                                            ></div>
                                        ),
                                    )}
                                    {Array.from({ length: daysInMonth }).map(
                                        (_, i) => {
                                            const date = i + 1;
                                            const isToday =
                                                today.getDate() === date &&
                                                today.getMonth() ===
                                                    currentDate.getMonth() &&
                                                today.getFullYear() ===
                                                    currentDate.getFullYear();

                                            // Find events for this day
                                            const dayEvents =
                                                upcomingEvents.filter((e) => {
                                                    const eDate = new Date(
                                                        e.start_time,
                                                    );
                                                    return (
                                                        eDate.getDate() ===
                                                            date &&
                                                        eDate.getMonth() ===
                                                            currentDate.getMonth() &&
                                                        eDate.getFullYear() ===
                                                            currentDate.getFullYear()
                                                    );
                                                });

                                            const hasEvents =
                                                dayEvents.length > 0;
                                            const tooltipText = hasEvents
                                                ? dayEvents
                                                      .map((e) => e.title)
                                                      .join("\n")
                                                : undefined;

                                            return (
                                                <div
                                                    key={date}
                                                    className="relative group/day"
                                                >
                                                    <div
                                                        className={`p-2 rounded-lg flex flex-col items-center justify-center aspect-square ${isToday ? "bg-[#901418] text-white shadow-md ring-2 ring-red-100" : "hover:bg-gray-100 hover:text-gray-900 cursor-pointer text-gray-600"}`}
                                                    >
                                                        <span>{date}</span>
                                                        {hasEvents && (
                                                            <div
                                                                className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-[#901418]"}`}
                                                            ></div>
                                                        )}
                                                    </div>
                                                    {hasEvents && (
                                                        <div className="absolute z-50 invisible opacity-0 group-hover/day:visible group-hover/day:opacity-100 bottom-full mb-1 left-1/2 -translate-x-1/2 w-max max-w-[200px] bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl transition-all duration-200 pointer-events-none">
                                                            <div className="flex flex-col gap-1">
                                                                {dayEvents.map(
                                                                    (e) => (
                                                                        <span
                                                                            key={
                                                                                e.id
                                                                            }
                                                                            className="truncate flex items-center gap-1.5"
                                                                        >
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div>
                                                                            {
                                                                                e.title
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-gray-900"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}
    >
        {page}
    </AppSidebarLayout>
);
