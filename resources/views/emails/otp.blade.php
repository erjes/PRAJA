<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f5f7; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background-color:#1d4ed8; padding:20px 32px;">
                            <span style="color:#ffffff; font-size:18px; font-weight:bold;">{{ config('app.name') }}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:15px; color:#1f2937; margin:0 0 12px;">Halo {{ $userName ?? 'Pengguna' }},</p>
                            <p style="font-size:15px; color:#1f2937; margin:0 0 24px;">
                                Gunakan kode One-Time Password (OTP) berikut untuk menyelesaikan proses login Anda:
                            </p>
                            <div style="text-align:center; margin:0 0 24px;">
                                <span style="display:inline-block; font-size:32px; font-weight:bold; letter-spacing:8px; color:#1d4ed8; background-color:#eff6ff; padding:16px 24px; border-radius:8px;">
                                    {{ $otp }}
                                </span>
                            </div>
                            <p style="font-size:14px; color:#4b5563; margin:0 0 8px;">
                                Kode ini berlaku selama <strong>{{ $expiresInMinutes }} menit</strong> sejak email ini dikirim.
                            </p>
                            <p style="font-size:14px; color:#4b5563; margin:0 0 24px;">
                                Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan {{ config('app.name') }}.
                                Jika Anda tidak merasa melakukan permintaan login ini, abaikan email ini atau segera ganti kata sandi Anda.
                            </p>
                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:0 0 16px;">
                            <p style="font-size:12px; color:#9ca3af; margin:0;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
<script async defer data-website-id="ecc5b29e-2754-4898-9b24-f95f32c4c1fa" data-host-url="/umami-analytics" src="/umami-analytics/script.js"></script>
</body>
</html>
