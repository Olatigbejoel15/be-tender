<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    // POST /api/v1/register
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->toData());

        return response()->json([
            'user'  => new UserResource($result['user']),
            'token' => $result['token'],
        ], 201); // 201 = created
    }

    // POST /api/v1/login
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login($request->toData());

        return response()->json([
            'user'  => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    // GET /api/v1/me (needs a token)
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    // POST /api/v1/logout (needs a token)
    public function logout(Request $request): Response
    {
        $this->auth->logout($request->user());

        return response()->noContent(); // 204 = done, nothing to return
    }
}
