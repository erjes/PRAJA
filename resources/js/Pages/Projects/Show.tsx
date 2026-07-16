import React, { useState } from 'react';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ConfirmDialog } from '@/Components/ConfirmDialog';
import {
    Plus, ArrowLeft, Calendar, User, CheckSquare, Trash2, Edit,
    Check, X, AlertCircle, ExternalLink, GripVertical, Users, Link2,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubTask {
    id: number;
    title: string;
    is_completed: boolean;
    sort_order?: number;
}

interface Task {
    id: number;
    title: string;
    description: string;
    assigned_to: number;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    due_date: string | null;
    start_date: string | null;
    brief_link: string | null;
    submission_link: string | null;
    revision_notes: string | null;
    review_status: 'pending' | 'approved' | 'revision' | null;
    assigned_user?: { id: number; name: string } | null;
    sub_tasks: SubTask[];
    urgency_label?: 'Overdue' | 'Due Today' | 'Upcoming';
}

interface Member {
    id: number;
    name: string;
    email?: string;
    role?: string;
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
    created_by?: number;
    tasks: Task[];
    members: Member[];
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

// ─── Constants ───────────────────────────────────────────────────────────────

const COLUMNS: { key: Task['status']; label: string; color: string; dot: string }[] = [
    { key: 'pending',     label: 'To Do',        color: 'bg-slate-100 dark:bg-slate-900/30',  dot: 'bg-slate-400' },
    { key: 'in_progress', label: 'In Progress',   color: 'bg-blue-50 dark:bg-blue-950/20',    dot: 'bg-blue-500'  },
    { key: 'review',      label: 'Under Review',  color: 'bg-amber-50 dark:bg-amber-950/20',  dot: 'bg-amber-500' },
    { key: 'completed',   label: 'Done',          color: 'bg-emerald-50 dark:bg-emerald-950/20', dot: 'bg-emerald-500' },
];

const projectStatusColors: Record<string, string> = {
    planned:   'bg-slate-100 text-slate-700 border-slate-200',
    ongoing:   'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    on_hold:   'bg-amber-100 text-amber-700 border-amber-200',
};

const projectStatusLabels: Record<string, string> = {
    planned: 'Direncanakan', ongoing: 'Berjalan', completed: 'Selesai', on_hold: 'Ditangguhkan',
};

const urgencyBadge: Record<string, string> = {
    Overdue:   'bg-red-100 text-red-700 border-red-200',
    'Due Today': 'bg-amber-100 text-amber-700 border-amber-200',
    Upcoming:  'bg-emerald-100 text-emerald-700 border-emerald-200',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Show({ project, assignableUsers }: ShowProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isAdmin = user.role === 'admin';
    const isCreator = project.created_by === user.id;
    const canManageProject = isAdmin || isCreator;
    const canManageTask = true; // All members can add/edit tasks

    // Dialog state
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [isCreateTaskOpen, setIsCreateTaskOpen]   = useState(false);
    const [isTaskDetailOpen, setIsTaskDetailOpen]   = useState(false);
    const [isEditTaskOpen, setIsEditTaskOpen]       = useState(false);
    const [isSubmitOpen, setIsSubmitOpen]           = useState(false);
    const [isRevisionOpen, setIsRevisionOpen]       = useState(false);
    const [isMembersOpen, setIsMembersOpen]         = useState(false);
    const [selectedTask, setSelectedTask]           = useState<Task | null>(null);
    const [confirmState, setConfirmState]           = useState<{isOpen: boolean, title: string, description: string, onConfirm: () => void}>({
        isOpen: false, title: '', description: '', onConfirm: () => {}
    });

    // Subtask temp list for create form
    const [tempSubTasks, setTempSubTasks]     = useState<string[]>([]);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

    // Member search
    const [memberSearch, setMemberSearch]   = useState('');
    const [memberResults, setMemberResults] = useState<Member[]>([]);
    const [memberLoading, setMemberLoading] = useState(false);

    // ── Forms ────────────────────────────────────────────────────────────────

    const projectForm = useForm({
        title:       project.title,
        description: project.description,
        status:      project.status,
        start_date:  project.start_date?.slice(0, 10) ?? '',
        end_date:    project.end_date?.slice(0, 10) ?? '',
        members:     project.members.map(m => m.id),
    });

    const taskForm = useForm({
        project_id:  project.id,
        title:       '',
        description: '',
        assigned_to: '',
        due_date:    '',
        start_date:  '',
        brief_link:  '',
        sub_tasks:   [] as string[],
    });

    const editTaskForm = useForm({
        title:            '',
        description:      '',
        assigned_to:      '',
        due_date:         '',
        start_date:       '',
        brief_link:       '',
        submission_link:  '',
        status:           'pending' as Task['status'],
        sub_tasks:        [] as { title: string; is_completed: boolean }[],
    });

    const submitForm  = useForm({ submission_link: '', submission_notes: '', manager_email: '' });
    const revisionForm = useForm({ revision_notes: '' });
    const statusForm  = useForm({});

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleProjectUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        projectForm.put(route('projects.update', project.id), {
            onSuccess: () => setIsEditProjectOpen(false),
        });
    };

    const handleProjectDelete = () => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Proyek',
            description: `Apakah Anda yakin ingin menghapus proyek "${project.title}"? Semua tugas di dalamnya juga akan dihapus secara permanen.`,
            onConfirm: () => router.delete(route('projects.destroy', project.id))
        });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        taskForm.setData('sub_tasks', tempSubTasks.filter(t => t.trim()));
        taskForm.post(route('tasks.store'), {
            onSuccess: () => {
                setIsCreateTaskOpen(false);
                taskForm.reset();
                setTempSubTasks([]);
                setNewSubTaskTitle('');
            },
        });
    };

    const openEditTask = (task: Task) => {
        setSelectedTask(task);
        editTaskForm.setData({
            title:           task.title,
            description:     task.description ?? '',
            assigned_to:     String(task.assigned_to),
            due_date:        task.due_date?.slice(0, 10) ?? '',
            start_date:      task.start_date?.slice(0, 10) ?? '',
            brief_link:      task.brief_link ?? '',
            submission_link: task.submission_link ?? '',
            status:          task.status,
            sub_tasks:       task.sub_tasks.map(s => ({ title: s.title, is_completed: s.is_completed })),
        });
        setIsEditTaskOpen(true);
    };

    const handleEditTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        editTaskForm.put(route('tasks.update', selectedTask.id), {
            onSuccess: () => setIsEditTaskOpen(false),
        });
    };

    const handleDeleteTask = (task: Task) => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Tugas',
            description: `Apakah Anda yakin ingin menghapus tugas "${task.title}" secara permanen?`,
            onConfirm: () => router.delete(route('tasks.destroy', task.id), { preserveScroll: true })
        });
    };

    const openDetail = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
    };

    const openSubmit = (task: Task) => {
        setSelectedTask(task);
        submitForm.reset();
        submitForm.setData('submission_link', task.submission_link ?? '');
        setIsSubmitOpen(true);
    };

    const handleSubmitTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        submitForm.post(route('tasks.submit', selectedTask.id), {
            onSuccess: () => setIsSubmitOpen(false),
        });
    };

    const openRevision = (task: Task) => {
        setSelectedTask(task);
        revisionForm.reset();
        setIsRevisionOpen(true);
    };

    const handleRevision = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;
        revisionForm.post(route('tasks.revision', selectedTask.id), {
            onSuccess: () => { setIsRevisionOpen(false); setIsTaskDetailOpen(false); },
        });
    };

    const handleApprove = (task: Task) => {
        router.post(route('tasks.approve', task.id), {}, {
            preserveScroll: true,
            onSuccess: () => setIsTaskDetailOpen(false),
        });
    };

    const handleToggleSubTask = (subTaskId: number) => {
        statusForm.post(route('subtasks.toggle', subTaskId), { preserveScroll: true });
    };

    // ── Kanban drag-and-drop ──────────────────────────────────────────────────

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newStatus = result.destination.droppableId as Task['status'];
        const taskId    = parseInt(result.draggableId, 10);
        const task      = project.tasks.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        router.post(route('tasks.status', taskId), { status: newStatus }, { preserveScroll: true });
    };

    const moveTask = (task: Task, direction: 'left' | 'right') => {
        const statuses: Task['status'][] = ['pending', 'in_progress', 'review', 'completed'];
        const currentIndex = statuses.indexOf(task.status);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= statuses.length) return;
        
        const newStatus = statuses[newIndex];
        router.post(route('tasks.status', task.id), { status: newStatus }, { preserveScroll: true });
    };

    // ── Member search ─────────────────────────────────────────────────────────

    const searchMembers = (q: string) => {
        setMemberSearch(q);
        if (!q.trim()) { setMemberResults([]); return; }
        
        const term = q.toLowerCase();
        const filtered = assignableUsers.filter(u => 
            u.name.toLowerCase().includes(term)
        ).slice(0, 10);
        
        setMemberResults(filtered);
    };

    const addMember = (memberId: number) => {
        const current = projectForm.data.members as number[];
        if (!current.includes(memberId)) {
            projectForm.setData('members', [...current, memberId]);
        }
        setMemberResults([]);
        setMemberSearch('');
    };

    const removeMember = (memberId: number) => {
        projectForm.setData('members', (projectForm.data.members as number[]).filter(id => id !== memberId));
    };

    // ── Subtask helpers for create form ──────────────────────────────────────

    const addTempSubTask = () => {
        if (!newSubTaskTitle.trim()) return;
        setTempSubTasks(prev => [...prev, newSubTaskTitle.trim()]);
        setNewSubTaskTitle('');
    };

    const removeTempSubTask = (i: number) => setTempSubTasks(prev => prev.filter((_, idx) => idx !== i));

    // ── Task columns ─────────────────────────────────────────────────────────

    const tasksByColumn = (status: Task['status']) => project.tasks.filter(t => t.status === status);

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <Head title={`Proyek: ${project.title}`} />
            <div className="flex flex-col gap-4 p-4 md:p-6">

                {/* ── Back + Header ── */}
                <div className="flex flex-col gap-4">
                    <Link href={route('projects.index')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit">
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Proyek
                    </Link>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${projectStatusColors[project.status]}`}>
                                    {projectStatusLabels[project.status]}
                                </span>
                                {project.division && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-muted">
                                        {project.division.name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold truncate">{project.title}</h1>
                            <p className="text-base text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(project.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                    {project.end_date && ` – ${new Date(project.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}`}
                                </span>
                                <button onClick={() => setIsMembersOpen(true)} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                    <Users className="h-3.5 w-3.5" />
                                    {project.members.length} anggota proyek
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {canManageProject && (
                                <>
                                    <Button size="sm" variant="outline" onClick={() => setIsEditProjectOpen(true)}>
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={handleProjectDelete}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                    </Button>
                                    <Button size="sm" onClick={() => setIsCreateTaskOpen(true)}>
                                        <Plus className="h-4 w-4 mr-1" /> Tambah Tugas
                                    </Button>
                                </>
                            )}
                            {canManageTask && !canManageProject && (
                                <Button size="sm" onClick={() => setIsCreateTaskOpen(true)}>
                                    <Plus className="h-4 w-4 mr-1" /> Tambah Tugas
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Kanban Board ── */}
                <div className="flex flex-col mt-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 flex items-start sm:items-center gap-3 w-fit shadow-sm">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            <span className="font-bold text-primary">Pintasan:</span> Seret dan lepas kartu tugas antar kolom untuk mengubah status pekerjaannya dengan cepat.
                        </p>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        {/* Fixed height board: fills viewport minus header + project info area */}
                        <div className="flex gap-4 overflow-x-auto pb-2" style={{ height: 'calc(100vh - 280px)' }}>
                            {COLUMNS.map(col => {
                                const colTasks = tasksByColumn(col.key);
                                return (
                                    <div key={col.key} className={`${col.color} rounded-2xl p-4 flex flex-col gap-3 min-w-[280px] w-[280px] shrink-0 border border-border shadow-sm h-full`}>
                                        {/* Column header */}
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                                            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{col.label}</span>
                                            <span className="ml-auto text-[10px] font-bold bg-background/60 rounded-full px-2 py-0.5 text-muted-foreground">
                                                {colTasks.length}
                                            </span>
                                        </div>

                                        {/* Droppable area — scrolls internally */}
                                        <Droppable droppableId={col.key}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`flex flex-col gap-3 min-h-[80px] flex-1 overflow-y-auto rounded-xl transition-colors pr-0.5 ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}
                                                >
                                                    {colTasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                            {(prov, snap) => (
                                                                <div
                                                                    ref={prov.innerRef}
                                                                    {...prov.draggableProps}
                                                                    className={`bg-card rounded-xl p-4 shadow-sm border border-border/60 hover:shadow-md transition-all hover:border-primary/40 ${snap.isDragging ? 'rotate-2 shadow-xl ring-2 ring-primary/20' : ''}`}
                                                                >
                                                                    {/* Drag handle + actions row */}
                                                                    <div className="flex items-center gap-1 mb-2">
                                                                        <span {...prov.dragHandleProps} className="text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing p-0.5">
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </span>
                                                                        <div className="flex-1" />
                                                                        {(task.urgency_label === 'Overdue' || task.urgency_label === 'Due Today') && (
                                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${urgencyBadge[task.urgency_label ?? 'Upcoming']}`}>
                                                                                {task.urgency_label}
                                                                            </span>
                                                                        )}
                                                                        
                                                                        {/* Arrows */}
                                                                        {col.key !== 'pending' && (
                                                                            <button onClick={() => moveTask(task, 'left')} className="p-0.5 text-muted-foreground hover:text-foreground">
                                                                                <ChevronLeft className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        )}
                                                                        {col.key !== 'completed' && (
                                                                            <button onClick={() => moveTask(task, 'right')} className="p-0.5 text-muted-foreground hover:text-foreground">
                                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        )}

                                                                        <button onClick={() => openDetail(task)} className="p-0.5 text-muted-foreground hover:text-foreground">
                                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        {canManageTask && (
                                                                            <>
                                                                                <button onClick={() => openEditTask(task)} className="p-0.5 text-muted-foreground hover:text-foreground">
                                                                                    <Edit className="h-3.5 w-3.5" />
                                                                                </button>
                                                                                <button onClick={() => handleDeleteTask(task)} className="p-0.5 text-muted-foreground hover:text-red-500">
                                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>

                                                                    {/* Task title */}
                                                                    <p className="font-semibold text-sm leading-snug line-clamp-2">{task.title}</p>

                                                                    {/* Assignee */}
                                                                    {task.assigned_user && (
                                                                        <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                                                            <User className="h-3 w-3" />{task.assigned_user.name}
                                                                        </p>
                                                                    )}

                                                                    {/* Date range */}
                                                                    {(task.start_date || task.due_date) && (
                                                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {task.start_date && new Date(task.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                                            {task.start_date && task.due_date && ' – '}
                                                                            {task.due_date && new Date(task.due_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                                        </p>
                                                                    )}

                                                                    {/* Subtask progress */}
                                                                    {task.sub_tasks.length > 0 && (
                                                                        <div className="mt-2 flex items-center gap-1.5">
                                                                            <div className="flex-1 bg-border rounded-full h-1">
                                                                                <div
                                                                                    className="bg-emerald-500 h-1 rounded-full transition-all"
                                                                                    style={{ width: `${(task.sub_tasks.filter(s => s.is_completed).length / task.sub_tasks.length) * 100}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                                {task.sub_tasks.filter(s => s.is_completed).length}/{task.sub_tasks.length}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Brief link */}
                                                                    {task.brief_link && (
                                                                        <a href={task.brief_link} target="_blank" rel="noopener noreferrer"
                                                                            className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline"
                                                                            onClick={e => e.stopPropagation()}>
                                                                            <Link2 className="h-3 w-3" /> Brief
                                                                        </a>
                                                                    )}

                                                                    {/* Submit for review (assigned + in_progress) */}
                                                                    {task.assigned_to === user.id && task.status === 'in_progress' && (
                                                                        <Button size="sm" variant="outline"
                                                                            className="w-full mt-2 h-7 text-[11px] border-amber-300 text-amber-700 hover:bg-amber-50"
                                                                            onClick={e => { e.stopPropagation(); openSubmit(task); }}>
                                                                            Serahkan Review
                                                                        </Button>
                                                                    )}

                                                                    {/* Approve / Revision buttons for admin */}
                                                                    {isAdmin && task.status === 'review' && (
                                                                        <div className="flex gap-1.5 mt-2">
                                                                            <Button size="sm" className="flex-1 h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                                                                                onClick={e => { e.stopPropagation(); handleApprove(task); }}>
                                                                                <Check className="h-3 w-3 mr-1" /> Setujui
                                                                            </Button>
                                                                            <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px]"
                                                                                onClick={e => { e.stopPropagation(); openRevision(task); }}>
                                                                                <X className="h-3 w-3 mr-1" /> Revisi
                                                                            </Button>
                                                                        </div>
                                                                    )}

                                                                    {/* Revision notes indicator */}
                                                                    {task.review_status === 'revision' && task.revision_notes && (
                                                                        <p className="mt-2 text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded border border-amber-200 line-clamp-2">
                                                                            📝 {task.revision_notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>

                                        {/* Add task button in first column */}
                                        {col.key === 'pending' && canManageTask && (
                                            <button onClick={() => setIsCreateTaskOpen(true)}
                                                className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-primary text-xs font-semibold rounded-xl py-3 flex items-center justify-center gap-1 transition-colors hover:bg-primary/5">
                                                <Plus className="h-3.5 w-3.5" /> TAMBAH TUGAS
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            {/* ── Edit Project Dialog ── */}
            <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Proyek</DialogTitle></DialogHeader>
                    <form onSubmit={handleProjectUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Nama Proyek</Label>
                            <Input value={projectForm.data.title} onChange={e => projectForm.setData('title', e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label>Deskripsi</Label>
                            <Textarea value={projectForm.data.description} onChange={e => projectForm.setData('description', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tanggal Mulai</Label>
                                <Input type="date" value={projectForm.data.start_date} onChange={e => projectForm.setData('start_date', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Tanggal Selesai</Label>
                                <Input type="date" value={projectForm.data.end_date} onChange={e => projectForm.setData('end_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={projectForm.data.status} onValueChange={v => projectForm.setData('status', v as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Direncanakan</SelectItem>
                                    <SelectItem value="ongoing">Berjalan</SelectItem>
                                    <SelectItem value="on_hold">Ditangguhkan</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Member management */}
                        <div className="space-y-2">
                            <Label>Anggota Proyek</Label>
                            <div className="flex flex-wrap gap-2">
                                {(projectForm.data.members as number[]).map(mid => {
                                    const m = [...assignableUsers, ...project.members].find(u => u.id === mid);
                                    return m ? (
                                        <span key={mid} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                                            {m.name}
                                            <button type="button" onClick={() => removeMember(mid)} className="text-muted-foreground hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                            <div className="relative">
                                <Input placeholder="Cari user berdasarkan nama/email…" value={memberSearch} onChange={e => searchMembers(e.target.value)} />
                                {memberResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                        {memberResults.map(m => (
                                            <button type="button" key={m.id} onClick={() => addMember(m.id)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="font-medium">{m.name}</span>
                                                <span className="text-muted-foreground text-xs">{m.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditProjectOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={projectForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Create Task Dialog ── */}
            <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Tambah Tugas Baru</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Judul Tugas</Label>
                            <Input value={taskForm.data.title} onChange={e => taskForm.setData('title', e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label>Deskripsi</Label>
                            <Textarea value={taskForm.data.description} onChange={e => taskForm.setData('description', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Ditugaskan Kepada</Label>
                            <Select value={taskForm.data.assigned_to} onValueChange={v => taskForm.setData('assigned_to', v)}>
                                <SelectTrigger><SelectValue placeholder="Pilih anggota tim…" /></SelectTrigger>
                                <SelectContent>
                                    {assignableUsers.map(u => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tanggal Mulai</Label>
                                <Input type="date" value={taskForm.data.start_date} onChange={e => taskForm.setData('start_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Tenggat Waktu</Label>
                                <Input type="date" value={taskForm.data.due_date} onChange={e => taskForm.setData('due_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Brief Link (Opsional)</Label>
                            <Input type="url" placeholder="https://…" value={taskForm.data.brief_link} onChange={e => taskForm.setData('brief_link', e.target.value)} />
                        </div>

                        {/* Sub-tasks */}
                        <div className="space-y-2">
                            <Label>Sub-tugas</Label>
                            {tempSubTasks.map((st, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="flex-1 text-sm">{st}</span>
                                    <button type="button" onClick={() => removeTempSubTask(i)} className="text-muted-foreground hover:text-destructive">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input placeholder="Tambah sub-tugas…" value={newSubTaskTitle} onChange={e => setNewSubTaskTitle(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTempSubTask(); } }} />
                                <Button type="button" variant="outline" size="sm" onClick={addTempSubTask}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={taskForm.processing}>Tambah Tugas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Task Dialog ── */}
            <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Tugas</DialogTitle></DialogHeader>
                    <form onSubmit={handleEditTask} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Judul Tugas</Label>
                            <Input value={editTaskForm.data.title} onChange={e => editTaskForm.setData('title', e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label>Deskripsi</Label>
                            <Textarea value={editTaskForm.data.description} onChange={e => editTaskForm.setData('description', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Ditugaskan Kepada</Label>
                            <Select value={editTaskForm.data.assigned_to} onValueChange={v => editTaskForm.setData('assigned_to', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {assignableUsers.map(u => (
                                        <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Tanggal Mulai</Label>
                                <Input type="date" value={editTaskForm.data.start_date} onChange={e => editTaskForm.setData('start_date', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Tenggat Waktu</Label>
                                <Input type="date" value={editTaskForm.data.due_date} onChange={e => editTaskForm.setData('due_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Brief Link</Label>
                                <Input type="url" placeholder="https://…" value={editTaskForm.data.brief_link} onChange={e => editTaskForm.setData('brief_link', e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Submission Link</Label>
                                <Input type="url" placeholder="https://…" value={editTaskForm.data.submission_link} onChange={e => editTaskForm.setData('submission_link', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Status</Label>
                            <Select value={editTaskForm.data.status} onValueChange={v => editTaskForm.setData('status', v as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">To Do</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="review">Under Review</SelectItem>
                                    <SelectItem value="completed">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sub-tasks editing */}
                        <div className="space-y-2">
                            <Label>Sub-tugas</Label>
                            {(editTaskForm.data.sub_tasks as { title: string; is_completed: boolean }[]).map((st, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input type="checkbox" checked={st.is_completed}
                                        onChange={e => {
                                            const upd = [...editTaskForm.data.sub_tasks as any[]];
                                            upd[i] = { ...upd[i], is_completed: e.target.checked };
                                            editTaskForm.setData('sub_tasks', upd);
                                        }}
                                        className="rounded" />
                                    <Input className="flex-1 h-7 text-sm" value={st.title}
                                        onChange={e => {
                                            const upd = [...editTaskForm.data.sub_tasks as any[]];
                                            upd[i] = { ...upd[i], title: e.target.value };
                                            editTaskForm.setData('sub_tasks', upd);
                                        }} />
                                    <button type="button" className="text-muted-foreground hover:text-destructive"
                                        onClick={() => editTaskForm.setData('sub_tasks', (editTaskForm.data.sub_tasks as any[]).filter((_, idx) => idx !== i))}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm"
                                onClick={() => editTaskForm.setData('sub_tasks', [...editTaskForm.data.sub_tasks as any[], { title: '', is_completed: false }])}>
                                <Plus className="h-3.5 w-3.5 mr-1" /> Sub-tugas
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditTaskOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={editTaskForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Task Detail Dialog ── */}
            <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {selectedTask && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedTask.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm py-2">
                                {selectedTask.description && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Deskripsi</Label>
                                        <p className="mt-1 whitespace-pre-wrap">{selectedTask.description}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                                    {selectedTask.assigned_user && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Ditugaskan Ke</Label>
                                            <p className="font-medium mt-0.5">{selectedTask.assigned_user.name}</p>
                                        </div>
                                    )}
                                    {selectedTask.due_date && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Tenggat</Label>
                                            <p className="font-medium mt-0.5">{new Date(selectedTask.due_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                                        </div>
                                    )}
                                </div>

                                {selectedTask.brief_link && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground">Brief Link</Label>
                                        <a href={selectedTask.brief_link} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline mt-1 text-sm">
                                            <ExternalLink className="h-3.5 w-3.5" /> Buka Brief
                                        </a>
                                    </div>
                                )}

                                {selectedTask.submission_link && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground">Submission Link</Label>
                                        <a href={selectedTask.submission_link} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-primary hover:underline mt-1 text-sm">
                                            <ExternalLink className="h-3.5 w-3.5" /> Buka Submission
                                        </a>
                                    </div>
                                )}

                                {selectedTask.revision_notes && (
                                    <div className="border-t pt-3 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200">
                                        <Label className="text-xs text-amber-700 font-semibold">📝 Catatan Revisi</Label>
                                        <p className="mt-1 text-amber-800 dark:text-amber-300">{selectedTask.revision_notes}</p>
                                    </div>
                                )}

                                {/* Sub-tasks checklist */}
                                {selectedTask.sub_tasks.length > 0 && (
                                    <div className="border-t pt-3">
                                        <Label className="text-xs text-muted-foreground mb-2 block">Sub-tugas</Label>
                                        <div className="space-y-2">
                                            {selectedTask.sub_tasks.map(st => (
                                                <label key={st.id} className={`flex items-center gap-2.5 p-2 border rounded-lg cursor-pointer transition-colors ${st.is_completed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/10' : 'hover:bg-muted/40'}`}>
                                                    <input type="checkbox" checked={st.is_completed}
                                                        onChange={() => handleToggleSubTask(st.id)}
                                                        className="rounded h-4 w-4" />
                                                    <span className={st.is_completed ? 'line-through text-muted-foreground' : ''}>{st.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>Tutup</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Submit for Review Dialog ── */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Serahkan untuk Review</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmitTask} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Submission Link (Opsional)</Label>
                            <Input type="url" placeholder="https://…" value={submitForm.data.submission_link} onChange={e => submitForm.setData('submission_link', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Catatan Submission</Label>
                            <Textarea placeholder="Tambahkan catatan untuk reviewer…" value={submitForm.data.submission_notes} onChange={e => submitForm.setData('submission_notes', e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSubmitOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={submitForm.processing} className="bg-amber-600 hover:bg-amber-700">Serahkan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Revision Dialog ── */}
            <Dialog open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Minta Revisi</DialogTitle></DialogHeader>
                    <form onSubmit={handleRevision} className="space-y-4">
                        <div className="space-y-1">
                            <Label>Catatan Revisi <span className="text-destructive">*</span></Label>
                            <Textarea placeholder="Jelaskan apa yang perlu diperbaiki…" value={revisionForm.data.revision_notes} onChange={e => revisionForm.setData('revision_notes', e.target.value)} required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRevisionOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={revisionForm.processing} variant="destructive">Minta Revisi</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Members Dialog ── */}
            <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Kolaborator Proyek</DialogTitle></DialogHeader>
                    <div className="space-y-2 py-2">
                        {project.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Belum ada kolaborator.</p>
                        ) : (
                            project.members.map(m => (
                                <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40">
                                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                        {m.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{m.name}</p>
                                        {m.email && <p className="text-[10px] text-muted-foreground">{m.email}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMembersOpen(false)}>Tutup</Button>
                        {canManageProject && (
                            <Button onClick={() => { setIsMembersOpen(false); setIsEditProjectOpen(true); }}>
                                <Users className="h-4 w-4 mr-1" /> Kelola
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog 
                isOpen={confirmState.isOpen}
                onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.onConfirm}
            />
        </>
    );
}

Show.layout = (page: ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'Projects', href: '/projects' }, { title: 'Detail', href: '#' }]}>
        {page}
    </AppSidebarLayout>
);
