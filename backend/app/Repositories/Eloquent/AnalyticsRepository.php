<?php

namespace App\Repositories\Eloquent;

use App\Enums\OrderStatus;
use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    // Orders that count as real sales
    private function paidOrders(CarbonInterface $from, CarbonInterface $to): Builder
    {
        $statuses = array_map(fn (OrderStatus $s) => $s->value, [
            OrderStatus::Paid, OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Delivered,
        ]);

        return DB::table('orders')
            ->whereIn('status', $statuses)
            ->where('created_at', '>=', $from)
            ->where('created_at', '<', $to);
    }

    public function totals(CarbonInterface $from, CarbonInterface $to): array
    {
        $row = $this->paidOrders($from, $to)
            ->selectRaw('COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders')
            ->first();

        return ['revenue' => (int) $row->revenue, 'orders' => (int) $row->orders];
    }

    public function daily(CarbonInterface $from, CarbonInterface $to, int $offsetMinutes): array
    {
        return $this->paidOrders($from, $to)
            ->selectRaw("DATE(DATE_ADD(created_at, INTERVAL {$offsetMinutes} MINUTE)) as day, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders") // Shift to Lagos time, then take the date
            ->groupBy('day')
            ->get()->keyBy('day')->all();
    }

    public function statusCounts(): array
    {
        return DB::table('orders')
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')->all();
    }

    public function topProducts(CarbonInterface $from, CarbonInterface $to, int $limit): array
    {
        $statuses = array_map(fn (OrderStatus $s) => $s->value, [
            OrderStatus::Paid, OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Delivered,
        ]);

        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', $statuses)
            ->where('orders.created_at', '>=', $from)
            ->where('orders.created_at', '<', $to)
            ->selectRaw('order_items.product_id, MAX(order_items.name) as name, SUM(order_items.quantity) as units, SUM(order_items.quantity * order_items.unit_price) as revenue')
            ->groupBy('order_items.product_id')
            ->orderByDesc('units')->orderByDesc('revenue')
            ->limit($limit)
            ->get()->all();
    }
}
