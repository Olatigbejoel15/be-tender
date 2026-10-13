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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();         // Delete an order, delete its lines
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // Keep the line if the product is deleted
            $table->string('name');                            // Copied at purchase time
            $table->string('color');
            $table->string('size');
            $table->string('image')->nullable();               // That colour's photo at purchase time
            $table->unsignedInteger('unit_price');             // Price paid per item, in naira
            $table->unsignedTinyInteger('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
