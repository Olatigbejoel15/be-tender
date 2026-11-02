<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(private PasswordResetService $service) {}

    // POST /forgot-password
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $this->service->sendLink($request->validated('email'));

        return response()->json([
            'message' => 'If that email has an account, a reset link is on its way.', // same answer either way
        ]);
    }

    // POST /reset-password
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->service->reset($request->validated());

        return response()->json(['message' => 'Your password has been reset. You can sign in now.']);
    }
}