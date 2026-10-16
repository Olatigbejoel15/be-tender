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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Who did it
            $table->string('action', 50)->index();                                   // e.g. product.updated
            $table->string('subject_type', 50);                                      // e.g. product
            $table->unsignedBigInteger('subject_id');                                // Which one
            $table->string('summary', 255);                                          // Human sentence
            $table->json('changes')->nullable();                                     // {field: {from, to}}
            $table->string('ip_address', 45)->nullable();                            // Where from
            $table->timestamp('created_at')->useCurrent();                           // Logs are never edited
            $table->index(['subject_type', 'subject_id']);                           // Fast "history of product 5"
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
