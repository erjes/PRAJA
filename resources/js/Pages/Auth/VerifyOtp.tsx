import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function VerifyOtp({ email }: { email: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp_code: '',
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digits = data.otp_code.split('');
        digits[index] = value.slice(-1);
        setData('otp_code', digits.join('').slice(0, 6));
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !data.otp_code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('otp.verify'));
    };

    const digits = data.otp_code.padEnd(6, ' ').split('');

    return (
        <GuestLayout>
            <Head title="Verifikasi OTP" />

            <form onSubmit={submit} className="py-3">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[1.55rem]">
                        Verifikasi Kode OTP
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Kode dikirim ke{' '}
                        <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                    </p>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                    <strong>Mode Development:</strong> Cek{' '}
                    untuk kode OTP Anda.
                </div>

                <input type="hidden" name="email" value={data.email} />

                <div className="mt-6">
                    <InputLabel htmlFor="otp_0" value="Kode OTP (6 digit)" />
                    <div className="mt-2 flex justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                id={`otp_${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digits[i]?.trim() ?? ''}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={`h-12 w-11 rounded-xl border text-center text-lg font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-red-500/50 dark:text-white ${
                                    errors.otp_code
                                        ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                                        : digits[i]?.trim()
                                            ? 'border-red-400 bg-red-50/50 dark:border-red-500/50 dark:bg-red-900/10'
                                            : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'
                                }`}
                            />
                        ))}
                    </div>
                    <InputError message={errors.otp_code} className="mt-2 text-center" />
                </div>

                <div className="mt-6">
                    <PrimaryButton
                        className="w-full justify-center"
                        disabled={processing || data.otp_code.length < 6}
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Verifikasi & Masuk
                    </PrimaryButton>
                </div>

                <p className="mt-4 text-center text-sm text-slate-500">
                    <a
                        href={route('login')}
                        className="text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 dark:text-slate-400 dark:decoration-slate-500 dark:hover:text-white"
                    >
                        ← Kembali ke halaman login
                    </a>
                </p>
            </form>
        </GuestLayout>
    );
}
