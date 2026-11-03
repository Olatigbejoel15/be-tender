<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;

class DeliveryController extends Controller
{
    public function __construct(private DeliveryService $delivery) {}

    // GET /api/v1/delivery-fees
    public function index(): JsonResponse
    {
        return response()->json($this->delivery->quote()); // { freeOver, fees: { Lagos: 3000, ... } }
    }
}