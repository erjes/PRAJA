<?php

namespace App\Services;

<<<<<<< HEAD
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class AuthService
{
    /**
     * Minutes an OTP stays valid for, kept in sync with the value shown in the email.
     */
    private const OTP_TTL_MINUTES = 10;

    public function generateAndSendOtp(User $user): void
    {
        $otp = (string) random_int(100000, 999999);

        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
            'is_otp_verified' => false,
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otp, $user, self::OTP_TTL_MINUTES));
        } catch (Throwable $e) {
            // Jangan sampai kegagalan pengiriman email menghentikan proses login,
            // tapi catat errornya supaya bisa diketahui (mailer down, kredensial salah, dll).
            Log::error('Gagal mengirim OTP via email', [
                'email' => $user->email,
                'mailer' => config('mail.default'),
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback untuk kebutuhan development: tetap tulis ke log hanya saat APP_DEBUG aktif,
        // supaya OTP tidak pernah tercatat di log produksi.
        if (config('app.debug')) {
            Log::info("[DEBUG] OTP for {$user->email} is: {$otp}");
        }
=======
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
>>>>>>> 177c673a019c5270c9716a2c71ba96692b744c65
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
