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
import { Plus, FolderKanban, Calendar, ArrowRight, Users, User, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Member {
    id: number;
    name: string;
    email?: string;
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
    members: Member[];
}

interface Division {
    id: number;
    name: string;
}

interface AssignableUser {
    id: number;
    name: string;
    email?: string;
    role: string;
}

interface IndexProps {
    projects: Project[];
    divisions: Division[];
    assignableUsers: AssignableUser[];
}

const statusColors: Record<string, string> = {
    planned:   'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    ongoing:   'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    on_hold:   'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

const statusLabels: Record<string, string> = {
    planned: 'Direncanakan', ongoing: 'Berjalan', completed: 'Selesai', on_hold: 'Ditangguhkan',
};

export default function Index({ projects, divisions, assignableUsers }: IndexProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Member search state
    const [memberSearch, setMemberSearch]   = useState('');
    const [memberResults, setMemberResults] = useState<AssignableUser[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<AssignableUser[]>([]);

    const createForm = useForm({
        title:       '',
        description: '',
        status:      'planned',
        start_date:  new Date().toISOString().slice(0, 10),
        end_date:    '',
        division_id: user.role === 'super_admin' ? '' : String(user.division_id || ''),
        members:     [] as number[],
    });

    const searchMembers = async (q: string) => {
        setMemberSearch(q);
        if (!q.trim()) { setMemberResults([]); return; }
        try {
            const res  = await fetch(route('projects.searchUsers') + `?search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setMemberResults(data);
        } catch { /* silent */ }
    };

    const addMember = (m: AssignableUser) => {
        if (selectedMembers.some(s => s.id === m.id)) return;
        const newSelected = [...selectedMembers, m];
        setSelectedMembers(newSelected);
        createForm.setData('members', newSelected.map(s => s.id));
        setMemberResults([]);
        setMemberSearch('');
    };

    const removeMember = (id: number) => {
        const newSelected = selectedMembers.filter(m => m.id !== id);
        setSelectedMembers(newSelected);
        createForm.setData('members', newSelected.map(s => s.id));
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('projects.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                setSelectedMembers([]);
                setMemberSearch('');
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Proyek BPA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Proyek & Perencanaan</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola proyek divisi dan rencanakan tugas bersama tim.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Proyek Baru
                    </Button>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                        <Card className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
                            <FolderKanban className="h-12 w-12 opacity-30 mb-3" />
                            <p className="font-medium">Belum ada proyek dibuat</p>
                            <p className="text-sm">Silakan buat proyek baru untuk memulai koordinasi tugas.</p>
                        </Card>
                    ) : (
                        projects.map((project) => (
                            <Card key={project.id} className="hover:border-primary/50 transition-all flex flex-col justify-between shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border bg-muted">
                                            {project.division?.name || 'Company'}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[project.status]}`}>
                                            {statusLabels[project.status]}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-2 line-clamp-1">{project.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1 min-h-[40px]">
                                        {project.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                {new Date(project.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                        {/* Member avatars */}
                                        {project.members && project.members.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <div className="flex -space-x-2">
                                                    {project.members.slice(0, 3).map(m => (
                                                        <div key={m.id} title={m.name}
                                                            className="w-5 h-5 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[9px] font-bold">
                                                            {m.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    ))}
                                                </div>
                                                {project.members.length > 3 && (
                                                    <span className="text-[10px] text-muted-foreground">+{project.members.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={route('projects.show', project.id)}>
                                            Kelola Tugas & Detail
                                            <ArrowRight className="h-4 w-4 ml-1" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Create Project Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Buat Proyek Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="title">Nama Proyek</Label>
                            <Input id="title" value={createForm.data.title}
                                onChange={e => createForm.setData('title', e.target.value)} required />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea id="description" value={createForm.data.description}
                                onChange={e => createForm.setData('description', e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input id="start_date" type="date" value={createForm.data.start_date}
                                    onChange={e => createForm.setData('start_date', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                                <Input id="end_date" type="date" value={createForm.data.end_date}
                                    onChange={e => createForm.setData('end_date', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="status">Status Awal</Label>
                            <Select value={createForm.data.status}
                                onValueChange={val => createForm.setData('status', val as any)}>
                                <SelectTrigger id="status"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Direncanakan</SelectItem>
                                    <SelectItem value="ongoing">Berjalan</SelectItem>
                                    <SelectItem value="on_hold">Ditangguhkan</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {user.role === 'super_admin' && (
                            <div className="space-y-1">
                                <Label htmlFor="division">Divisi Penanggung Jawab</Label>
                                <Select value={createForm.data.division_id}
                                    onValueChange={val => createForm.setData('division_id', val)}>
                                    <SelectTrigger id="division"><SelectValue placeholder="Pilih Divisi" /></SelectTrigger>
                                    <SelectContent>
                                        {divisions.map(div => (
                                            <SelectItem key={div.id} value={String(div.id)}>{div.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Member picker */}
                        <div className="space-y-2">
                            <Label>Kolaborator (Opsional)</Label>
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map(m => (
                                        <span key={m.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                                            {m.name}
                                            <button type="button" onClick={() => removeMember(m.id)} className="text-muted-foreground hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="relative">
                                <Input placeholder="Cari user berdasarkan nama/email…" value={memberSearch}
                                    onChange={e => searchMembers(e.target.value)} />
                                {memberResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 bg-popover border rounded-lg shadow-lg mt-1 max-h-36 overflow-y-auto">
                                        {memberResults.map(m => (
                                            <button type="button" key={m.id} onClick={() => addMember(m)}
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="font-medium">{m.name}</span>
                                                {m.email && <span className="text-muted-foreground text-xs">{m.email}</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={createForm.processing}>Simpan Proyek</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'Projects', href: '/projects' }]}>
        {page}
    </AppSidebarLayout>
);
