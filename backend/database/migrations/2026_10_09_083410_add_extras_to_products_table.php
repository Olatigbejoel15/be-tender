<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('badge')->nullable()->after('price');       // "New", "Best Seller"
            $table->string('size_label')->default('Size')->after('sizes'); // "Size", "Capacity"...
            $table->json('sold_out_sizes')->nullable()->after('size_label'); // e.g. ["XL"]
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['badge', 'size_label', 'sold_out_sizes']); // undo the changes
        });
    }
};
