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
            'description' => 'nullable|string',
            'category' => 'required|in:kebijakan,proses_bisnis',
            'version_number' => 'required|string|max:20',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg|max:10240', // max 10MB
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents');

            $document = Document::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'],
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
            'version_number' => 'required|string|max:20',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg|max:10240',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents');

            $document->update([
                'current_version' => $validated['version_number'],
                'description' => $validated['description'] ?? $document->description,
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
                'action' => "Memperbarui dokumen ke versi {$validated['version_number']}.",
            ]);

            return redirect()->route('documents.index')->with('success', 'Dokumen versi baru berhasil diunggah.');
        }

        return redirect()->back()->withErrors(['file' => 'File tidak valid.']);
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
        // Any authenticated user can download
        if (!Storage::exists($version->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $document = $version->document;
        $originalExtension = pathinfo($version->file_path, PATHINFO_EXTENSION);
        $fileName = str_replace(' ', '_', $document->title) . "_v{$version->version_number}.{$originalExtension}";

        // Log the download activity
        DocumentActivityLog::create([
            'document_id' => $document->id,
            'user_id' => $request->user()->id,
            'action' => "Mengunduh versi {$version->version_number}.",
        ]);

        return Storage::download($version->file_path, $fileName);
    }
}
