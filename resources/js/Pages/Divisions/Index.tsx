import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { ConfirmDialog } from '@/Components/ConfirmDialog';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Plus,
    Building2,
    Users,
    Trash2,
    Edit,
    ChevronDown,
    AlertCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    division_id: number | null;
}

interface Division {
    id: number;
    name: string;
    description: string | null;
    users_count?: number;
    users?: StaffUser[];
}

interface IndexProps {
    divisions: Division[];
}

export default function Index({ divisions }: IndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
    const [expandedDivs, setExpandedDivs] = useState<number[]>([]);
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const createForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    const toggleExpand = (id: number) => {
        setExpandedDivs((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('divisions.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDivision) return;
        editForm.put(route('divisions.update', selectedDivision.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedDivision(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (div: Division) => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Divisi',
            description: `Apakah Anda yakin ingin menghapus divisi "${div.name}"? ${
                (div.users_count || (div.users?.length ?? 0)) > 0
                    ? 'Perhatian: Divisi ini memiliki staff. Sistem akan menolak penghapusan apabila staff masih berada di divisi ini.'
                    : 'Divisi kosong ini akan dihapus permanen.'
            }`,
            onConfirm: () => createForm.delete(route('divisions.destroy', div.id)),
        });
    };

    const openEdit = (div: Division) => {
        setSelectedDivision(div);
        editForm.setData({
            name: div.name,
            description: div.description || '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Divisi - PRAJA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 bg-[#F9F9F9] text-[#1e1e1e] min-h-screen">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1e1e1e]">Manajemen Divisi</h1>
                        <p className="text-sm text-gray-600">
                            Kelola struktur divisi organisasi dan pantau daftar staff yang bertugas di setiap divisi.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-full sm:w-auto bg-[#901418] hover:bg-[#7a1114] text-white shadow-sm font-medium px-4 py-2 rounded-lg"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Divisi
                    </Button>
                </div>

                {/* Divisions Table / List */}
                <Card className="border border-gray-200/80 shadow-sm rounded-xl overflow-hidden bg-white text-[#1e1e1e]">
                    <CardContent className="p-0 overflow-x-auto">
                        {divisions.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                <Building2 className="h-12 w-12 opacity-30 mb-3" />
                                <p className="font-medium">Belum ada divisi terdaftar</p>
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    variant="outline"
                                    className="mt-4 border-[#901418] text-[#901418] hover:bg-[#901418]/5"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Divisi Pertama
                                </Button>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-[#64748B] text-white">
                                        <th className="px-6 py-3.5 font-semibold text-white w-1/4">Nama Divisi</th>
                                        <th className="px-6 py-3.5 font-semibold text-white">Deskripsi</th>
                                        <th className="px-6 py-3.5 font-semibold text-white w-32 text-center">Total Staff</th>
                                        <th className="text-right px-6 py-3.5 font-semibold text-white w-40">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {divisions.map((div) => {
                                        const staffList = div.users || [];
                                        const staffCount = div.users_count ?? staffList.length;
                                        const isOpen = expandedDivs.includes(div.id);

                                        return (
                                            <React.Fragment key={div.id}>
                                                <tr className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-[#1e1e1e]">
                                                        <div
                                                            className="flex items-center gap-2.5 cursor-pointer select-none"
                                                            onClick={() => toggleExpand(div.id)}
                                                        >
                                                            <div className="flex h-8 w-8 rounded-lg bg-[#901418]/10 text-[#901418] items-center justify-center font-bold shrink-0">
                                                                <Building2 className="h-4 w-4" />
                                                            </div>
                                                            <span className="hover:text-[#901418] transition-colors">{div.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                                                        {div.description || <span className="italic opacity-50">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            onClick={() => toggleExpand(div.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-[#901418]/10 hover:text-[#901418] transition-colors"
                                                        >
                                                            <Users className="h-3.5 w-3.5 text-[#901418]" />
                                                            {staffCount} Staff
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                onClick={() => openEdit(div)}
                                                                title="Edit Divisi"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleDelete(div)}
                                                                title="Hapus Divisi"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpand(div.id)}
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#901418] transition-all ml-1"
                                                                title={isOpen ? 'Tutup Daftar Staff' : 'Lihat Daftar Staff'}
                                                            >
                                                                <ChevronDown
                                                                    className={`h-4 w-4 transition-transform duration-200 ${
                                                                        isOpen ? 'rotate-180 text-[#901418]' : ''
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Expanded Staff List Row */}
                                                {isOpen && (
                                                    <tr className="bg-[#F9F9F9] border-b border-gray-200/60">
                                                        <td colSpan={4} className="px-6 py-4 pl-14">
                                                            <div className="bg-white border border-gray-200/80 rounded-lg p-4 shadow-2xs">
                                                                <div className="flex items-center justify-between text-xs font-semibold text-gray-600 uppercase tracking-wider pb-2 border-b border-gray-100 mb-2">
                                                                    <span>Daftar Staff di Divisi {div.name} ({staffList.length})</span>
                                                                    <span>Role</span>
                                                                </div>

                                                                {staffList.length === 0 ? (
                                                                    <div className="py-6 text-center text-sm text-gray-500 italic flex flex-col items-center gap-1.5">
                                                                        <AlertCircle className="h-5 w-5 opacity-40 text-slate-400" />
                                                                        Belum ada staff yang terdaftar/ditempatkan di divisi ini.
                                                                    </div>
                                                                ) : (
                                                                    <div className="divide-y divide-gray-100">
                                                                        {staffList.map((staff) => (
                                                                            <div
                                                                                key={staff.id}
                                                                                className="py-2.5 flex items-center justify-between text-sm"
                                                                            >
                                                                                <div className="flex items-center gap-3 min-w-0">
                                                                                    <div className="flex h-7 w-7 rounded-full bg-[#901418] text-white items-center justify-center text-xs font-bold shrink-0">
                                                                                        {staff.name.charAt(0).toUpperCase()}
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-semibold text-[#1e1e1e] truncate">
                                                                                            {staff.name}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-600 truncate">
                                                                                            {staff.email}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <span
                                                                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                                                                                        staff.role === 'admin'
                                                                                            ? 'bg-red-100 text-[#901418]'
                                                                                            : 'bg-slate-100 text-slate-700'
                                                                                    }`}
                                                                                >
                                                                                    {staff.role}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Division Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Building2 className="h-5 w-5 text-[#901418]" />
                            Tambah Divisi Baru
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nama Divisi <span className="text-rose-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Divisi IT & Pengembangan"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-rose-500">{createForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Deskripsi Divisi (Opsional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Jelaskan fungsi utama dan tanggung jawab divisi ini..."
                                rows={3}
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                            />
                            {createForm.errors.description && (
                                <p className="text-xs text-rose-500">{createForm.errors.description}</p>
                            )}
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-[#901418] hover:bg-[#7a1114] text-white"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Divisi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Division Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                            <Edit className="h-5 w-5 text-blue-600" />
                            Edit Divisi
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDivision && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name">Nama Divisi <span className="text-rose-500">*</span></Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-rose-500">{editForm.errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-description">Deskripsi Divisi (Opsional)</Label>
                                <Textarea
                                    id="edit-description"
                                    rows={3}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                                {editForm.errors.description && (
                                    <p className="text-xs text-rose-500">{editForm.errors.description}</p>
                                )}
                            </div>
                            <DialogFooter className="mt-6">
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, isOpen: open }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.onConfirm}
            />
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'Divisi', href: '/divisions' }]}>
        {page}
    </AppSidebarLayout>
);
