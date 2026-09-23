<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Services\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function create(Request $request): Response
    {
        if (!$request->has('email')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $request->query('email'),
        ]);
    }

    public function verify(VerifyOtpRequest $request, AuthService $authService): RedirectResponse
    {
        $user = $authService->verifyOtp($request->email, $request->otp_code);

        if (! $user) {
            throw ValidationException::withMessages([
                'otp_code' => 'The provided OTP is incorrect or expired.',
            ]);
        }

        Auth::login($user);

        $request->session()->regenerate();

        if ($user->role === 'admin') {
            return redirect()->intended(route('users.index', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
