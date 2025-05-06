<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $mode): Response
    {
        $user = auth()->user();
        $activeMode = $user->active_mode ?? $user->role;

        // Check if user has access to this mode
        if ($mode === 'admin' && $user->role !== 'admin') {
            abort(403, 'Unauthorized access to admin mode');
        }

        if ($mode === 'merchant' && !in_array($user->role, ['admin', 'merchant'])) {
            abort(403, 'Unauthorized access to merchant mode');
        }

        // Check if active mode matches requested mode
        if ($activeMode !== $mode) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}