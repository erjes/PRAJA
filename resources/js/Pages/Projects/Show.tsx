import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Plus, ArrowLeft, Calendar, User, CheckSquare, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react';
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
    assigned_to: number;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    due_date: string;
    assigned_user?: { id: number; name: string } | null;
    sub_tasks: SubTask[];
}

interface Project {
    id: number;
    title: string;
    description: string;
    status: 'planned' | 'ongoing' | 'completed' | 'on_hold';
    start_date: string;
    end_date: string | null;
    division_id: number;
    division?: { id: number; name: string } | null;
    creator?: { id: number; name: string } | null;
    tasks: Task[];
}

interface AssignableUser {
    id: number;
    name: string;
    role: string;
}

interface ShowProps {
    project: Project;
    assignableUsers: AssignableUser[];
}

const statusColors: Record<string, string> = {
    planned: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    ongoing: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    on_hold: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

const taskStatusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 animate-pulse',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
};

const statusLabels: Record<string, string> = {
    planned: 'Direncanakan',
    ongoing: 'Berjalan',
    completed: 'Selesai',
    on_hold: 'Ditangguhkan',
};

export default function Show({ project, assignableUsers }: ShowProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isStaff = user.role === 'staff';

    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Subtask items temporary list for create task form
    const [tempSubTasks, setTempSubTasks] = useState<string[]>([]);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

    const projectForm = useForm({
        title: project.title,
        description: project.description,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date || '',
        division_id: String(project.division_id),
    });

    const taskForm = useForm({
        project_id: project.id,
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        sub_tasks: [] as string[],
    });

    const handleUpdateProject = (e: React.FormEvent) => {
        e.preventDefault();
        projectForm.put(route('projects.update', project.id), {
            onSuccess: () => setIsEditProjectOpen(false),
        });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        taskForm.setData('sub_tasks', tempSubTasks);
        
        // Due to state asynchronous updates in useForm set data, we construct object directly if needed
        const dataPayload = {
            ...taskForm.data,
            sub_tasks: tempSubTasks,
        };
        
        // Trigger post
        taskForm.transform((data) => ({
            ...data,
            sub_tasks: tempSubTasks
        })).post(route('tasks.store'), {
            onSuccess: () => {
                setIsCreateTaskOpen(false);
                taskForm.reset();
                setTempSubTasks([]);
                setNewSubTaskTitle('');
            }
        });
    };

    const addTempSubTask = () => {
        if (newSubTaskTitle.trim()) {
            setTempSubTasks([...tempSubTasks, newSubTaskTitle.trim()]);
            setNewSubTaskTitle('');
        }
    };

    const removeTempSubTask = (index: number) => {
        setTempSubTasks(tempSubTasks.filter((_, idx) => idx !== index));
    };

    const handleToggleSubTask = (subTaskId: number) => {
        taskForm.post(route('subtasks.toggle', subTaskId), {
            preserveScroll: true,
            onSuccess: () => {
                // Keep local UI state in sync
                if (selectedTask) {
                    const updatedSubtasks = selectedTask.sub_tasks.map(st => 
                        st.id === subTaskId ? { ...st, is_completed: !st.is_completed } : st
                    );
                    setSelectedTask({ ...selectedTask, sub_tasks: updatedSubtasks });
                }
            }
        });
    };

    const handleTaskStatusChange = (taskId: number, newStatus: string) => {
        taskForm.transform(() => ({
            status: newStatus
        })).post(route('tasks.status', taskId), {
            preserveScroll: true,
            onSuccess: () => {
                setIsTaskDetailOpen(false);
                setSelectedTask(null);
            }
        });
    };

    const handleDeleteTask = (taskId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            taskForm.delete(route('tasks.destroy', taskId), {
                onSuccess: () => {
                    setIsTaskDetailOpen(false);
                    setSelectedTask(null);
                }
            });
        }
    };

    const handleDeleteProject = () => {
        if (confirm('Apakah Anda yakin ingin menghapus proyek ini secara permanen beserta tugas-tugas di dalamnya?')) {
            projectForm.delete(route('projects.destroy', project.id));
        }
    };

    const openTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
    };

    // Group tasks by status
    const tasksByStatus = {
        pending: project.tasks.filter(t => t.status === 'pending'),
        in_progress: project.tasks.filter(t => t.status === 'in_progress'),
        review: project.tasks.filter(t => t.status === 'review'),
        completed: project.tasks.filter(t => t.status === 'completed'),
    };

    return (
        <>
            <Head title={`Proyek: ${project.title}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Back Link & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="outline" asChild className="w-fit">
                        <Link href={route('projects.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Proyek
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsEditProjectOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Proyek
                        </Button>
                        {user.role === 'super_admin' && (
                            <Button variant="destructive" onClick={handleDeleteProject}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>

                {/* Project Details Panel */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${statusColors[project.status]}`}>
                                    Proyek: {statusLabels[project.status]}
                                </span>
                                <CardTitle className="text-xl mt-2">{project.title}</CardTitle>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(project.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}`}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{project.description}</p>
                        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex gap-4">
                            <span>Manajer Proyek: {project.creator?.name || 'Sistem'}</span>
                            <span>Divisi: {project.division?.name}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Kanban Task Board Header */}
                <div className="flex items-center justify-between mt-4">
                    <h2 className="text-lg font-bold">Papan Tugas (Kanban Board)</h2>
                    <Button onClick={() => setIsCreateTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Tugas
                    </Button>
                </div>

                {/* Kanban columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Column Builder Helper */}
                    {(['pending', 'in_progress', 'review', 'completed'] as const).map((status) => {
                        const colTasks = tasksByStatus[status];
                        const titleMap = {
                            pending: 'Belum Dimulai',
                            in_progress: 'Sedang Dikerjakan',
                            review: 'Butuh Review',
                            completed: 'Selesai',
                        };

                        return (
                            <div key={status} className="bg-slate-100/60 dark:bg-slate-900/40 rounded-xl p-3 border flex flex-col min-h-[400px]">
                                <div className="flex items-center justify-between pb-3 border-b mb-3">
                                    <span className="font-semibold text-sm capitalize">{titleMap[status]}</span>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {colTasks.length}
                                    </span>
                                </div>
                                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                                    {colTasks.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-6 text-center text-xs text-muted-foreground">
                                            Kosong
                                        </div>
                                    ) : (
                                        colTasks.map((task) => {
                                            const completedSub = task.sub_tasks.filter(s => s.is_completed).length;
                                            const totalSub = task.sub_tasks.length;

                                            return (
                                                <Card 
                                                    key={task.id} 
                                                    onClick={() => openTaskDetail(task)}
                                                    className="hover:border-primary/50 transition-all cursor-pointer shadow-sm border bg-card"
                                                >
                                                    <CardHeader className="p-3 pb-2">
                                                        <CardTitle className="text-sm font-semibold line-clamp-1">{task.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-3 pt-0 text-xs flex flex-col gap-2">
                                                        <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                                                        
                                                        {totalSub > 0 && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 p-1 rounded px-2 w-fit">
                                                                <CheckSquare className="h-3 w-3" />
                                                                <span>Subtugas: {completedSub}/{totalSub}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between border-t pt-2 mt-1">
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                                                <User className="h-3 w-3" />
                                                                <span className="truncate max-w-[100px]">
                                                                    {task.assigned_user?.name || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] text-slate-400">
                                                                D/L: {new Date(task.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Task Dialog */}
            <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Tugas Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="task-title">Judul Tugas</Label>
                            <Input
                                id="task-title"
                                value={taskForm.data.title}
                                onChange={(e) => taskForm.setData('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="task-desc">Deskripsi Tugas</Label>
                            <Textarea
                                id="task-desc"
                                value={taskForm.data.description}
                                onChange={(e) => taskForm.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="task-assign">Penerima Tugas</Label>
                                <Select
                                    value={taskForm.data.assigned_to}
                                    onValueChange={(val) => taskForm.setData('assigned_to', val)}
                                >
                                    <SelectTrigger id="task-assign">
                                        <SelectValue placeholder="Pilih User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assignableUsers.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name} ({u.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="task-due">Batas Waktu</Label>
                                <Input
                                    id="task-due"
                                    type="date"
                                    value={taskForm.data.due_date}
                                    onChange={(e) => taskForm.setData('due_date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Subtasks listing */}
                        <div className="space-y-2 border-t pt-3">
                            <Label>Daftar Subtugas (Rencana Kerja)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newSubTaskTitle}
                                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    placeholder="e.g. Siapkan data, Tulis draf laporan"
                                />
                                <Button type="button" onClick={addTempSubTask} variant="secondary">
                                    Tambah
                                </Button>
                            </div>
                            <div className="max-h-[120px] overflow-y-auto space-y-1 text-xs">
                                {tempSubTasks.map((title, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-muted p-1.5 rounded px-3">
                                        <span>{title}</span>
                                        <Button type="button" size="icon" variant="ghost" className="h-5 w-5 text-red-500 hover:text-red-700" onClick={() => removeTempSubTask(idx)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={taskForm.processing}>
                                Simpan Tugas
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Task Detail & Actions Dialog */}
            <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
                <DialogContent className="max-w-md">
                    {selectedTask && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${taskStatusColors[selectedTask.status]}`}>
                                        Status: {selectedTask.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <DialogTitle className="text-lg mt-1">{selectedTask.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Deskripsi Tugas</Label>
                                    <p className="mt-1 whitespace-pre-wrap">{selectedTask.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Penerima Tugas</Label>
                                        <p className="font-medium mt-0.5">{selectedTask.assigned_user?.name || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Tenggat Waktu</Label>
                                        <p className="font-medium mt-0.5">{new Date(selectedTask.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                    </div>
                                </div>

                                {/* Subtasks checklist */}
                                {selectedTask.sub_tasks.length > 0 && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground mb-2 block">Daftar Subtugas</Label>
                                        <div className="space-y-2">
                                            {selectedTask.sub_tasks.map((st) => (
                                                <label 
                                                    key={st.id} 
                                                    className={`flex items-center gap-2.5 p-2 border rounded-lg transition-colors cursor-pointer ${
                                                        st.is_completed ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={st.is_completed}
                                                        onChange={() => handleToggleSubTask(st.id)}
                                                        disabled={isStaff && selectedTask.assigned_to !== user.id}
                                                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                    />
                                                    <span className={st.is_completed ? 'line-through' : ''}>{st.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Status workflow action buttons */}
                                <div className="border-t pt-4">
                                    <Label className="text-xs text-muted-foreground block mb-2">Aksi Alur Kerja (Workflow Action)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Staff view */}
                                        {isStaff && selectedTask.assigned_to === user.id && (
                                            <>
                                                {selectedTask.status === 'pending' && (
                                                    <Button size="sm" onClick={() => handleTaskStatusChange(selectedTask.id, 'in_progress')}>
                                                        Mulai Kerjakan
                                                    </Button>
                                                )}
                                                {selectedTask.status === 'in_progress' && (
                                                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => handleTaskStatusChange(selectedTask.id, 'review')}>
                                                        Serahkan untuk Review
                                                    </Button>
                                                )}
                                                {selectedTask.status === 'review' && (
                                                    <p className="text-xs text-amber-600 flex items-center gap-1 font-medium bg-amber-50 dark:bg-amber-900/10 p-2 rounded">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Menunggu review dari manajer.
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {/* Manager / Admin view */}
                                        {!isStaff && (
                                            <>
                                                {selectedTask.status === 'review' && (
                                                    <>
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTaskStatusChange(selectedTask.id, 'completed')}>
                                                            <Check className="mr-1.5 h-4 w-4" />
                                                            Setujui & Selesaikan
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleTaskStatusChange(selectedTask.id, 'in_progress')}>
                                                            <X className="mr-1.5 h-4 w-4" />
                                                            Tolak & Minta Perbaikan
                                                        </Button>
                                                    </>
                                                )}
                                                {selectedTask.status !== 'completed' && selectedTask.status !== 'review' && (
                                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleTaskStatusChange(selectedTask.id, 'completed')}>
                                                        Selesaikan Tugas
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="flex items-center justify-between border-t pt-3">
                                {!isStaff ? (
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteTask(selectedTask.id)} className="mr-auto">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                <Button type="button" onClick={() => setIsTaskDetailOpen(false)}>
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Project Dialog */}
            <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Proyek</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProject} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="edit-title">Nama Proyek</Label>
                            <Input
                                id="edit-title"
                                value={projectForm.data.title}
                                onChange={(e) => projectForm.setData('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="edit-desc">Deskripsi</Label>
                            <Textarea
                                id="edit-desc"
                                value={projectForm.data.description}
                                onChange={(e) => projectForm.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="edit-start">Tanggal Mulai</Label>
                                <Input
                                    id="edit-start"
                                    type="date"
                                    value={projectForm.data.start_date}
                                    onChange={(e) => projectForm.setData('start_date', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-end">Tanggal Selesai</Label>
                                <Input
                                    id="edit-end"
                                    type="date"
                                    value={projectForm.data.end_date}
                                    onChange={(e) => projectForm.setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="edit-status">Status Proyek</Label>
                            <Select
                                value={projectForm.data.status}
                                onValueChange={(val: any) => projectForm.setData('status', val)}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Direncanakan</SelectItem>
                                    <SelectItem value="ongoing">Berjalan</SelectItem>
                                    <SelectItem value="on_hold">Ditangguhkan</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditProjectOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={projectForm.processing}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[
            { title: 'Projects', href: '/projects' },
            { title: 'Detail Proyek', href: '#' },
        ]}
    >
        {page}
    </AppSidebarLayout>
);
