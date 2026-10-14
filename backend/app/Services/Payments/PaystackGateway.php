<?php

namespace App\Services\Payments;

use App\DTOs\PaymentVerification;
use App\Exceptions\PaymentException;
use App\Services\Contracts\PaymentGatewayInterface;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackGateway implements PaymentGatewayInterface
{
    // Shared request setup: base URL, secret key, JSON, timeout
    private function http(): PendingRequest
    {
        return Http::baseUrl(config('services.paystack.base_url'))
            ->withToken((string) config('services.paystack.secret_key'))
            ->acceptJson()
            ->timeout(15);
    }

    public function initialize(string $reference, int $amountKobo, string $email, string $callbackUrl, array $metadata = []): string
    {
        $res = $this->http()->post('/transaction/initialize', [
            'reference'    => $reference,    // Our unique id for this attempt
            'amount'       => $amountKobo,   // Paystack wants kobo (naira x 100)
            'email'        => $email,
            'currency'     => 'NGN',
            'callback_url' => $callbackUrl,  // Where the customer lands after paying
            'metadata'     => $metadata,     // Lets the webhook find our order
        ]);

        if ($res->failed() || ! $res->json('status')) {
            Log::error('Paystack initialize failed', ['body' => $res->body()]); // Details go to the log only
            throw new PaymentException('We could not start the payment. Please try again.');
        }

        return $res->json('data.authorization_url');
    }

    public function verify(string $reference): PaymentVerification
    {
        $res = $this->http()->get('/transaction/verify/' . rawurlencode($reference));

        if ($res->failed()) {
            Log::error('Paystack verify failed', ['body' => $res->body()]);
            throw new PaymentException('We could not confirm the payment yet. Please try again.');
        }

        return new PaymentVerification(
            paid: $res->json('data.status') === 'success', // Only "success" counts
            amount: (int) $res->json('data.amount', 0),
            currency: (string) $res->json('data.currency', ''),
        );
    }
}
