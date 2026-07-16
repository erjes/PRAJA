<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized action.');
        }

        $activeRole = session('simulated_role', $user->role);

        if ($activeRole === 'admin') {
            return $next($request);
        }

        if (! in_array($activeRole, $roles)) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
