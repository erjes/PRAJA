<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('document_number')->nullable()->after('title');
            $table->string('subcategory')->default('panduan')->after('category');
            $table->string('owner')->default('Internal BPA')->after('subcategory');
            $table->date('effective_date')->nullable()->after('owner');
            $table->string('clause')->nullable()->after('effective_date');
            $table->enum('visibility', ['public', 'private'])->default('private')->after('clause');
            $table->enum('status', ['aktif', 'nonaktif', 'draft'])->default('aktif')->after('visibility');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'document_number',
                'subcategory',
                'owner',
                'effective_date',
                'clause',
                'visibility',
                'status',
            ]);
        });
    }
};
