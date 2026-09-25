import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Search, Download, Eye, FileText } from 'lucide-react';

interface DocumentVersion {
    id: number;
    version_number: string;
    file_path: string;
    created_at: string;
    creator?: { id: number; name: string } | null;
}

interface DocumentItem {
    id: number;
    title: string;
    document_number?: string | null;
    description?: string | null;
    category: 'kebijakan' | 'proses_bisnis';
    subcategory?: string | null;
    current_version: string;
    created_at: string;
    versions?: DocumentVersion[];
    uploader?: { id: number; name: string } | null;
}

interface PageProps {
    documents: DocumentItem[];
    [key: string]: any;
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

export default function PublicDocumentsIndex({ documents = [] }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'kebijakan' | 'proses_bisnis'>('all');
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const openPreview = (doc: DocumentItem) => {
        setSelectedDoc(doc);
        setIsPreviewOpen(true);
    };

    const filteredDocs = documents.filter((doc) => {
        if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const haystack = [doc.title, doc.document_number, doc.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            if (!haystack.includes(q)) return false;
        }
        return true;
    });

    return (
        <PublicLayout active="dokumen">
            <Head title="Dokumen Publik - PRAJA" />

            <section className="pt-14 pb-8 px-3 sm:px-6 md:px-8 w-full text-center max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Dokumen Publik
                </h1>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Akses seluruh dokumen kebijakan, pedoman, dan proses bisnis
                    yang bersifat publik. Dokumen internal hanya dapat diakses
                    setelah masuk ke akun Anda.
                </p>
            </section>

            <section className="pb-16 px-3 sm:px-6 md:px-8 w-full max-w-5xl mx-auto">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama dokumen, nomor dokumen, atau kata kunci..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#901418] text-slate-900 shadow-sm"
                        />
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {(
                            [
                                { key: 'all', label: 'Semua' },
                                { key: 'kebijakan', label: 'Kebijakan' },
                                { key: 'proses_bisnis', label: 'Proses Bisnis' },
                            ] as const
                        ).map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setCategoryFilter(f.key)}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border ${
                                    categoryFilter === f.key
                                        ? 'bg-[#901418] text-white border-[#901418] shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#901418]/50 hover:text-[#901418]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filteredDocs.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
                        Tidak ada dokumen publik yang cocok dengan pencarian Anda.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredDocs.map((doc) => {
                            const latestVer =
                                doc.versions && doc.versions.length > 0 ? doc.versions[0] : null;
                            return (
                                <div
                                    key={doc.id}
                                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#901418]/40 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-red-50 text-[#901418] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                                                {doc.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                                {doc.document_number && (
                                                    <span className="font-semibold text-slate-600">
                                                        {doc.document_number}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span>
                                                    {doc.category === 'kebijakan' ? 'Kebijakan' : 'Proses Bisnis'}
                                                </span>
                                                {doc.subcategory && subcategoryLabels[doc.subcategory] && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{subcategoryLabels[doc.subcategory]}</span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span className="text-[#901418] font-semibold">
                                                    {doc.current_version || 'v1.0'}
                                                </span>
                                            </div>
                                            {doc.description && (
                                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 max-w-xl">
                                                    {doc.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
                                        <button
                                            onClick={() => openPreview(doc)}
                                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                                            Pratinjau
                                        </button>

                                        {latestVer && (
                                            <a
                                                href={route('documents.download', latestVer.id)}
                                                className="px-4 py-1.5 rounded-xl bg-[#901418] hover:bg-[#7a1014] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Unduh
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Fullscreen PDF Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="!max-w-screen !w-screen !h-screen !max-h-screen !rounded-none !p-0 !border-0 flex flex-col bg-slate-900 text-white overflow-hidden z-[100]">
                    {selectedDoc && (
                        <>
                            <div className="h-12 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-6 h-6 rounded bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">
                                        PDF
                                    </div>
                                    <span className="text-sm font-bold truncate text-slate-200">
                                        {selectedDoc.title}
                                    </span>
                                    {selectedDoc.current_version && (
                                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                            {selectedDoc.current_version}
                                        </span>
                                    )}
                                </div>

                                {selectedDoc.versions && selectedDoc.versions.length > 0 && (
                                    <a
                                        href={route('documents.download', selectedDoc.versions[0].id)}
                                        className="px-3 py-1.5 rounded bg-[#901418] hover:bg-[#7a1014] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Unduh Berkas
                                    </a>
                                )}
                            </div>

                            <div className="flex-1 w-full h-full relative bg-slate-900 flex items-center justify-center">
                                {selectedDoc.versions && selectedDoc.versions.length > 0 ? (
                                    <iframe
                                        src={route('documents.preview', selectedDoc.versions[0].id)}
                                        className="w-full h-full border-0 absolute inset-0"
                                        title={selectedDoc.title}
                                    />
                                ) : (
                                    <div className="text-center p-8 text-slate-400 max-w-md">
                                        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 font-black flex items-center justify-center mx-auto mb-3 text-lg">
                                            PDF
                                        </div>
                                        <p className="text-base font-semibold text-slate-300">
                                            Pratinjau langsung tidak tersedia
                                        </p>
                                        <p className="text-xs mt-1 text-slate-500">
                                            Berkas dokumen ini belum diunggah.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
