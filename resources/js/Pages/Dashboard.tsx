import { Head, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';

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

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#f9f9f9] min-h-screen">
                {/* Greeting */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {greeting}, {user?.name}! 👋
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Berikut adalah ringkasan aktivitas portal hari ini.
                    </p>
                </div>

                {/* Stat Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="bg-white border-gray-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tugas Belum Selesai
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">{uncompletedTasks.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Event Bulan Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Kebijakan Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">{latestPolicies.length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detail grids */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Uncompleted Tasks */}
                    <Card className="bg-white border-gray-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/80 pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Tugas Belum Selesai</CardTitle>
                            <span className="rounded-full bg-[#901418]/10 px-2.5 py-0.5 text-xs font-semibold text-[#901418]">
                                {uncompletedTasks.length}
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {uncompletedTasks.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Semua tugas selesai! ✅
                                </p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {uncompletedTasks.slice(0, 6).map((task) => (
                                        <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#901418]" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-800">{task.title}</p>
                                                {task.project && (
                                                    <p className="text-xs text-muted-foreground">{task.project.title}</p>
                                                )}
                                            </div>
                                            <span className={`flex-shrink-0 text-xs font-medium capitalize ${statusColor[task.status]}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card className="bg-white border-gray-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/80 pb-3">
                            <CardTitle className="text-base font-semibold text-gray-900">Event Bulan Ini</CardTitle>
                            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                                {upcomingEvents.length}
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {upcomingEvents.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Tidak ada event bulan ini.
                                </p>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {upcomingEvents.slice(0, 6).map((event) => (
                                        <div key={event.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                                                <span className="text-base font-bold leading-tight">
                                                    {new Date(event.start_time).getDate()}
                                                </span>
                                                <span className="text-[9px] uppercase font-semibold">
                                                    {new Date(event.start_time).toLocaleString('id-ID', { month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-800">{event.title}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(event.start_time)}</p>
                                            </div>
                                            {!event.division_id && (
                                                <span className="flex-shrink-0 rounded-full bg-[#901418]/10 px-2 py-0.5 text-[10px] font-semibold text-[#901418]">
                                                    Company
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Latest Policy Docs */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
                        <CardTitle className="text-base font-semibold">Dokumen Kebijakan Terbaru</CardTitle>
                        <a href="/documents" className="text-xs font-medium text-primary hover:underline">
                            Lihat Semua →
                        </a>
                    </CardHeader>
                    <CardContent className="p-0">
                        {latestPolicies.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Belum ada dokumen kebijakan.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {latestPolicies.map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
                                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{doc.title}</p>
                                            <p className="text-xs text-muted-foreground">Diperbarui {formatDate(doc.updated_at)}</p>
                                        </div>
                                        <span className="flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                            {doc.current_version}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
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
