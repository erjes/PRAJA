import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { ConfirmDialog } from '@/Components/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Plus, FileText, Download, Calendar, User, History, Trash2, ArrowUpCircle, Eye, Globe, Lock } from 'lucide-react';
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
    document_number?: string | null;
    description: string | null;
    category: 'kebijakan' | 'proses_bisnis';
    subcategory?: string;
    owner?: string;
    effective_date?: string | null;
    clause?: string | null;
    visibility?: 'public' | 'private';
    status?: 'aktif' | 'nonaktif' | 'draft';
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
    const isStaff = user?.role === 'staff' || user?.role === 'admin';

    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [confirmState, setConfirmState] = useState<{isOpen: boolean, title: string, description: string, onConfirm: () => void}>({
        isOpen: false, title: '', description: '', onConfirm: () => {}
    });
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    const subcategories = [
        { id: 'panduan', label: 'Panduan', category: 'kebijakan' },
        { id: 'pedoman', label: 'Pedoman', category: 'kebijakan' },
        { id: 'buletin', label: 'Buletin', category: 'kebijakan' },
        { id: 'rps', label: 'RPS', category: 'kebijakan' },
        { id: 'petunjuk_teknis', label: 'Petunjuk Teknis', category: 'kebijakan' },
        { id: 'peraturan_univ', label: 'Peraturan Univ', category: 'kebijakan' },
        { id: 'template', label: 'Template', category: 'kebijakan' },
        { id: 'sop', label: 'SOP', category: 'kebijakan' },
        { id: 'proses_bisnis_utama', label: 'Proses Bisnis Utama', category: 'proses_bisnis' },
        { id: 'proses_bisnis_pendukung', label: 'Proses Bisnis Pendukung', category: 'proses_bisnis' },
    ];

    const createForm = useForm({
        title: '',
        document_number: '',
        description: '',
        category: 'kebijakan',
        subcategory: 'panduan',
        owner: 'Bagian Penjaminan Mutu & Audit Internal',
        visibility: 'public',
        status: 'aktif',
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
        if (filterCategory !== 'all') {
            if (filterCategory === 'kebijakan' || filterCategory === 'proses_bisnis') {
                if (doc.category !== filterCategory) return false;
            } else {
                if (doc.subcategory !== filterCategory) return false;
            }
        }
        if (filterStatus !== 'all') {
            if (filterStatus === 'public' || filterStatus === 'private') {
                if (doc.visibility !== filterStatus) return false;
            } else {
                if (doc.status !== filterStatus) return false;
            }
        }
        return true;
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('documents.store'), {
            forceFormData: true,
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
            forceFormData: true,
            onSuccess: () => {
                setIsNewVersionOpen(false);
                setSelectedDoc(null);
                versionForm.reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Dokumen',
            description: 'Apakah Anda yakin ingin menghapus dokumen ini beserta seluruh versinya secara permanen?',
            onConfirm: () => deleteForm.delete(route('documents.destroy', id))
        });
    };

    const openHistory = (doc: Document) => {
        setSelectedDoc(doc);
        setIsHistoryOpen(true);
    };

    const openReview = (doc: Document) => {
        setSelectedDoc(doc);
        setIsReviewOpen(true);
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
                        <h1 className="text-2xl font-bold">
                            Dokumen & Kebijakan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Akses dan kelola arsip kebijakan, regulasi, dan
                            proses bisnis BPA.
                        </p>
                    </div>
                </div>

                {/* Filter Navigation (Kategori & Status) */}
                <div className="flex flex-wrap items-center gap-3 border-b pb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Kategori:
                        </span>
                        <Select
                            value={filterCategory}
                            onValueChange={setFilterCategory}
                        >
                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Kategori
                                </SelectItem>
                                <SelectItem value="kebijakan">
                                    Kebijakan & Regulasi
                                </SelectItem>
                                <SelectItem value="proses_bisnis">
                                    Proses Bisnis
                                </SelectItem>
                                <SelectItem value="panduan">Panduan</SelectItem>
                                <SelectItem value="pedoman">Pedoman</SelectItem>
                                <SelectItem value="buletin">Buletin</SelectItem>
                                <SelectItem value="rps">RPS</SelectItem>
                                <SelectItem value="petunjuk_teknis">
                                    Petunjuk Teknis
                                </SelectItem>
                                <SelectItem value="peraturan_univ">
                                    Peraturan Univ
                                </SelectItem>
                                <SelectItem value="template">
                                    Template
                                </SelectItem>
                                <SelectItem value="sop">SOP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Status:
                        </span>
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger className="w-[160px] h-9 text-xs">
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(filterCategory !== "all" || filterStatus !== "all") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterCategory("all");
                                setFilterStatus("all");
                            }}
                            className="h-9 px-3 text-xs text-red-600 hover:text-red-700"
                        >
                            Reset Filter
                        </Button>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="w-full sm:w-42 shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Dokumen
                    </Button>
                </div>

                {/* Documents Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        {filteredDocs.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="h-12 w-12 opacity-30 mb-3" />
                                <p className="font-medium">
                                    Tidak ada dokumen ditemukan
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            Nama Dokumen
                                        </th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            Versi & Status
                                        </th>
                                        <th className="hidden md:table-cell px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            Pengunggah
                                        </th>
                                        <th className="text-right px-6 py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredDocs.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            onClick={() => openReview(doc)}
                                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                <div>
                                                    <span className="block text-sm text-foreground hover:text-primary transition-colors">
                                                        {doc.title}
                                                    </span>
                                                    {doc.document_number && (
                                                        <span className="block font-mono text-[11px] text-muted-foreground mt-0.5">
                                                            {
                                                                doc.document_number
                                                            }
                                                        </span>
                                                    )}
                                                    {doc.description && (
                                                        <span className="block text-xs text-muted-foreground line-clamp-1 max-w-[300px] mt-0.5">
                                                            {doc.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge
                                                        variant={
                                                            doc.category ===
                                                            "kebijakan"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {doc.category ===
                                                        "kebijakan"
                                                            ? "Kebijakan"
                                                            : "Proses Bisnis"}
                                                    </Badge>
                                                    {doc.subcategory && (
                                                        <span className="text-[11px] text-muted-foreground capitalize">
                                                            {doc.subcategory.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                                                        {doc.current_version}
                                                    </span>
                                                    {doc.visibility ===
                                                    "public" ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-1"
                                                        >
                                                            <Globe className="h-2.5 w-2.5" />{" "}
                                                            Public
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] text-muted-foreground flex items-center gap-1"
                                                        >
                                                            <Lock className="h-2.5 w-2.5" />{" "}
                                                            Private
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4">
                                                <span className="text-xs text-muted-foreground">
                                                    {doc.uploader?.name ||
                                                        "Sistem"}
                                                </span>
                                            </td>
                                            <td
                                                className="px-6 py-4 text-right"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Review Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:text-primary"
                                                        onClick={() =>
                                                            openReview(doc)
                                                        }
                                                        title="Review Dokumen"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {/* Download current version */}
                                                    {doc.versions.length >
                                                        0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            asChild
                                                            title="Unduh Dokumen"
                                                        >
                                                            <a
                                                                href={route(
                                                                    "documents.download",
                                                                    doc
                                                                        .versions[
                                                                        doc
                                                                            .versions
                                                                            .length -
                                                                            1
                                                                    ].id,
                                                                )}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openHistory(doc)
                                                        }
                                                        title="Riwayat Versi"
                                                    >
                                                        <History className="h-4 w-4" />
                                                    </Button>

                                                    {!isStaff && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                                                onClick={() =>
                                                                    openNewVersion(
                                                                        doc,
                                                                    )
                                                                }
                                                                title="Unggah Versi Baru"
                                                            >
                                                                <ArrowUpCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        doc.id,
                                                                    )
                                                                }
                                                                title="Hapus"
                                                            >
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

            {/* Review Document Dialog (Fullscreen 100% Viewport PDF/File Viewer) */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="!max-w-screen !w-screen !h-screen !max-h-screen !rounded-none !border-0 !p-0 !m-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !gap-0 flex flex-col bg-slate-950 text-white overflow-hidden z-[100] [&>button]:hidden">
                    {selectedDoc && (
                        <>
                            {/* Top Navbar */}
                            <div className="h-12 px-4 flex items-center justify-between bg-slate-900 border-b border-slate-800 shrink-0 select-none">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex items-center gap-2 truncate">
                                        <h3 className="text-sm font-semibold truncate text-slate-100">
                                            {selectedDoc.title}
                                        </h3>
                                        <span className="font-mono text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded shrink-0">
                                            {selectedDoc.current_version}
                                        </span>
                                    </div>
                                    {selectedDoc.document_number && (
                                        <span className="hidden sm:inline font-mono text-xs text-slate-400 shrink-0">
                                            | {selectedDoc.document_number}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsReviewOpen(false);
                                            openHistory(selectedDoc);
                                        }}
                                        className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 h-8"
                                    >
                                        <History className="h-3.5 w-3.5 mr-1.5" />
                                        Riwayat
                                    </Button>

                                    {selectedDoc.versions &&
                                        selectedDoc.versions.length > 0 && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 text-xs bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                                            >
                                                <a
                                                    href={route(
                                                        "documents.download",
                                                        selectedDoc.versions[
                                                            selectedDoc.versions
                                                                .length - 1
                                                        ].id,
                                                    )}
                                                >
                                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                                    Unduh
                                                </a>
                                            </Button>
                                        )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsReviewOpen(false)}
                                        className="h-8 px-2.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors"
                                    >
                                        Tutup ✕
                                    </Button>
                                </div>
                            </div>

                            {/* Fullscreen Document Content */}
                            <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
                                {selectedDoc.versions &&
                                selectedDoc.versions.length > 0 ? (
                                    (() => {
                                        const latestVer =
                                            selectedDoc.versions[
                                                selectedDoc.versions.length - 1
                                            ];
                                        const isPdfOrImage =
                                            latestVer.file_path.endsWith(
                                                ".pdf",
                                            ) ||
                                            latestVer.file_path.endsWith(
                                                ".png",
                                            ) ||
                                            latestVer.file_path.endsWith(
                                                ".jpg",
                                            ) ||
                                            latestVer.file_path.endsWith(
                                                ".jpeg",
                                            );

                                        if (isPdfOrImage) {
                                            return (
                                                <iframe
                                                    src={route(
                                                        "documents.preview",
                                                        latestVer.id,
                                                    )}
                                                    className="w-full h-full border-0 absolute inset-0"
                                                    title="Document Preview Fullscreen"
                                                />
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 text-center">
                                                    <FileText className="h-16 w-16 text-slate-400 mb-4 opacity-80" />
                                                    <p className="font-semibold text-lg">
                                                        Format Dokumen Office
                                                        (DOCX / XLSX)
                                                    </p>
                                                    <p className="text-sm text-slate-300 max-w-md mt-2 mb-6 leading-relaxed">
                                                        Pratinjau langsung untuk
                                                        format Office tidak
                                                        tersedia di peramban.
                                                        Silakan klik tombol di
                                                        bawah untuk mengunduh
                                                        dan membuka berkas.
                                                    </p>
                                                    <Button
                                                        asChild
                                                        size="default"
                                                        variant="secondary"
                                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        <a
                                                            href={route(
                                                                "documents.download",
                                                                latestVer.id,
                                                            )}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Unduh Berkas (
                                                            {
                                                                latestVer.version_number
                                                            }
                                                            )
                                                        </a>
                                                    </Button>
                                                </div>
                                            );
                                        }
                                    })()
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-6 text-slate-400 text-base">
                                        Berkas dokumen belum tersedia.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Document Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Dokumen Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-600 dark:text-red-400 space-y-1">
                                <span className="font-semibold block">
                                    Gagal mengunggah dokumen:
                                </span>
                                {Object.entries(createForm.errors).map(
                                    ([key, err], idx) => (
                                        <div key={idx}>• {err}</div>
                                    ),
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="title">Nama Dokumen *</Label>
                                <Input
                                    id="title"
                                    value={createForm.data.title}
                                    onChange={(e) =>
                                        createForm.setData(
                                            "title",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="doc_num">Nomor Dokumen</Label>
                                <Input
                                    id="doc_num"
                                    value={createForm.data.document_number}
                                    onChange={(e) =>
                                        createForm.setData(
                                            "document_number",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. BPA/2026/01"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) =>
                                    createForm.setData(
                                        "description",
                                        e.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={createForm.data.category}
                                    onValueChange={(val: any) =>
                                        createForm.setData("category", val)
                                    }
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kebijakan">
                                            Kebijakan & Regulasi
                                        </SelectItem>
                                        <SelectItem value="proses_bisnis">
                                            Proses Bisnis
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="subcat">Subkategori</Label>
                                <Select
                                    value={createForm.data.subcategory}
                                    onValueChange={(val: any) =>
                                        createForm.setData("subcategory", val)
                                    }
                                >
                                    <SelectTrigger id="subcat">
                                        <SelectValue placeholder="Pilih Subkategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="visibility">Status Akses</Label>
                                <Select
                                    value={createForm.data.visibility}
                                    onValueChange={(val: any) =>
                                        createForm.setData("visibility", val)
                                    }
                                >
                                    <SelectTrigger id="visibility">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">
                                            Public (Ditampilkan)
                                        </SelectItem>
                                        <SelectItem value="private">
                                            Private (Internal)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="version">Versi Awal</Label>
                                <Input
                                    id="version"
                                    value={createForm.data.version_number}
                                    onChange={(e) =>
                                        createForm.setData(
                                            "version_number",
                                            e.target.value,
                                        )
                                    }
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
                                onChange={(e) =>
                                    createForm.setData(
                                        "file",
                                        e.target.files
                                            ? e.target.files[0]
                                            : null,
                                    )
                                }
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Format didukung: PDF, DOC, DOCX, XLS, XLSX, PNG,
                                JPG, JPEG (Max 10MB)
                            </p>
                        </div>

                        <DialogFooter>
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
                            >
                                {createForm.processing
                                    ? "Mengunggah..."
                                    : "Unggah Dokumen"}
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
                        <form
                            onSubmit={handleNewVersionSubmit}
                            className="space-y-4"
                        >
                            {Object.keys(versionForm.errors).length > 0 && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-600 dark:text-red-400 space-y-1">
                                    <span className="font-semibold block">
                                        Gagal mengunggah versi baru:
                                    </span>
                                    {Object.entries(versionForm.errors).map(
                                        ([key, err], idx) => (
                                            <div key={idx}>• {err}</div>
                                        ),
                                    )}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                Anda memperbarui dokumen:{" "}
                                <strong>{selectedDoc.title}</strong>
                            </p>
                            <div className="space-y-1">
                                <Label htmlFor="new-version">
                                    Nomor Versi Baru
                                </Label>
                                <Input
                                    id="new-version"
                                    value={versionForm.data.version_number}
                                    onChange={(e) =>
                                        versionForm.setData(
                                            "version_number",
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new-desc">
                                    Catatan Perubahan / Deskripsi (Opsional)
                                </Label>
                                <Textarea
                                    id="new-desc"
                                    value={versionForm.data.description}
                                    onChange={(e) =>
                                        versionForm.setData(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. Perubahan pada Bab II, Pembaruan data infografis"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-file">
                                    Berkas Versi Baru
                                </Label>
                                <Input
                                    id="new-file"
                                    type="file"
                                    onChange={(e) =>
                                        versionForm.setData(
                                            "file",
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsNewVersionOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={versionForm.processing}
                                >
                                    {versionForm.processing
                                        ? "Mengunggah..."
                                        : "Unggah Versi Baru"}
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
                                <CardDescription>
                                    {selectedDoc.title}
                                </CardDescription>
                            </DialogHeader>
                            <div className="py-2 max-h-[300px] overflow-y-auto space-y-3">
                                {selectedDoc.versions.map((ver) => (
                                    <div
                                        key={ver.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm text-sm"
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-xs">
                                                    {ver.version_number}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        ver.created_at,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        { dateStyle: "medium" },
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                Diunggah oleh:{" "}
                                                {ver.creator?.name || "Sistem"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <a
                                                href={route(
                                                    "documents.download",
                                                    ver.id,
                                                )}
                                            >
                                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                                Unduh
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    onClick={() => setIsHistoryOpen(false)}
                                >
                                    Tutup
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onOpenChange={(open) =>
                    setConfirmState((prev) => ({ ...prev, isOpen: open }))
                }
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.onConfirm}
            />
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
