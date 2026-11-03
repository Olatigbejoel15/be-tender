<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsletterSubscribeRequest;
use App\Services\NewsletterService;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    public function __construct(private NewsletterService $newsletter) {}

    // POST /api/v1/newsletter
    public function store(NewsletterSubscribeRequest $request): JsonResponse
    {
        $this->newsletter->subscribe($request->signupData());

        return response()->json(['message' => "You're on the list. Welcome!"]); // same answer for new and existing addresses
    }
}