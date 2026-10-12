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
        Schema::create('product_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete(); // Delete a product, delete its photos
            $table->string('color')->nullable();          // Colour slug like "dark-blue"; null = main or gallery photo
            $table->unsignedTinyInteger('position')->default(1); // Order within the gallery
            $table->string('public_id');                  // Cloudinary id, for deleting or transforming later
            $table->string('url');                        // Full https link to the image
            $table->timestamps();

            $table->unique(['product_id', 'public_id']);  // The same photo is never stored twice
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_photos');
    }
};
