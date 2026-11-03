<?php

namespace App\Repositories\Eloquent;

use App\Models\NewsletterSubscriber;
use App\Repositories\Contracts\NewsletterSubscriberRepositoryInterface;

class NewsletterSubscriberRepository implements NewsletterSubscriberRepositoryInterface
{
    public function subscribe(string $email): void
    {
        $subscriber = NewsletterSubscriber::createOrFirst(['email' => $email]); // safe if two requests race

        if ($subscriber->unsubscribed_at) {
            $subscriber->update(['unsubscribed_at' => null]); // they chose to come back
        }
    }
}