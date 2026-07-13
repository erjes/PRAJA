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
import { Plus, FolderKanban, Calendar, ArrowRight, Trash2, Edit } from 'lucide-react';
import type { ReactNode } from 'react';

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
}

interface Division {
    id: number;
    name: string;
}

interface IndexProps {
    projects: Project[];
    divisions: Division[];
}

const statusColors: Record<string, string> = {
    planned: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
    ongoing: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    on_hold: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
};

const statusLabels: Record<string, string> = {
    planned: 'Direncanakan',
    ongoing: 'Berjalan',
    completed: 'Selesai',
    on_hold: 'Ditangguhkan',
};

export default function Index({ projects, divisions }: IndexProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const createForm = useForm({
        title: '',
        description: '',
        status: 'planned',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        division_id: user.role === 'super_admin' ? '' : String(user.division_id || ''),
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('projects.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
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
                                            Divisi: {project.division?.name || 'Company'}
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
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-3">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Mulai: {new Date(project.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </span>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Proyek Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="title">Nama Proyek</Label>
                            <Input
                                id="title"
                                value={createForm.data.title}
                                onChange={(e) => createForm.setData('title', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={createForm.data.start_date}
                                    onChange={(e) => createForm.setData('start_date', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={createForm.data.end_date}
                                    onChange={(e) => createForm.setData('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="status">Status Awal</Label>
                                <Select
                                    value={createForm.data.status}
                                    onValueChange={(val: any) => createForm.setData('status', val)}
                                >
                                    <SelectTrigger id="status">
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

                            {user.role === 'super_admin' && (
                                <div className="space-y-1">
                                    <Label htmlFor="division">Divisi Penanggung Jawab</Label>
                                    <Select
                                        value={createForm.data.division_id}
                                        onValueChange={(val) => createForm.setData('division_id', val)}
                                    >
                                        <SelectTrigger id="division">
                                            <SelectValue placeholder="Pilih Divisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {divisions.map((div) => (
                                                <SelectItem key={div.id} value={String(div.id)}>
                                                    {div.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Simpan Proyek
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Projects', href: '/projects' }]}
    >
        {page}
    </AppSidebarLayout>
);
