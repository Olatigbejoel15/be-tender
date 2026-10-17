<?php

return [
    'free_delivery_over' => 50000, // Naira. At or above this, delivery is free
    'delivery_fee_lagos' => 3000,  // PLACEHOLDER: set your real Lagos fee
    'delivery_fee_other' => 5000,  // PLACEHOLDER: set your real fee for other states
    'max_qty'            => 10,    // Most of one item per order line
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'), // Where Paystack returns the customer
    'catalogue_cache_ttl' => (int) env('CATALOGUE_CACHE_TTL', 600), // Seconds to keep catalogue data (0 turns caching off)
    'low_stock_threshold' => 5, // At or below this, an option shows in the low-stock list
    'pending_order_minutes' => (int) env('PENDING_ORDER_MINUTES', 60), // Unpaid orders older than this are cancelled
    'staff_alert_email' => env('STAFF_ALERT_EMAIL'), // Gets a note for each new paid order (null = no alert)
    'timezone' => 'Africa/Lagos',                                          // Days on the charts follow this zone
    'analytics_cache_ttl' => (int) env('ANALYTICS_CACHE_TTL', 60),         // Seconds (0 = no cache, handy while testing)
];

