<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\User;
use App\Models\Event;
use App\Models\Project;
use App\Models\Task;
use App\Models\SubTask;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\DocumentActivityLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Divisions
        $itDivision = Division::create([
            'name' => 'IT & Infrastruktur',
            'description' => 'Divisi yang menangani teknologi informasi dan infrastruktur sistem.',
        ]);

        $hrDivision = Division::create([
            'name' => 'Sumber Daya Manusia',
            'description' => 'Divisi pengelolaan SDM dan administrasi kepegawaian.',
        ]);

        $keuanganDivision = Division::create([
            'name' => 'Keuangan & Anggaran',
            'description' => 'Divisi pengelolaan keuangan, anggaran, dan pelaporan fiskal.',
        ]);

        // Create Admin
        $superAdmin = User::create([
            'name' => 'Administrator',
            'email' => 'mudoparsobran@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'division_id' => null,
            'is_otp_verified' => true,
        ]);

        // Create Staff
        $budiManager = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi.manager@bpa.go.id',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'division_id' => $itDivision->id,
            'is_otp_verified' => true,
        ]);

        $sariManager = User::create([
            'name' => 'Sari Dewi',
            'email' => 'sari.manager@bpa.go.id',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'division_id' => $hrDivision->id,
            'is_otp_verified' => true,
        ]);

        // Create Staff
        $ahmadStaff = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad.staff@bpa.go.id',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'division_id' => $itDivision->id,
            'is_otp_verified' => true,
        ]);

        $rinaStaff = User::create([
            'name' => 'Rina Hastuti',
            'email' => 'rina.staff@bpa.go.id',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'division_id' => $keuanganDivision->id,
            'is_otp_verified' => true,
        ]);

        // Seed Events
        Event::create([
            'title' => 'Rapat Kerja Bulanan BPA',
            'description' => 'Evaluasi capaian kinerja bulanan seluruh divisi di lingkungan Badan Pemeriksa Anggaran.',
            'start_time' => now()->startOfMonth()->addDays(14)->setHour(9)->setMinute(0),
            'end_time' => now()->startOfMonth()->addDays(14)->setHour(12)->setMinute(0),
            'division_id' => null, // Company-wide
            'created_by' => $superAdmin->id,
        ]);

        Event::create([
            'title' => 'Maintenance Server Utama',
            'description' => 'Migrasi dan pemeliharaan rutin server database IT BPA.',
            'start_time' => now()->startOfMonth()->addDays(20)->setHour(23)->setMinute(0),
            'end_time' => now()->startOfMonth()->addDays(21)->setHour(3)->setMinute(0),
            'division_id' => $itDivision->id,
            'created_by' => $budiManager->id,
        ]);

        Event::create([
            'title' => 'Sosialisasi Asuransi Kesehatan Baru',
            'description' => 'Sosialisasi perubahan skema jaminan kesehatan bagi pegawai BPA.',
            'start_time' => now()->startOfMonth()->addDays(25)->setHour(13)->setMinute(0),
            'end_time' => now()->startOfMonth()->addDays(25)->setHour(15)->setMinute(0),
            'division_id' => $hrDivision->id,
            'created_by' => $sariManager->id,
        ]);

        // Seed Projects
        $itProject = Project::create([
            'title' => 'Pengembangan Portal BPA Terintegrasi (PRAJA)',
            'description' => 'Pembangunan aplikasi portal internal terintegrasi untuk event, tugas, dan dokumen.',
            'status' => 'ongoing',
            'start_date' => now()->subDays(10)->format('Y-m-d'),
            'end_date' => now()->addDays(30)->format('Y-m-d'),
            'division_id' => $itDivision->id,
            'created_by' => $budiManager->id,
        ]);

        $hrProject = Project::create([
            'title' => 'Penyusunan Rencana Kebutuhan Pegawai 2027',
            'description' => 'Analisis beban kerja dan rencana penambahan aparatur/staff tahun anggaran mendatang.',
            'status' => 'planned',
            'start_date' => now()->addDays(5)->format('Y-m-d'),
            'end_date' => now()->addDays(45)->format('Y-m-d'),
            'division_id' => $hrDivision->id,
            'created_by' => $sariManager->id,
        ]);

        // Seed Tasks
        $task1 = Task::create([
            'project_id' => $itProject->id,
            'title' => 'Implementasi Modul Autentikasi OTP & RBAC',
            'description' => 'Buat login berbasis email dan verifikasi OTP serta batasi rute berdasarkan role user.',
            'assigned_to' => $ahmadStaff->id,
            'status' => 'completed',
            'due_date' => now()->addDays(2),
        ]);

        SubTask::create([
            'task_id' => $task1->id,
            'title' => 'Desain tabel users dan modifikasi kolom OTP',
            'is_completed' => true,
        ]);
        SubTask::create([
            'task_id' => $task1->id,
            'title' => 'Implementasi OTP verification backend',
            'is_completed' => true,
        ]);
        SubTask::create([
            'task_id' => $task1->id,
            'title' => 'Buat middleware CheckRole',
            'is_completed' => true,
        ]);

        $task2 = Task::create([
            'project_id' => $itProject->id,
            'title' => 'Integrasi Layout Dashboard & Sidebar',
            'description' => 'Sambungkan layout admin dari ticketingbpa ke dashboard utama dengan menu dinamis.',
            'assigned_to' => $ahmadStaff->id,
            'status' => 'in_progress',
            'due_date' => now()->addDays(5),
        ]);

        SubTask::create([
            'task_id' => $task2->id,
            'title' => 'Salin berkas komponen dan hooks UI',
            'is_completed' => true,
        ]);
        SubTask::create([
            'task_id' => $task2->id,
            'title' => 'Ubah referensi route dan menu ke web portal',
            'is_completed' => false,
        ]);

        $task3 = Task::create([
            'project_id' => $itProject->id,
            'title' => 'Deployment Staging Environment',
            'description' => 'Konfigurasi web server staging untuk pengujian internal oleh manajemen.',
            'assigned_to' => $budiManager->id,
            'status' => 'pending',
            'due_date' => now()->addDays(10),
        ]);

        // Seed Documents
        $doc1 = Document::create([
            'title' => 'Panduan Kode Etik Pegawai BPA',
            'description' => 'Pedoman perilaku, hak, kewajiban, dan tata tertib aparatur di lingkungan Badan Pemeriksa Anggaran.',
            'category' => 'kebijakan',
            'current_version' => 'v1.2',
            'uploaded_by' => $superAdmin->id,
        ]);

        DocumentVersion::create([
            'document_id' => $doc1->id,
            'version_number' => 'v1.0',
            'file_path' => 'documents/ethics_v1.0.pdf',
            'created_by' => $superAdmin->id,
        ]);

        DocumentVersion::create([
            'document_id' => $doc1->id,
            'version_number' => 'v1.2',
            'file_path' => 'documents/ethics_v1.2.pdf',
            'created_by' => $superAdmin->id,
        ]);

        DocumentActivityLog::create([
            'document_id' => $doc1->id,
            'user_id' => $superAdmin->id,
            'action' => 'Mengunggah dokumen awal versi v1.0',
        ]);

        DocumentActivityLog::create([
            'document_id' => $doc1->id,
            'user_id' => $superAdmin->id,
            'action' => 'Memperbarui dokumen ke versi v1.2',
        ]);

        $doc2 = Document::create([
            'title' => 'SOP Pengajuan Anggaran Divisi',
            'description' => 'Standar Operasional Prosedur pengajuan dana taktis dan operasional bulanan masing-masing divisi.',
            'category' => 'proses_bisnis',
            'current_version' => 'v2.1',
            'uploaded_by' => $budiManager->id,
        ]);

        DocumentVersion::create([
            'document_id' => $doc2->id,
            'version_number' => 'v2.1',
            'file_path' => 'documents/sop_budget_v2.1.docx',
            'created_by' => $budiManager->id,
        ]);

        DocumentActivityLog::create([
            'document_id' => $doc2->id,
            'user_id' => $budiManager->id,
            'action' => 'Mengunggah dokumen awal versi v2.1',
        ]);
    }
}
