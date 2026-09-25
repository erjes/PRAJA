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
        
        // Create Admin
        $superAdmin = User::create([
            'name' => 'Administrator',
            'email' => 'mudoparsobran@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'division_id' => null,
            'is_otp_verified' => true,
        ]);

        $superAdmin = User::create([
            'name' => 'Putri Aulia Lutfiyah',
            'email' => 'putriaulialuthfiyah4140@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'division_id' => null,
            'is_otp_verified' => true,
        ]);

    }
}
