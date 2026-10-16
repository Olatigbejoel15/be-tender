<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_published')->default(true)->index(); // false = draft, hidden from the public site
            $table->unsignedInteger('version')->default(1);          // Bumps on every edit (conflict detection)
            $table->softDeletes();                                   // deleted_at: "deleted" products are hidden, not erased
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_published']);
            $table->dropColumn(['is_published', 'version']);
            $table->dropSoftDeletes();
        });
    }
};
