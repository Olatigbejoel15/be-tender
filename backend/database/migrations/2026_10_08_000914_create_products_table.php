<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')           // links to categories.id
                  ->constrained()                      // DB enforces the link
                  ->cascadeOnDelete();                 // delete category = delete its products
            $table->string('name');
            $table->string('slug')->unique();          // used in /product/[slug]
            $table->text('description');
            $table->unsignedInteger('price');          // whole naira, never negative
            $table->string('fabric')->nullable();
            $table->text('care')->nullable();
            $table->json('features')->nullable();      // list of bullet points
            $table->json('sizes');                     // e.g. ["S","M","L"]
            $table->json('colors');                    // e.g. [{"name":"Black","hex":"#000"}]
            $table->json('images');                    // list of image paths
            $table->boolean('is_sold_out')->default(false);
            $table->boolean('is_featured')->default(false); // shown in Featured Drops
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
