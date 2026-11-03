<?php

namespace App\Services;

use App\DTOs\NewsletterSignupData;
use App\Repositories\Contracts\NewsletterSubscriberRepositoryInterface;

class NewsletterService
{
    public function __construct(private NewsletterSubscriberRepositoryInterface $subscribers) {}

    // Repeat signups change nothing and look identical to the caller
    public function subscribe(NewsletterSignupData $data): void
    {
        if ($data->honeypot) {
            return; // a bot
        }

        $this->subscribers->subscribe($data->email);
    }
}