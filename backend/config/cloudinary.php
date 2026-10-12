<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'), // Account name from .env
    'api_key'    => env('CLOUDINARY_API_KEY'),    // Public key from .env
    'api_secret' => env('CLOUDINARY_API_SECRET'), // Secret, never committed
    'folder'     => 'be-tender/products',      // Cloudinary folder for all product photos
];
