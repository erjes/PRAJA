<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\DocumentActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Load all documents with versions and uploader info
        $documents = Document::with(['versions.creator', 'uploader'])
            ->latest()
            ->get();

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'category' => 'required|in:kebijakan,proses_bisnis',
            'subcategory' => 'nullable|string|max:100',
            'owner' => 'nullable|string|max:150',
            'effective_date' => 'nullable|date',
            'clause' => 'nullable|string|max:100',
            'visibility' => 'nullable|in:public,private',
            'status' => 'nullable|in:aktif,nonaktif,draft',
            'version_number' => 'required|string|max:20',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg|max:10240', // max 10MB
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents');

            $document = Document::create([
                'title' => $validated['title'],
                'document_number' => $validated['document_number'] ?? null,
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'],
                'subcategory' => $validated['subcategory'] ?? 'panduan',
                'owner' => $validated['owner'] ?? ($user ? $user->name : 'Bagian Penjaminan Mutu & Audit Internal'),
                'effective_date' => $validated['effective_date'] ?? null,
                'clause' => $validated['clause'] ?? null,
                'visibility' => $validated['visibility'] ?? 'public',
                'status' => $validated['status'] ?? 'aktif',
                'current_version' => $validated['version_number'],
                'uploaded_by' => $user->id,
            ]);

            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $validated['version_number'],
                'file_path' => $path,
                'created_by' => $user->id,
            ]);

            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => "Mengunggah dokumen awal versi {$validated['version_number']}.",
            ]);

            return redirect()->route('documents.index')->with('success', 'Dokumen berhasil ditambahkan.');
        }

        return redirect()->back()->withErrors(['file' => 'File tidak valid.']);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'category' => 'required|in:kebijakan,proses_bisnis',
            'subcategory' => 'nullable|string|max:100',
            'owner' => 'nullable|string|max:150',
            'effective_date' => 'nullable|date',
            'clause' => 'nullable|string|max:100',
            'visibility' => 'nullable|in:public,private',
            'status' => 'nullable|in:aktif,nonaktif,draft',
            'version_number' => 'required|string|max:20',
            'file' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg|max:10240',
        ]);

        $document->update([
            'title' => $validated['title'],
            'document_number' => $validated['document_number'] ?? null,
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'subcategory' => $validated['subcategory'] ?? ($document->subcategory ?: 'panduan'),
            'owner' => $validated['owner'] ?? ($document->owner ?: ($user ? $user->name : 'Bagian Penjaminan Mutu & Audit Internal')),
            'effective_date' => $validated['effective_date'] ?? null,
            'clause' => $validated['clause'] ?? null,
            'visibility' => $validated['visibility'] ?? ($document->visibility ?: 'public'),
            'status' => $validated['status'] ?? ($document->status ?: 'aktif'),
            'current_version' => $validated['version_number'],
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents');

            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $validated['version_number'],
                'file_path' => $path,
                'created_by' => $user->id,
            ]);

            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => "Memperbarui dokumen ke versi {$validated['version_number']}.",
            ]);
        } else {
            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => "Memperbarui metadata dokumen ({$document->title}).",
            ]);
        }

        return redirect()->route('documents.index')->with('success', 'Dokumen berhasil diperbarui.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $user = Auth::user();

        // Delete all version files from storage
        foreach ($document->versions as $version) {
            Storage::delete($version->file_path);
        }

        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Dokumen berhasil dihapus.');
    }

    public function download(Request $request, DocumentVersion $version)
    {
        $document = $version->document;
        if ($document->visibility !== 'public' && !Auth::check()) {
            abort(403, 'Anda harus login untuk mengakses dokumen internal ini.');
        }

        if (!Storage::exists($version->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $originalExtension = pathinfo($version->file_path, PATHINFO_EXTENSION);
        $fileName = str_replace(' ', '_', $document->title) . "_v{$version->version_number}.{$originalExtension}";

        if (Auth::check()) {
            DocumentActivityLog::create([
                'document_id' => $document->id,
                'user_id' => Auth::id(),
                'action' => "Mengunduh versi {$version->version_number}.",
            ]);
        }

        return Storage::download($version->file_path, $fileName);
    }

    public function preview(Request $request, DocumentVersion $version)
    {
        $document = $version->document;
        if ($document->visibility !== 'public' && !Auth::check()) {
            abort(403, 'Anda harus login untuk mengakses dokumen internal ini.');
        }

        if (!Storage::exists($version->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $fullPath = Storage::path($version->file_path);
        $mimeType = Storage::mimeType($version->file_path) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
        ]);
    }
}
