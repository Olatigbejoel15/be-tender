<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer   = 'customer';    // Normal shopper
    case Admin      = 'admin';       // Manages products and orders
    case SuperAdmin = 'super_admin'; // Admin powers plus managing staff

    // Is this person part of the team?
    public function isStaff(): bool
    {
        return $this !== self::Customer;
    }

    // Friendly text for screens
    public function label(): string
    {
        return match ($this) {
            self::Customer   => 'Customer',
            self::Admin      => 'Admin',
            self::SuperAdmin => 'Super admin',
        };
    }
}
