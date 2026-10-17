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
        Schema::create('product_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete(); // Which product
            $table->string('color', 40);                                       // Colour name, as written on the product
            $table->string('size', 20);                                        // Size / capacity / resistance option
            $table->unsignedInteger('quantity')->default(0);                   // Units on the shelf (never negative)
            $table->timestamps();
            $table->unique(['product_id', 'color', 'size']);                   // One row per option
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_stocks');
    }
};
