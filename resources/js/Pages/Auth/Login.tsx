import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

declare global {
    interface Window {
        grecaptcha?: {
            render: (container: string | HTMLElement, params: Record<string, unknown>) => number;
            reset: (widgetId?: number) => void;
            getResponse: (widgetId?: number) => string;
        };
        onRecaptchaLoad?: () => void;
    }
}

export default function Login({
    status,
    recaptchaSiteKey,
}: {
    status?: string;
    recaptchaSiteKey?: string | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        'g-recaptcha-response': '',
    });

    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [recaptchaReady, setRecaptchaReady] = useState(false);

    // Muat script reCAPTCHA sekali, lalu render widget-nya ke dalam container.
    useEffect(() => {
        if (!recaptchaSiteKey) return;

        const renderWidget = () => {
            if (!recaptchaContainerRef.current || !window.grecaptcha || widgetIdRef.current !== null) {
                return;
            }

            widgetIdRef.current = window.grecaptcha.render(recaptchaContainerRef.current, {
                sitekey: recaptchaSiteKey,
                callback: (token: string) => setData('g-recaptcha-response', token),
                'expired-callback': () => setData('g-recaptcha-response', ''),
            });

            setRecaptchaReady(true);
        };

        if (window.grecaptcha && window.grecaptcha.render) {
            renderWidget();

            return;
        }

        window.onRecaptchaLoad = renderWidget;

        if (!document.getElementById('recaptcha-script')) {
            const script = document.createElement('script');
            script.id = 'recaptcha-script';
            script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recaptchaSiteKey]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onError: () => {
                // Token reCAPTCHA cuma sekali pakai, reset widget-nya supaya
                // user bisa coba lagi kalau login gagal (password salah, dll).
                if (window.grecaptcha && widgetIdRef.current !== null) {
                    window.grecaptcha.reset(widgetIdRef.current);
                }
                setData('g-recaptcha-response', '');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="py-3">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[1.55rem]">
                        Masuk ke BPA Portal
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Masukkan email dan password Anda untuk masuk.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Alamat Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1"
                            autoComplete="username"
                            isFocused={true}
                            placeholder="nama@bpa.go.id"
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {recaptchaSiteKey ? (
                        <div>
                            <div ref={recaptchaContainerRef} className="flex justify-center" />
                            {!recaptchaReady && (
                                <p className="mt-1 text-center text-xs text-slate-400">Memuat CAPTCHA...</p>
                            )}
                            <InputError message={errors['g-recaptcha-response']} className="mt-2 text-center" />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                            CAPTCHA belum dikonfigurasi. Set <code>RECAPTCHA_SITE_KEY</code> di{' '}
                            <code>.env</code> server.
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Masuk
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
