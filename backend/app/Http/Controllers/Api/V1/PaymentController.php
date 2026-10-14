<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $payments) {}

    // POST /api/v1/orders/{reference}/pay (get the Paystack page URL)
    public function pay(Request $request, string $reference): JsonResponse
    {
        return response()->json([
            'authorizationUrl' => $this->payments->start($request->user(), $reference),
        ]);
    }

    // POST /api/v1/orders/{reference}/confirm (customer is back, check the payment)
    public function confirm(Request $request, string $reference): OrderResource
    {
        return new OrderResource($this->payments->confirm($request->user(), $reference));
    }

    // POST /api/v1/webhooks/paystack (called by Paystack, no login)
    public function webhook(Request $request): JsonResponse
    {
        $this->payments->handleWebhook($request->getContent(), $request->header('x-paystack-signature')); // Raw body is needed for the signature

        return response()->json(['ok' => true]);
    }
}
