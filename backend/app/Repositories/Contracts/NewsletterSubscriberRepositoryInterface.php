<?php

namespace App\Repositories\Contracts;

interface NewsletterSubscriberRepositoryInterface
{
    public function subscribe(string $email): void; // Add once; re-activate if they had left
}