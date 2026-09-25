<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class Recaptcha implements ValidationRule
{
    /**
     * Verify the "g-recaptcha-response" token submitted by the widget
     * against Google's siteverify endpoint.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secret = config('services.recaptcha.secret_key');

        if (empty($secret)) {
            // RECAPTCHA_SECRET_KEY belum diisi di .env (misalnya saat awal setup
            // development). Jangan sampai memblokir login sama sekali, tapi catat
            // peringatan supaya ketahuan sebelum aplikasi dipakai di production.
            Log::warning('RECAPTCHA_SECRET_KEY belum dikonfigurasi, verifikasi CAPTCHA dilewati.');

            return;
        }

        if (empty($value)) {
            $fail('Silakan selesaikan verifikasi CAPTCHA terlebih dahulu.');

            return;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

            $result = $response->json();

            if (! ($result['success'] ?? false)) {
                $fail('Verifikasi CAPTCHA gagal, silakan coba lagi.');
            }
        } catch (Throwable $e) {
            Log::error('Gagal menghubungi layanan reCAPTCHA: ' . $e->getMessage());

            $fail('Tidak dapat memverifikasi CAPTCHA saat ini, silakan coba lagi.');
        }
    }
}
