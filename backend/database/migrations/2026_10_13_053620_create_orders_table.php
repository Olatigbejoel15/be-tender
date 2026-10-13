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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();      // Who ordered. No cascade: orders survive as records
            $table->string('reference')->unique();            // Customer-facing code, e.g. BT-7K3M9QXA
            $table->string('status')->default('pending');     // See OrderStatus
            $table->unsignedInteger('subtotal');              // Items total, in naira
            $table->unsignedInteger('delivery_fee');
            $table->unsignedInteger('total');                 // subtotal + delivery_fee
            $table->string('recipient_name');                 // Delivery details
            $table->string('phone', 20);
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('payment_reference')->nullable();  // Filled in when Paystack is added
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
