<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactMessageRequest;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(private ContactService $contact) {}

    // POST /api/v1/contact
    public function store(ContactMessageRequest $request): JsonResponse
    {
        $this->contact->submit($request->messageData());

        return response()->json(['message' => "Message received. We'll reply within 24 hours."]);
    }
}