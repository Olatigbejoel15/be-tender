<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnalyticsRequest;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analytics) {}

    // GET /api/v1/admin/analytics/summary
    public function summary(AnalyticsRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->analytics->summary($request->days())]);
    }

    // GET /api/v1/admin/analytics/revenue
    public function revenue(AnalyticsRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->analytics->revenue($request->days())]);
    }

    // GET /api/v1/admin/analytics/top-products
    public function topProducts(AnalyticsRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->analytics->topProducts($request->days(), $request->limit())]);
    }
}
