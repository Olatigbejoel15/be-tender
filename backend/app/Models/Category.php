<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Lets tests build fake categories

class Category extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'slug', 'description']; // columns allowed in mass-assignment

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);            // $category->products
    }
}
