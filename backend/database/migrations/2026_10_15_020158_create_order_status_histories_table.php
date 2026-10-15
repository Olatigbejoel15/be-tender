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
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();         // Which order
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Who did it (null = the system)
            $table->string('from_status', 20)->nullable();                           // Null for the very first entry
            $table->string('to_status', 20);
            $table->string('note', 500)->nullable();                                 // Optional reason or tracking info
            $table->timestamp('created_at')->useCurrent();                           // History is never edited, so no updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
    }
};
