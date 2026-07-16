import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(250,250,250,1)_0%,rgba(243,244,246,1)_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(9,9,11,1)_0%,rgba(3,7,18,1)_100%)] dark:text-slate-100">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/20" />
                <div className="absolute right-[-5rem] top-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-500/10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.18)_1px,transparent_0)] bg-[size:22px_22px] opacity-40 dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] dark:opacity-30" />
            </div>

            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-center">
                    <Link
                        href="/"
                        className="rounded-full border border-slate-200 bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                    >
                        <ApplicationLogo className="h-12 w-12 object-contain" />
                    </Link>
                </div>

                <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white/90 px-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-8 ">
                    {children}
                </div>
            </div>
        </div>
    );
}
