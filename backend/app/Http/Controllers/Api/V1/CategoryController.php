<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $categories) {}

    // GET /api/v1/categories
    public function index()
    {
        return CategoryResource::collection($this->categories->all());
    }
}
