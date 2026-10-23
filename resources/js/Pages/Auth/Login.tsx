import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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

interface LoginProps {
    status?: string;
    recaptchaSiteKey?: string | null;
}

export default function Login({ status, recaptchaSiteKey }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        'g-recaptcha-response': '',
    });

    const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [recaptchaReady, setRecaptchaReady] = useState(false);

    // Muat script reCAPTCHA sekali, lalu render widget-nya ke dalam container
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

        if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
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
        <div
            className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden bg-white selection:bg-[#890A00] selection:text-white"
            style={{
                backgroundColor: '#ffffff',
                backgroundImage: "url('/images/bg_praja_login.png')",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
                backgroundSize: 'cover',
            }}
        >
            <Head title="Masuk ke BPA Portal" />

            {/* Tombol kembali ke Beranda */}
            <Link
                href="/"
                className="absolute top-5 left-5 sm:top-7 sm:left-7 z-30 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
                <ArrowLeft className="h-4 w-4 text-white" />
                <span>Beranda</span>
            </Link>

            {/* Mobile Header (< lg) */}
            <div className="lg:hidden w-full bg-[#890A00] px-6 pt-16 pb-12 text-center text-white relative">
                <div className="flex flex-col items-center">
                    <img
                        src="/images/logo praja fix.png"
                        alt="Logo PRAJA"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md mb-4"
                    />
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Selamat Datang
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-white/90 max-w-xs mx-auto leading-relaxed">
                        Jelajahi informasi kegiatan dan dokumen publik melalui portal PRAJA
                    </p>
                </div>
            </div>

            {/* Left Panel - Desktop (lg:flex) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-8 lg:p-12 z-10 text-white select-none">
                <div className="flex flex-col items-center text-center max-w-[350px] lg:mr-auto lg:ml-20 xl:ml-28">
                    <h1 className="text-3xl xl:text-[34px] font-bold tracking-tight text-white mb-8">
                        Selamat Datang
                    </h1>
                    <div className="mb-9">
                        <img
                            src="/images/logo praja fix.png"
                            alt="Logo PRAJA"
                            className="w-48 h-48 object-contain drop-shadow-md"
                        />
                    </div>
                    <p className="text-base font-normal text-white/95 leading-relaxed">
                        Jelajahi informasi kegiatan dan dokumen publik melalui portal PRAJA
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form Container */}
            <div className="flex-1 w-full bg-white px-6 py-8 sm:px-10 rounded-t-[32px] -mt-6 lg:mt-0 lg:rounded-none lg:bg-transparent relative z-10 flex items-center justify-center p-6 sm:p-10 lg:p-14">
                <div className="w-full max-w-[520px] xl:max-w-[580px] py-4">
                    {status && (
                        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                            {status}
                        </div>
                    )}

                    <div className="text-center mb-8 sm:mb-10">
                        <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-slate-900">
                            Masuk ke BPA Portal
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-500 font-normal">
                            Masukkan email SSO pegawai
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Input Alamat Email SSO */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm sm:text-base font-semibold text-slate-900 mb-2"
                            >
                                Alamat Email SSO
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                placeholder="email sso"
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-2xl border border-rose-100/90 bg-[#FFF6F6] px-5 py-3.5 sm:py-4 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-xs transition-all duration-200 focus:bg-white focus:border-[#890A00] focus:outline-none focus:ring-2 focus:ring-[#890A00]/20"
                            />
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        {/* Input Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm sm:text-base font-semibold text-slate-900 mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                placeholder="password"
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-2xl border border-rose-100/90 bg-[#FFF6F6] px-5 py-3.5 sm:py-4 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base shadow-xs transition-all duration-200 focus:bg-white focus:border-[#890A00] focus:outline-none focus:ring-2 focus:ring-[#890A00]/20"
                            />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        {/* reCAPTCHA Widget */}
                        <div className="pt-2">
                            {recaptchaSiteKey ? (
                                <div className="flex flex-col items-center justify-center">
                                    <div
                                        ref={recaptchaContainerRef}
                                        className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-black/5"
                                    />
                                    {!recaptchaReady && (
                                        <p className="mt-1.5 text-center text-xs text-slate-500">
                                            Memuat CAPTCHA...
                                        </p>
                                    )}
                                    <InputError
                                        message={errors['g-recaptcha-response']}
                                        className="mt-1.5 text-center"
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="flex w-full max-w-[304px] items-center justify-between rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-xs">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="h-6 w-6 rounded border-slate-300 text-[#890A00] focus:ring-[#890A00]"
                                                onChange={(e) =>
                                                    setData(
                                                        'g-recaptcha-response',
                                                        e.target.checked ? 'mock-dev-token' : '',
                                                    )
                                                }
                                            />
                                            <span className="text-sm font-medium text-slate-800">
                                                Saya bukan robot
                                            </span>
                                        </label>
                                        <div className="flex flex-col items-center">
                                            <img
                                                src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                                                alt="reCAPTCHA"
                                                className="h-7 w-7 object-contain"
                                            />
                                            <span className="text-[10px] text-slate-400">reCAPTCHA</span>
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-center text-[11px] text-amber-900 font-medium bg-amber-50/80 px-2.5 py-1 rounded-md border border-amber-200/60">
                                        Set <code>RECAPTCHA_SITE_KEY</code> di <code>.env</code> server
                                        untuk widget live.
                                    </p>
                                    <InputError
                                        message={errors['g-recaptcha-response']}
                                        className="mt-1 text-center"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tombol Masuk */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full inline-flex items-center justify-center rounded-2xl bg-[#890A00] hover:bg-[#720700] active:bg-[#590500] py-4 px-6 text-base sm:text-lg font-bold text-white shadow-md shadow-[#890A00]/25 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#890A00]/40 focus:ring-offset-2"
                            >
                                {processing && (
                                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin text-white" />
                                )}
                                Masuk
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
