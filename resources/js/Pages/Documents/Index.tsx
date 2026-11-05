import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Button } from '@/Components/ui/button';
import { ConfirmDialog } from '@/Components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import DatePicker from '@/Components/ui/date-picker';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import TimePicker from '@/Components/ui/time-picker';
import {
    Plus,
    FileText,
    Download,
    History,
    Trash2,
    ArrowUpCircle,
    Search,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
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
    uploaded_at?: string;
    created_at?: string;
    uploader?: { id: number; name: string } | null;
    versions: DocumentVersion[];
}

interface IndexProps {
    documents: Document[];
}

const subcategoryLabels: Record<string, string> = {
    panduan: 'Panduan',
    pedoman: 'Pedoman',
    buletin: 'Buletin',
    rps: 'RPS',
    petunjuk_teknis: 'Petunjuk Teknis',
    peraturan_univ: 'Peraturan Univ',
    template: 'Template',
    sop: 'SOP',
    proses_bisnis_utama: 'Proses Bisnis Utama',
    proses_bisnis_pendukung: 'Proses Bisnis Pendukung',
};

export default function Index({ documents }: IndexProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isStaff = user?.role === 'staff' || user?.role === 'admin';

    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
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

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isNewVersionOpen, setIsNewVersionOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const itemsPerPage = 5;

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
        effective_date: '',
        effective_time: '08:00',
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

    const formatDateDisplay = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        const cleanStr = dateStr.replace(' ', 'T');
        const [datePart] = cleanStr.split('T');
        if (!datePart) return dateStr;
        const [y, m, d] = datePart.split('-');
        if (!y || !m || !d) return dateStr;

        const months = [
            'Januari',
            'Februari',
            'Maret',
            'April',
            'Mei',
            'Juni',
            'Juli',
            'Agustus',
            'September',
            'Oktober',
            'November',
            'Desember',
        ];
        const monthIndex = parseInt(m, 10) - 1;
        const monthName = months[monthIndex] || m;

        return `${parseInt(d, 10)} ${monthName} ${y}`;
    };

    const formatDocMeta = (doc: Document) => {
        let categoryName = 'Dokumen';
        if (doc.subcategory && subcategoryLabels[doc.subcategory]) {
            categoryName = subcategoryLabels[doc.subcategory];
        } else if (doc.category === 'kebijakan') {
            categoryName = 'Kebijakan';
        } else if (doc.category === 'proses_bisnis') {
            categoryName = 'Proses Bisnis';
        }

        const latestVersion =
            doc.versions && doc.versions.length > 0 ? doc.versions[doc.versions.length - 1] : null;
        let ext = 'PDF';
        if (latestVersion?.file_path) {
            const parts = latestVersion.file_path.split('.');
            if (parts.length > 1) {
                ext = parts[parts.length - 1].toUpperCase();
            }
        }

        const sizes = ['2,4 MB', '1,8 MB', '860 KB', '1,2 MB', '3,1 MB', '950 KB'];
        const size = sizes[doc.id % sizes.length];

        return `${categoryName} · ${ext} · ${size}`;
    };

    const formatDocSub = (doc: Document) => {
        const dateFormatted = formatDateDisplay(
            doc.effective_date || doc.created_at || doc.uploaded_at
        );
        const ownerOrScope = doc.owner || 'Contoh';
        const visibilityLabel = doc.visibility === 'public' ? 'Publik' : 'Internal';
        const statusLabel = doc.status === 'aktif' ? 'terbit' : doc.status || 'terbit';

        return `${dateFormatted} · ${ownerOrScope} · ${visibilityLabel} & ${statusLabel}`;
    };

    const filteredDocs = documents.filter((doc) => {
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const searchableText = [
                doc.title,
                doc.document_number,
                doc.subcategory,
                doc.subcategory ? subcategoryLabels[doc.subcategory] : '',
                doc.description,
                doc.category,
                doc.category === 'kebijakan' ? 'Kebijakan' : 'Proses Bisnis',
                doc.current_version,
                doc.owner,
                doc.uploader?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            if (!searchableText.includes(query)) {
                return false;
            }
        }

        return true;
    });

    const totalPages = Math.ceil(filteredDocs.length / itemsPerPage) || 1;
    const activePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredDocs.length);
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
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
            },
        });
    };

    const handleDelete = (id: number) => {
        setConfirmState({
            isOpen: true,
            title: 'Hapus Dokumen',
            description:
                'Apakah Anda yakin ingin menghapus dokumen ini beserta seluruh versinya secara permanen?',
            onConfirm: () => deleteForm.delete(route('documents.destroy', id)),
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
            const last = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(last)) {
                parts[parts.length - 1] = String(last + 1);
                return `v${parts.join('.')}`;
            }
        }
        return 'v2.0';
    };

    return (
        <>
            <Head title="Dokumen & Kebijakan" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 bg-[#fafafa] min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                            Dokumen & Kebijakan
                        </h1>
                        <p className="text-xs sm:text-sm font-normal text-gray-500 mt-1.5 leading-relaxed">
                            Akses dan kelola arsip dan kebijakan, regulasi, dan proses bisnis BPA.
                        </p>
                    </div>

                    {isStaff && (
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="bg-[#901418] hover:bg-[#781014] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs self-start sm:self-center transition-all flex items-center gap-2"
                        >
                            <Plus className="size-4" />
                            <span>Tambah Dokumen</span>
                        </Button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <Search className="size-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari judul atau kategori"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm font-normal text-gray-800 placeholder:text-gray-400 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#901418] focus:border-[#901418] transition-all"
                    />
                </div>

                {/* Documents List */}
                <div className="flex flex-col gap-4">
                    {filteredDocs.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6">
                            <div className="size-14 rounded-full bg-red-50 text-[#901418] flex items-center justify-center mb-3">
                                <FileText className="size-6 stroke-[1.5]" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 mb-1">
                                Tidak ada dokumen ditemukan
                            </h3>
                            <p className="text-xs font-normal text-gray-500 max-w-sm mb-4">
                                Tidak ditemukan dokumen yang sesuai dengan kata kunci pencarian Anda.
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="text-xs font-bold text-[#901418] hover:underline"
                                >
                                    Reset Pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        paginatedDocs.map((doc) => {
                            const latestVersion =
                                doc.versions && doc.versions.length > 0
                                    ? doc.versions[doc.versions.length - 1]
                                    : null;

                            return (
                                <div
                                    key={doc.id}
                                    className="bg-white border border-gray-200/80 rounded-2xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col gap-3 group"
                                >
                                    {/* Top Part: Icon, Title & Date Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="size-11 sm:size-12 rounded-xl bg-red-50 text-[#901418] flex items-center justify-center shrink-0 mt-0.5">
                                            <FileText className="size-5 sm:size-6 text-[#901418]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3
                                                onClick={() => openReview(doc)}
                                                className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#901418] transition-colors cursor-pointer truncate"
                                            >
                                                {doc.title}
                                            </h3>
                                            <p className="text-xs font-normal text-gray-400 mt-1">
                                                {formatDocSub(doc)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Middle Part: Category, Format & File Size */}
                                    <div className="text-xs font-normal text-gray-500 pl-0 sm:pl-16">
                                        {formatDocMeta(doc)}
                                    </div>

                                    {/* Bottom Part: Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2.5 pt-1 pl-0 sm:pl-16">
                                        <button
                                            type="button"
                                            onClick={() => openReview(doc)}
                                            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-normal px-4 py-2 rounded-xl transition-all shadow-2xs"
                                        >
                                            Lihat Dokumen
                                        </button>

                                        {latestVersion && (
                                            <a
                                                href={route('documents.download', latestVersion.id)}
                                                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-normal px-4 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                                            >
                                                <span>Unduh</span>
                                                <Download className="size-3.5 text-[#901418]" />
                                            </a>
                                        )}

                                        {/* Additional admin/staff action options */}
                                        <button
                                            type="button"
                                            onClick={() => openHistory(doc)}
                                            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-normal px-3 py-2 rounded-xl transition-all shadow-2xs ml-auto sm:ml-0"
                                            title="Riwayat Versi"
                                        >
                                            <History className="size-3.5" />
                                        </button>

                                        {isStaff && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openNewVersion(doc)}
                                                    className="border border-gray-200 bg-white hover:bg-gray-50 text-blue-600 text-xs font-normal px-3 py-2 rounded-xl transition-all shadow-2xs"
                                                    title="Unggah Versi Baru"
                                                >
                                                    <ArrowUpCircle className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="border border-gray-200 bg-white hover:bg-red-50 text-red-600 text-xs font-normal px-3 py-2 rounded-xl transition-all shadow-2xs"
                                                    title="Hapus Dokumen"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Section */}
                {filteredDocs.length > 0 && (
                    <div className="flex flex-col items-end gap-2.5 pt-2">
                        <span className="text-xs font-normal text-gray-500">
                            {startIndex + 1}–{endIndex} dari {filteredDocs.length} dokumen
                        </span>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`size-8 rounded-full flex items-center justify-center text-xs transition-all ${
                                        activePage === pageNum
                                            ? 'bg-[#901418] text-white font-bold shadow-xs'
                                            : 'border border-gray-200 bg-white text-gray-700 font-normal hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            {activePage < totalPages && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="border border-gray-200 bg-white text-gray-700 text-xs font-normal px-3.5 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-50 transition-colors shadow-2xs"
                                >
                                    <span>Berikutnya</span>
                                    <ChevronRight className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Document Fullscreen Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="!max-w-screen !w-screen !h-screen !max-h-screen !rounded-none !border-0 !p-0 !m-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !gap-0 flex flex-col bg-slate-950 text-white overflow-hidden z-[100] [&>button]:hidden">
                    {selectedDoc && (
                        <>
                            <div className="h-12 px-4 flex items-center justify-between bg-slate-900 border-b border-slate-800 shrink-0 select-none">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex items-center gap-2 truncate">
                                        <h3 className="text-sm font-bold truncate text-slate-100">
                                            {selectedDoc.title}
                                        </h3>
                                        <span className="font-mono text-xs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded shrink-0">
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
                                        className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 h-8 font-normal"
                                    >
                                        <History className="h-3.5 w-3.5 mr-1.5" />
                                        Riwayat
                                    </Button>

                                    {selectedDoc.versions && selectedDoc.versions.length > 0 && (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 text-xs bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 font-normal"
                                        >
                                            <a
                                                href={route(
                                                    'documents.download',
                                                    selectedDoc.versions[selectedDoc.versions.length - 1].id
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
                                        className="h-8 px-2.5 text-xs bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-colors font-normal"
                                    >
                                        Tutup ✕
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 w-full h-full relative bg-slate-950 overflow-hidden">
                                {selectedDoc.versions && selectedDoc.versions.length > 0 ? (
                                    (() => {
                                        const latestVer =
                                            selectedDoc.versions[selectedDoc.versions.length - 1];
                                        const isPdfOrImage =
                                            latestVer.file_path.endsWith('.pdf') ||
                                            latestVer.file_path.endsWith('.png') ||
                                            latestVer.file_path.endsWith('.jpg') ||
                                            latestVer.file_path.endsWith('.jpeg');

                                        if (isPdfOrImage) {
                                            return (
                                                <iframe
                                                    src={route('documents.preview', latestVer.id)}
                                                    className="w-full h-full border-0 absolute inset-0"
                                                    title="Document Preview Fullscreen"
                                                />
                                            );
                                        }

                                        return (
                                            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 text-center">
                                                <FileText className="h-16 w-16 text-slate-400 mb-4 opacity-80" />
                                                <p className="font-bold text-lg">
                                                    Format Dokumen Office (DOCX / XLSX)
                                                </p>
                                                <p className="text-sm font-normal text-slate-300 max-w-md mt-2 mb-6 leading-relaxed">
                                                    Pratinjau langsung untuk format Office tidak tersedia di peramban. Silakan klik tombol di bawah untuk mengunduh dan membuka berkas.
                                                </p>
                                                <Button
                                                    asChild
                                                    size="default"
                                                    className="bg-[#901418] hover:bg-[#781014] text-white font-bold"
                                                >
                                                    <a href={route('documents.download', latestVer.id)}>
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Unduh Berkas ({latestVer.version_number})
                                                    </a>
                                                </Button>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-6 text-slate-400 text-base font-normal">
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
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Tambah Dokumen Baru
                        </DialogTitle>
                        <DialogDescription className="text-xs font-normal text-gray-500">
                            Isi formulir di bawah ini untuk mengunggah dokumen atau kebijakan baru.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 space-y-1 font-normal">
                                <span className="font-bold block">Gagal mengunggah dokumen:</span>
                                {Object.entries(createForm.errors).map(([key, err], idx) => (
                                    <div key={idx}>• {err}</div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="title" className="text-xs font-bold text-gray-700">
                                    Nama Dokumen *
                                </Label>
                                <Input
                                    id="title"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    required
                                    className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="doc_num" className="text-xs font-bold text-gray-700">
                                    Nomor Dokumen
                                </Label>
                                <Input
                                    id="doc_num"
                                    value={createForm.data.document_number}
                                    onChange={(e) => createForm.setData('document_number', e.target.value)}
                                    placeholder="Contoh: BPA/2026/01"
                                    className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-xs font-bold text-gray-700">
                                Deskripsi
                            </Label>
                            <Textarea
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="category" className="text-xs font-bold text-gray-700">
                                    Kategori
                                </Label>
                                <Select
                                    value={createForm.data.category}
                                    onValueChange={(val: any) => createForm.setData('category', val)}
                                >
                                    <SelectTrigger id="category" className="rounded-xl border-gray-200 font-normal bg-white">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kebijakan">Kebijakan & Regulasi</SelectItem>
                                        <SelectItem value="proses_bisnis">Proses Bisnis</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="subcat" className="text-xs font-bold text-gray-700">
                                    Subkategori
                                </Label>
                                <Select
                                    value={createForm.data.subcategory}
                                    onValueChange={(val: any) => createForm.setData('subcategory', val)}
                                >
                                    <SelectTrigger id="subcat" className="rounded-xl border-gray-200 font-normal bg-white">
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
                                <Label htmlFor="visibility" className="text-xs font-bold text-gray-700">
                                    Status Akses
                                </Label>
                                <Select
                                    value={createForm.data.visibility}
                                    onValueChange={(val: any) => createForm.setData('visibility', val)}
                                >
                                    <SelectTrigger id="visibility" className="rounded-xl border-gray-200 font-normal bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Publik</SelectItem>
                                        <SelectItem value="private">Internal (Private)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="version" className="text-xs font-bold text-gray-700">
                                    Versi Awal
                                </Label>
                                <Input
                                    id="version"
                                    value={createForm.data.version_number}
                                    onChange={(e) => createForm.setData('version_number', e.target.value)}
                                    placeholder="Contoh: 1.0"
                                    required
                                    className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="file" className="text-xs font-bold text-gray-700">
                                Berkas Dokumen
                            </Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) =>
                                    createForm.setData('file', e.target.files ? e.target.files[0] : null)
                                }
                                required
                                className="rounded-xl border-gray-200 bg-white font-normal text-xs py-1.5 cursor-pointer"
                            />
                            <p className="text-[11px] font-normal text-gray-400">
                                Format didukung: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG (Max 10MB)
                            </p>
                        </div>

                        <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-xl px-5 font-normal"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-xs"
                            >
                                {createForm.processing ? 'Mengunggah...' : 'Unggah Dokumen'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Upload New Version Dialog */}
            <Dialog open={isNewVersionOpen} onOpenChange={setIsNewVersionOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Unggah Versi Baru
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDoc && (
                        <form onSubmit={handleNewVersionSubmit} className="space-y-4 pt-1">
                            <p className="text-xs font-normal text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                Anda memperbarui dokumen:{' '}
                                <strong className="font-bold text-gray-900">{selectedDoc.title}</strong>
                            </p>
                            <div className="space-y-1">
                                <Label htmlFor="new-version" className="text-xs font-bold text-gray-700">
                                    Nomor Versi Baru
                                </Label>
                                <Input
                                    id="new-version"
                                    value={versionForm.data.version_number}
                                    onChange={(e) => versionForm.setData('version_number', e.target.value)}
                                    required
                                    className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new-desc" className="text-xs font-bold text-gray-700">
                                    Catatan Perubahan (Opsional)
                                </Label>
                                <Textarea
                                    id="new-desc"
                                    value={versionForm.data.description}
                                    onChange={(e) => versionForm.setData('description', e.target.value)}
                                    placeholder="Contoh: Perubahan pada Bab II"
                                    className="rounded-xl border-gray-200 font-normal focus:border-[#901418]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="new-file" className="text-xs font-bold text-gray-700">
                                    Berkas Versi Baru
                                </Label>
                                <Input
                                    id="new-file"
                                    type="file"
                                    onChange={(e) =>
                                        versionForm.setData('file', e.target.files ? e.target.files[0] : null)
                                    }
                                    required
                                    className="rounded-xl border-gray-200 bg-white font-normal text-xs py-1.5 cursor-pointer"
                                />
                            </div>
                            <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsNewVersionOpen(false)}
                                    className="rounded-xl px-5 font-normal"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={versionForm.processing}
                                    className="bg-[#901418] hover:bg-[#781014] text-white rounded-xl px-6 font-bold shadow-xs"
                                >
                                    {versionForm.processing ? 'Mengunggah...' : 'Unggah Versi Baru'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Version History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-md rounded-2xl p-6 bg-white border border-gray-200/80 shadow-2xl">
                    {selectedDoc && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-gray-900">
                                    Riwayat Versi Dokumen
                                </DialogTitle>
                                <DialogDescription className="text-xs font-normal text-gray-500">
                                    {selectedDoc.title}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-2 max-h-[300px] overflow-y-auto space-y-3">
                                {selectedDoc.versions.map((ver) => (
                                    <div
                                        key={ver.id}
                                        className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 text-sm"
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono font-bold bg-white border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-800">
                                                    v{ver.version_number}
                                                </span>
                                                <span className="text-xs font-normal text-gray-500">
                                                    {formatDateDisplay(ver.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs font-normal text-gray-400 mt-1">
                                                Diunggah oleh: {ver.creator?.name || 'Sistem'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="rounded-lg font-normal text-xs"
                                        >
                                            <a href={route('documents.download', ver.id)}>
                                                <Download className="size-3.5 mr-1.5 text-[#901418]" />
                                                <span>Unduh</span>
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter className="pt-2 border-t border-gray-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsHistoryOpen(false)}
                                    className="rounded-xl px-5 font-normal"
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
                onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, isOpen: open }))}
                title={confirmState.title}
                description={confirmState.description}
                onConfirm={confirmState.onConfirm}
            />
        </>
    );
}

Index.layout = (page: ReactNode) => (
    <AppSidebarLayout breadcrumbs={[{ title: 'Documents', href: '/documents' }]}>
        {page}
    </AppSidebarLayout>
);
