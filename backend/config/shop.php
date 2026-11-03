<?php

return [
    'free_delivery_over' => 120000, // Naira. At or above this, delivery is free

    // Delivery fee by zone, in naira. Every state must appear in exactly one zone. Edit the fees freely.
    'delivery_zones' => [
        ['name' => 'Lagos',  'fee' => 5000, 'states' => ['Lagos']],
        ['name' => 'Nearby', 'fee' => 9000, 'states' => ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti']],
        ['name' => 'South and middle belt', 'fee' => 13000, 'states' => [
            'Abia', 'Akwa Ibom', 'Anambra', 'Bayelsa', 'Benue', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
            'Enugu', 'FCT', 'Imo', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'Rivers',
        ]],
        ['name' => 'North', 'fee' => 17000, 'states' => [
            'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
            'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
        ]],
    ],
    'max_qty'            => 10,    // Most of one item per order line
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'), // Where Paystack returns the customer
    'catalogue_cache_ttl' => (int) env('CATALOGUE_CACHE_TTL', 600), // Seconds to keep catalogue data (0 turns caching off)
    'low_stock_threshold' => 5, // At or below this, an option shows in the low-stock list
    'pending_order_minutes' => (int) env('PENDING_ORDER_MINUTES', 60), // Unpaid orders older than this are cancelled
    'staff_alert_email' => env('STAFF_ALERT_EMAIL'), // Gets a note for each new paid order (null = no alert)
    'timezone' => 'Africa/Lagos',                                          // Days on the charts follow this zone
    'analytics_cache_ttl' => (int) env('ANALYTICS_CACHE_TTL', 60),         // Seconds (0 = no cache, handy while testing)
    'max_pending_per_email' => 3, // Unpaid orders one email may hold at once (stops stock hoarding)
];

