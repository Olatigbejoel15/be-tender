<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();     // Guests have no account
            $table->string('email')->nullable()->after('user_id');  // Receipts + guest lookup (filled below)
        });

        // DB::table('orders')                                          // Old orders: copy the customer's email over
        //     ->join('users', 'users.id', '=', 'orders.user_id')
        //     ->update(['orders.email' => DB::raw('LOWER(users.email)')]);

        // Old orders: copy the customer's email over (plain subquery, works on MySQL and SQLite)
        DB::statement('UPDATE orders SET email = (SELECT LOWER(users.email) FROM users WHERE users.id = orders.user_id) WHERE user_id IS NOT NULL');

        Schema::table('orders', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();     // Every order has one from now on
            $table->unique(['email', 'idempotency_key']);           // Repeat guard that also covers guests
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['email', 'idempotency_key']);
            $table->dropColumn('email');
            // user_id stays nullable: guest orders cannot be given an owner again
        });
    }
};
