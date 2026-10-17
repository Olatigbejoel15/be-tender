<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Repositories\Contracts\StockRepositoryInterface;
use Carbon\Carbon;
use Closure;
use Illuminate\Support\Facades\Cache;

class AnalyticsService
{
    public function __construct(
        private AnalyticsRepositoryInterface $analytics,
        private StockRepositoryInterface $stock,
    ) {}

    public function summary(int $days): array
    {
        return $this->cached("summary:{$days}", function () use ($days) {
            $from = $this->windowStart($days);
            $now  = now();
            $cur  = $this->analytics->totals($from, $now);
            $prev = $this->analytics->totals($from->copy()->subDays($days), $from); // Same length, just before

            $counts = $this->analytics->statusCounts();
            $byStatus = [];
            foreach (OrderStatus::cases() as $status) {
                $byStatus[$status->value] = (int) ($counts[$status->value] ?? 0);  // Zero for empty statuses
            }

            return [
                'days'              => $days,
                'revenue'           => $cur['revenue'],
                'orders'            => $cur['orders'],
                'averageOrderValue' => $cur['orders'] > 0 ? (int) round($cur['revenue'] / $cur['orders']) : 0,
                'previous'          => $prev,
                'change'            => [
                    'revenuePercent' => $this->percent($cur['revenue'], $prev['revenue']),
                    'ordersPercent'  => $this->percent($cur['orders'], $prev['orders']),
                ],
                'ordersByStatus'    => $byStatus,
                'lowStockOptions'   => $this->stock->lowStock((int) config('shop.low_stock_threshold'))->count(),
            ];
        });
    }

    public function revenue(int $days): array
    {
        return $this->cached("revenue:{$days}", function () use ($days) {
            $tz = config('shop.timezone');
            $offset = now($tz)->utcOffset() - now(config('app.timezone'))->utcOffset(); // Minutes between Lagos and the app clock
            $rows = $this->analytics->daily($this->windowStart($days), now(), $offset);

            $series = [];
            for ($i = $days - 1; $i >= 0; $i--) {                                    // Every day appears, even with no sales
                $day = now($tz)->subDays($i)->toDateString();
                $series[] = [
                    'date'    => $day,
                    'revenue' => (int) ($rows[$day]->revenue ?? 0),
                    'orders'  => (int) ($rows[$day]->orders ?? 0),
                ];
            }

            return $series;
        });
    }

    public function topProducts(int $days, int $limit): array
    {
        return $this->cached("top:{$days}:{$limit}", function () use ($days, $limit) {
            return array_map(fn ($r) => [
                'productId' => (int) $r->product_id,
                'name'      => $r->name,
                'units'     => (int) $r->units,
                'revenue'   => (int) $r->revenue,
            ], $this->analytics->topProducts($this->windowStart($days), now(), $limit));
        });
    }

    // Start of the day ($days - 1) ago in Lagos, expressed in the app's timezone (what the database stores)
    private function windowStart(int $days): Carbon
    {
        return now(config('shop.timezone'))->subDays($days - 1)->startOfDay()->setTimezone(config('app.timezone'));
    }

    private function percent(int $current, int $previous): ?float
    {
        return $previous === 0 ? null : round(($current - $previous) / $previous * 100, 1); // null = nothing to compare with
    }

    // Short cache: dashboards refresh often and one minute of delay is fine
    private function cached(string $key, Closure $callback): mixed
    {
        $ttl = (int) config('shop.analytics_cache_ttl');

        return $ttl > 0 ? Cache::remember("analytics:{$key}", $ttl, $callback) : $callback();
    }
}
