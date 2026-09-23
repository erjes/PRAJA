import React from 'react';
import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Card, CardContent } from '@/Components/ui/card';
import { History, FileText, User } from 'lucide-react';
import type { ReactNode } from 'react';

interface Log {
    id: number;
    action: string;
    created_at: string;
    document?: { id: number; title: string } | null;
    user?: { id: number; name: string; email: string } | null;
}

interface IndexProps {
    logs: Log[];
}

export default function Index({ logs }: IndexProps) {
    return (
        <>
            <Head title="Log Aktivitas Portal" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Log Aktivitas Portal</h1>
                    <p className="text-sm text-muted-foreground">
                        Audit historis tindakan pengunggahan, pembaruan versi, dan pengunduhan dokumen.
                    </p>
                </div>

                {/* Audit table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        {logs.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                <History className="h-12 w-12 opacity-30 mb-3" />
                                <p className="font-medium">Belum ada aktivitas tercatat</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Waktu Kejadian</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Pengguna</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Tindakan / Deskripsi</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Dokumen Terkait</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-xs">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <div>
                                                        <span className="block text-sm">{log.user?.name || 'Sistem'}</span>
                                                        <span className="block text-[10px] text-muted-foreground">{log.user?.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-foreground font-medium">
                                                {log.action}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.document ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                                        <span className="truncate max-w-[200px]" title={log.document.title}>
                                                            {log.document.title}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Activity Log', href: '/activity-logs' }]}
    >
        {page}
    </AppSidebarLayout>
);
