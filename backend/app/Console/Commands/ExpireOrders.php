<?php

namespace App\Console\Commands;

use App\Services\OrderExpiryService;
use Illuminate\Console\Command;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire {--minutes= : Override the timeout (0 = every unpaid order)}';

    protected $description = 'Cancel unpaid orders past the timeout and return their stock';

    public function handle(OrderExpiryService $expiry): int
    {
        $minutes = $this->option('minutes') !== null
            ? max(0, (int) $this->option('minutes'))
            : (int) config('shop.pending_order_minutes');

        $count = $expiry->expire($minutes);
        $this->info("Cancelled {$count} unpaid order(s) older than {$minutes} minutes.");

        return self::SUCCESS;
    }
}
