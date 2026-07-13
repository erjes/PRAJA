import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Plus, FileText, Download, Calendar, User, History, Trash2, ArrowUpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface DocumentVersion {
    id: number;
    version_number: string;
    file_path: string;
    created_at: string;
    creator?: { id: number; name: string } | null;
}

interface Document {
    id: number;
    title: string;
    description: string | null;
    category: 'kebijakan' | 'proses_bisnis';
    current_version: string;
    uploaded_at: string;
    uploader?: { id: number; name: string } | null;
    versions: DocumentVersion[];
}

interface IndexProps {
    documents: Document[];
}

export default function Index({ documents }: IndexProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;
    const isStaff = user.role === 'staff';

    const [activeTab, setActiveTab] = useState<'all' | 'kebijakan' | 'proses_bisnis'>('all');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const createForm = useForm({
        title: '',
        description: '',
        category: 'kebijakan',
        version_number: '1.0',
        file: null as File | null,
    });

    const versionForm = useForm({
        _method: 'PUT',
        version_number: '',
        description: '',
        file: null as File | null,
    });

    const deleteForm = useForm();

    const filteredDocs = documents.filter(doc => {
        if (activeTab === 'all') return true;
        return doc.category === activeTab;
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('documents.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    const handleNewVersionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoc) return;
        versionForm.post(route('documents.update', selectedDoc.id), {
            onSuccess: () => {
                setIsNewVersionOpen(false);
                setSelectedDoc(null);
                versionForm.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus dokumen ini beserta seluruh versinya?')) {
            deleteForm.delete(route('documents.destroy', id));
        }
    };

    const openHistory = (doc: Document) => {
        setSelectedDoc(doc);
        setIsHistoryOpen(true);
    };

    const openNewVersion = (doc: Document) => {
        setSelectedDoc(doc);
        versionForm.setData({
            _method: 'PUT',
            version_number: incrementVersion(doc.current_version),
            description: '',
            file: null,
        });
        setIsNewVersionOpen(true);
    };

    const incrementVersion = (current: string) => {
        const parts = current.replace(/[vV]/g, '').split('.');
        if (parts.length > 0) {
            const last = parseInt(parts[parts.length - 1]);
            if (!isNaN(last)) {
                parts[parts.length - 1] = String(last + 1);
                return `v${parts.join('.')}`;
            }
        }
        return 'v2.0';
    };

    return (
        <>
            <Head title="Manajemen Dokumen BPA" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dokumen & Kebijakan</h1>
                        <p className="text-sm text-muted-foreground">
                            Akses dan kelola arsip kebijakan, regulasi, dan proses bisnis BPA.
                        </p>
                    </div>
                    {!isStaff && (
                        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Dokumen
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b overflow-x-auto gap-2 max-w-full text-sm">
                    {(['all', 'kebijakan', 'proses_bisnis'] as const).map((tab) => {
                        const labelMap = {
                            all: 'Semua Dokumen',
                            kebijakan: 'Kebijakan & Regulasi',
                            proses_bisnis: 'Proses Bisnis',
                        };
                        const count = tab === 'all' 
                            ? documents.length 
                            : documents.filter(d => d.category === tab).length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2.5 font-medium whitespace-nowrap border-b-2 transition-all -mb-px flex items-center gap-1.5 ${
                                    activeTab === tab
                                        ? 'border-primary text-primary font-semibold'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {labelMap[tab]}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Documents Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        {filteredDocs.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-12 w-12 opacity-30 mb-3" />
                                <p className="font-medium">Tidak ada dokumen ditemukan</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Nama Dokumen</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Kategori</th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Versi Saat Ini</th>
                                        <th className="hidden md:table-cell px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Pengunggah</th>
                                        <th className="text-right px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredDocs.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                <div>
                                                    <span className="block text-sm text-foreground">{doc.title}</span>
                                                    {doc.description && (
                                                        <span className="block text-xs text-muted-foreground line-clamp-1 max-w-[300px] mt-0.5">
                                                            {doc.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={doc.category === 'kebijakan' ? 'default' : 'secondary'}>
                                                    {doc.category === 'kebijakan' ? 'Kebijakan' : 'Proses Bisnis'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                                                    {doc.current_version}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <span className="text-xs text-muted-foreground">
                                                    {doc.uploader?.name || 'Sistem'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Download current version */}
                                                    {doc.versions.length > 0 && (
                                                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                                            <a href={route('documents.download', doc.versions[doc.versions.length - 1].id)}>
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    
                                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openHistory(doc)}>
                                                        <History className="h-4 w-4" />
                                                    </Button>

                                                    {!isStaff && (
                                                        <>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => openNewVersion(doc)}>
                                                                <ArrowUpCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(doc.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
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

            {/* Create Document Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Dokumen Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="title">Nama Dokumen</Label>
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
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={createForm.data.category}
                                    onValueChange={(val: any) => createForm.setData('category', val)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kebijakan">Kebijakan & Regulasi</SelectItem>
                                        <SelectItem value="proses_bisnis">Proses Bisnis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="version">Versi Awal</Label>
                                <Input
                                    id="version"
                                    value={createForm.data.version_number}
                                    onChange={(e) => createForm.setData('version_number', e.target.value)}
                                    placeholder="e.g. v1.0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="file">Berkas Dokumen</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => createForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Format didukung: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (Max 10MB)
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                Unggah Dokumen
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Upload New Version Dialog */}
            <Dialog open={isNewVersionOpen} onOpenChange={setIsNewVersionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unggah Versi Baru</DialogTitle>
                    </DialogHeader>
                    {selectedDoc && (
                        <form onSubmit={handleNewVersionSubmit} className="space-y-4">
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                Anda memperbarui dokumen: <strong>{selectedDoc.title}</strong>
                            </p>
                            <div className="space-y-1">
                                <Label htmlFor="new-version">Nomor Versi Baru</Label>
                                <Input
                                    id="new-version"
                                    value={versionForm.data.version_number}
                                    onChange={(e) => versionForm.setData('version_number', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new-desc">Catatan Perubahan / Deskripsi (Opsional)</Label>
                                <Textarea
                                    id="new-desc"
                                    value={versionForm.data.description}
                                    onChange={(e) => versionForm.setData('description', e.target.value)}
                                    placeholder="e.g. Perubahan pada Bab II, Pembaruan data infografis"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-file">Berkas Versi Baru</Label>
                                <Input
                                    id="new-file"
                                    type="file"
                                    onChange={(e) => versionForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsNewVersionOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={versionForm.processing}>
                                    Unggah Versi Baru
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Version History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-md">
                    {selectedDoc && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Riwayat Versi Dokumen</DialogTitle>
                                <CardDescription>{selectedDoc.title}</CardDescription>
                            </DialogHeader>
                            <div className="py-2 max-h-[300px] overflow-y-auto space-y-3">
                                {selectedDoc.versions.map((ver) => (
                                    <div key={ver.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm text-sm">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-xs">
                                                    {ver.version_number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(ver.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                Diunggah oleh: {ver.creator?.name || 'Sistem'}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={route('documents.download', ver.id)}>
                                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                                Unduh
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={() => setIsHistoryOpen(false)}>
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Documents', href: '/documents' }]}
    >
        {page}
    </AppSidebarLayout>
);
