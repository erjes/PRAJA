<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('due_date');
            $table->string('brief_link')->nullable()->after('start_date');
            $table->string('submission_link')->nullable()->after('brief_link');
            $table->enum('review_status', ['pending', 'approved', 'revision'])->nullable()->after('status');
            $table->string('manager_email')->nullable()->after('review_status');
            $table->text('revision_notes')->nullable()->after('manager_email');
            $table->text('submission_notes')->nullable()->after('revision_notes');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'start_date',
                'brief_link',
                'submission_link',
                'review_status',
                'manager_email',
                'revision_notes',
                'submission_notes',
            ]);
        });
    }
};
