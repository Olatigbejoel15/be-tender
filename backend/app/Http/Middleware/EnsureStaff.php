<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isStaff() || ! $user->is_active) {
            abort(403, 'Staff access only.'); // 403 = logged in, but not allowed
        }

        return $next($request);
    }
}
