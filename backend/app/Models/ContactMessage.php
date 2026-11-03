<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'topic', 'message', 'handled_at']; // Columns we may fill in bulk

    protected function casts(): array
    {
        return ['handled_at' => 'datetime'];
    }
}