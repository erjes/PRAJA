import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { ConfirmDialog } from '@/Components/ConfirmDialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, Users, UserCheck, Trash2, Edit } from 'lucide-react';
import type { ReactNode } from 'react';

interface Division {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    division_id: number | null;
    division?: Division | null;
}

interface IndexProps {
    users: User[];
    divisions: Division[];
}

export default function Index({ users, divisions }: IndexProps) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, description: string, onConfirm: () => void}>({
        isOpen: false, title: '', description: '', onConfirm: () => {}
    });

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff' as 'admin' | 'staff',
        division_id: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff' as 'admin' | 'staff',
        division_id: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('users.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedUser(null);
                editForm.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Pengguna',
            description: 'Apakah Anda yakin ingin menghapus pengguna ini secara permanen?',
            onConfirm: () => createForm.delete(route('users.destroy', id))
        });
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            division_id: user.division_id ? String(user.division_id) : '',
        });
        setIsEditOpen(true);
    };

    return (
        <>
            <Head title="Manajemen Pengguna BPA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun pegawai, peran (role), dan penugasan divisi.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        {users.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                <Users className="h-12 w-12 opacity-30 mb-3" />
                                <p className="font-medium">Belum ada pengguna terdaftar</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Alamat Email</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Divisi</th>
                                        <th className="text-right px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                                                    u.role === 'admin' 
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {u.division?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => openEdit(u)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {currentUser.id !== u.id && (
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(u.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create User Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(val: any) => createForm.setData('role', val)}
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {createForm.data.role === 'staff' && (
                                <div className="space-y-1">
                                    <Label htmlFor="division">Divisi</Label>
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
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Pengguna</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="edit-name">Nama Lengkap</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-email">Alamat Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-password">Password Baru (Kosongkan jika tidak diubah)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                        value={editForm.data.role}
                                        onValueChange={(val: any) => editForm.setData('role', val)}
                                    >
                                        <SelectTrigger id="edit-role">
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {editForm.data.role === 'staff' && (
                                    <div className="space-y-1">
                                        <Label htmlFor="edit-division">Divisi</Label>
                                        <Select
                                            value={editForm.data.division_id}
                                            onValueChange={(val) => editForm.setData('division_id', val)}
                                        >
                                            <SelectTrigger id="edit-division">
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
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    Simpan Perubahan
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
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

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Users', href: '/users' }]}
    >
        {page}
    </AppSidebarLayout>
);
