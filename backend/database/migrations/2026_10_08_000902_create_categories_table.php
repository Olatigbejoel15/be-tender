<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();                              // auto-increment primary key
            $table->string('name');                    // e.g. "Women"
            $table->string('slug')->unique();          // URL part, e.g. "women"
            $table->text('description')->nullable();   // optional blurb
            $table->timestamps();                      // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');            // used when rolling back
    }
};
