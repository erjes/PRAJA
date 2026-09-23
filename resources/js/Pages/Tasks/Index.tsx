import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { CheckSquare, Calendar, AlertCircle, ExternalLink, ClipboardList, Link2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SubTask {
    id: number;
    title: string;
    is_completed: boolean;
}

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    due_date: string | null;
    start_date: string | null;
    brief_link: string | null;
    submission_link: string | null;
    revision_notes: string | null;
    review_status: 'pending' | 'approved' | 'revision' | null;
    urgency_label: 'Overdue' | 'Due Today' | 'Upcoming';
    project?: { id: number; title: string } | null;
    sub_tasks: SubTask[];
}

interface IndexProps {
    tasks: Task[];
}

const statusColors: Record<string, string> = {
    pending:     'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    review:      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 animate-pulse',
    completed:   'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
};

const statusLabels: Record<string, string> = {
    pending: 'Belum Mulai', in_progress: 'Berjalan', review: 'Butuh Review', completed: 'Selesai',
};

const urgencyColors: Record<string, string> = {
    Overdue:     'bg-red-100 text-red-700 border-red-200',
    'Due Today': 'bg-amber-100 text-amber-700 border-amber-200',
    Upcoming:    'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function Index({ tasks }: IndexProps) {
    const { auth } = usePage().props as any;

    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'review' | 'completed'>('all');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailOpen, setIsDetailOpen]   = useState(false);
    const [isSubmitOpen, setIsSubmitOpen]   = useState(false);

    const form       = useForm({});
    const submitForm = useForm({ submission_link: '', submission_notes: '' });

    const filteredTasks = tasks.filter(task => activeTab === 'all' || task.status === activeTab);

    const handleToggleSubTask = (subTaskId: number) => {
        form.post(route('subtasks.toggle', subTaskId), { preserveScroll: true });
    };

    const handleStatusChange = (taskId: number, newStatus: string) => {
        router.post(route('tasks.status', taskId), { status: newStatus }, { preserveScroll: true });
    };

    const openDetail = (task: Task) => {
        setSelectedTask(task);
        setIsDetailOpen(true);
    };

    const openSubmit = (task: Task) => {
        setSelectedTask(task);
        submitForm.reset();
        submitForm.setData('submission_link', task.submission_link ?? '');
        setIsSubmitOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        submitForm.post(route('tasks.submit', selectedTask.id), {
            onSuccess: () => { setIsSubmitOpen(false); setIsDetailOpen(false); },
        });
    };

    return (
        <>
            <Head title="Tugas Saya" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Tugas Saya</h1>
                    <p className="text-sm text-muted-foreground">
                        Lihat dan kelola rencana kerja serta tugas yang ditugaskan kepada Anda.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b overflow-x-auto gap-2 max-w-full text-sm">
                    {(['all', 'pending', 'in_progress', 'review', 'completed'] as const).map(tab => {
                        const count = tab === 'all' ? tasks.length : tasks.filter(t => t.status === tab).length;
                        const labelMap = {
                            all: 'Semua', pending: 'Belum Mulai',
                            in_progress: 'Berjalan', review: 'Review', completed: 'Selesai',
                        };
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 transition-all -mb-px flex items-center gap-1.5 ${
                                    activeTab === tab
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                                {labelMap[tab]}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tasks Grid */}
                <div key={activeTab} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in zoom-in-[0.99] slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                    {filteredTasks.length === 0 ? (
                        <Card className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
                            <ClipboardList className="h-12 w-12 opacity-30 mb-3" />
                            <p className="font-medium">Tidak ada tugas ditemukan</p>
                            <p className="text-sm">Anda tidak memiliki tugas di kategori ini.</p>
                        </Card>
                    ) : (
                        filteredTasks.map(task => {
                            const completedSub = task.sub_tasks.filter(s => s.is_completed).length;
                            const totalSub     = task.sub_tasks.length;

                            return (
                                <Card key={task.id} onClick={() => openDetail(task)}
                                    className="hover:border-primary/50 transition-all cursor-pointer shadow-sm border bg-card flex flex-col justify-between">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-muted truncate max-w-[120px]">
                                                {task.project?.title || 'Umum'}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[task.status]}`}>
                                                {statusLabels[task.status]}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base mt-2.5 line-clamp-1">{task.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 flex flex-col gap-2.5">
                                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                            {task.description}
                                        </p>

                                        {/* Urgency badge */}
                                        {(task.urgency_label === 'Overdue' || task.urgency_label === 'Due Today') && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border w-fit ${urgencyColors[task.urgency_label]}`}>
                                                {task.urgency_label === 'Overdue' ? '⚠ Overdue' : '⏰ Due Today'}
                                            </span>
                                        )}

                                        {/* Revision warning */}
                                        {task.review_status === 'revision' && task.revision_notes && (
                                            <p className="text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-1.5 rounded border border-amber-200 line-clamp-2">
                                                📝 {task.revision_notes}
                                            </p>
                                        )}

                                        {/* Subtask progress */}
                                        {totalSub > 0 && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/60 p-1 rounded px-2 w-fit">
                                                <CheckSquare className="h-3.5 w-3.5" />
                                                <span>Sub-tugas: {completedSub}/{totalSub}</span>
                                            </div>
                                        )}

                                        {/* Brief link */}
                                        {task.brief_link && (
                                            <a href={task.brief_link} target="_blank" rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center gap-1 text-[10px] text-primary hover:underline w-fit">
                                                <Link2 className="h-3 w-3" /> Buka Brief
                                            </a>
                                        )}

                                        <div className="flex items-center justify-between border-t pt-2.5 text-[11px] text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {task.due_date
                                                    ? `Tenggat: ${new Date(task.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}`
                                                    : 'Tanpa tenggat'}
                                            </div>
                                            <span className="text-primary font-medium">Buka Detail →</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Task Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {selectedTask && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium border bg-muted">
                                        {selectedTask.project?.title || 'Umum'}
                                    </span>
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusColors[selectedTask.status]}`}>
                                        {statusLabels[selectedTask.status]}
                                    </span>
                                    {selectedTask.urgency_label !== 'Upcoming' && (
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${urgencyColors[selectedTask.urgency_label]}`}>
                                            {selectedTask.urgency_label}
                                        </span>
                                    )}
                                </div>
                                <DialogTitle>{selectedTask.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2 text-sm">
                                {selectedTask.description && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Deskripsi Tugas</Label>
                                        <p className="mt-1 whitespace-pre-wrap">{selectedTask.description}</p>
                                    </div>
                                )}

                                {selectedTask.due_date && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground">Tenggat Waktu</Label>
                                        <p className="font-medium mt-0.5">
                                            {new Date(selectedTask.due_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                        </p>
                                    </div>
                                )}

                                {/* Revision notes */}
                                {selectedTask.review_status === 'revision' && selectedTask.revision_notes && (
                                    <div className="border-t pt-3 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200">
                                        <Label className="text-xs text-amber-700 font-semibold">📝 Catatan Revisi dari Reviewer</Label>
                                        <p className="mt-1 text-amber-800 dark:text-amber-300">{selectedTask.revision_notes}</p>
                                    </div>
                                )}

                                {/* Links */}
                                {selectedTask.brief_link && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground">Brief Link</Label>
                                        <a href={selectedTask.brief_link} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline mt-1">
                                            <ExternalLink className="h-3.5 w-3.5" /> Buka Brief
                                        </a>
                                    </div>
                                )}
                                {selectedTask.submission_link && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground">Submission Link</Label>
                                        <a href={selectedTask.submission_link} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline mt-1">
                                            <ExternalLink className="h-3.5 w-3.5" /> Buka Submission
                                        </a>
                                    </div>
                                )}

                                {/* Sub-tasks checklist */}
                                {selectedTask.sub_tasks.length > 0 && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground mb-2 block">Sub-tugas</Label>
                                        <div className="space-y-2">
                                            {selectedTask.sub_tasks.map(st => (
                                                <label key={st.id}
                                                    className={`flex items-center gap-2.5 p-2 border rounded-lg transition-colors cursor-pointer ${st.is_completed ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'hover:bg-muted/40'}`}>
                                                    <input type="checkbox" checked={st.is_completed}
                                                        onChange={() => handleToggleSubTask(st.id)}
                                                        className="rounded h-4 w-4" />
                                                    <span className={st.is_completed ? 'line-through text-muted-foreground' : ''}>{st.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Workflow actions */}
                                <div className="border-t pt-4">
                                    <Label className="text-xs text-muted-foreground block mb-2">Aksi</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTask.status === 'pending' && (
                                            <Button size="sm" onClick={() => handleStatusChange(selectedTask.id, 'in_progress')}>
                                                Mulai Kerjakan
                                            </Button>
                                        )}
                                        {selectedTask.status === 'in_progress' && (
                                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700"
                                                onClick={() => openSubmit(selectedTask)}>
                                                Serahkan untuk Review
                                            </Button>
                                        )}
                                        {selectedTask.status === 'review' && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                                                <AlertCircle className="h-4 w-4" />
                                                Menunggu review dari manajer.
                                            </p>
                                        )}
                                        {selectedTask.status === 'completed' && (
                                            <p className="text-xs text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded">
                                                ✅ Tugas telah selesai diverifikasi.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="border-t pt-3">
                                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Submit for Review Dialog */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Serahkan untuk Review</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Submission Link (Opsional)</Label>
                            <input type="url" placeholder="https://…"
                                value={submitForm.data.submission_link}
                                onChange={e => submitForm.setData('submission_link', e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="space-y-1">
                            <Label>Catatan Submission</Label>
                            <textarea placeholder="Tambahkan catatan untuk reviewer…"
                                value={submitForm.data.submission_notes}
                                onChange={e => submitForm.setData('submission_notes', e.target.value)}
                                rows={3}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={submitForm.processing} className="bg-amber-600 hover:bg-amber-700">
                                Serahkan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'My Tasks', href: '/tasks' }]}>
        {page}
    </AppSidebarLayout>
);
