<?php

namespace App\Repositories\Contracts;

use Carbon\CarbonInterface;

interface AnalyticsRepositoryInterface
{
    public function totals(CarbonInterface $from, CarbonInterface $to): array;                          // ['revenue' => int, 'orders' => int]

    public function daily(CarbonInterface $from, CarbonInterface $to, int $offsetMinutes): array;       // 'YYYY-MM-DD' => row

    public function statusCounts(): array;                                                              // 'pending' => 3, ...

    public function topProducts(CarbonInterface $from, CarbonInterface $to, int $limit): array;         // Best sellers by units
}
