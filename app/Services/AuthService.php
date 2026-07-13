<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthService
{
    public function generateAndSendOtp(User $user)
    {
        $otp = (string) random_int(100000, 999999);
        
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
            'is_otp_verified' => false,
        ]);

        // Simulate sending email/sms by logging it
        Log::info("OTP for {$user->email} is: {$otp}");
    }

    public function verifyOtp(string $email, string $otp): ?User
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            return null;
        }

        if ($user->otp_code !== $otp) {
            return null;
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return null;
        }

        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'is_otp_verified' => true,
        ]);

        return $user;
    }
}
