import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { MapPin, Mail } from 'lucide-react';

interface PublicLayoutProps {
    children: ReactNode;
    active?: 'beranda' | 'dokumen' | 'agenda';
}

const navItems: { key: 'beranda' | 'dokumen' | 'agenda'; label: string; href: string }[] = [
    { key: 'beranda', label: 'Beranda', href: '/' },
    { key: 'agenda', label: 'Event', href: '/agenda' },
    { key: 'dokumen', label: 'Dokumen', href: '/dokumen' },
];

export default function PublicLayout({ children, active }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F9F9F9] text-[#1b1b18] font-sans antialiased overflow-x-hidden flex flex-col">
            {/* Top Header Navigation */}
            <header className="sticky top-0 z-50 w-full bg-[#F9F9F9]/95 backdrop-blur-md transition-colors border-b border-gray-200/60 shadow-xs">
                <div className="w-full px-4 sm:px-6 md:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
                    >
                        <img
                            src="/logo.png"
                            alt="PRAJA Logo"
                            className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <span className="text-xl sm:text-2xl md:text-[26px] font-black tracking-widest text-slate-900 uppercase">
                            PRAJA
                        </span>
                    </Link>

                    <nav className="hidden sm:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                    active === item.key
                                        ? 'bg-[#901418] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-[#901418] hover:bg-red-50'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={login()}
                            className="bg-[#901418] hover:bg-[#7a1014] text-white px-5 py-2 rounded-full font-semibold shadow-sm hover:shadow-md transition-all text-xs sm:text-sm tracking-wide active:scale-95"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>

                {/* Mobile nav row */}
                <div className="sm:hidden flex items-center justify-center gap-1 pb-3 px-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                active === item.key
                                    ? 'bg-[#901418] text-white shadow-sm'
                                    : 'text-slate-600 hover:text-[#901418] hover:bg-red-50'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </header>

            <main className="flex-1 w-full">{children}</main>

            {/* Footer */}
            <footer className="mt-auto bg-[#901418] text-white pt-12 pb-10 px-4 sm:px-8 lg:px-12 shadow-inner">
                <div className="w-full flex flex-col items-start gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-1.5 flex items-center justify-center shadow">
                            <img
                                src="/logo.png"
                                alt="PRAJA Logo"
                                className="h-8 w-auto object-contain"
                            />
                        </div>
                        <span className="text-3xl font-black tracking-widest text-white uppercase">
                            PRAJA
                        </span>
                    </div>

                    <div className="space-y-3.5 text-xs sm:text-sm text-red-100/90">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-white shrink-0" />
                            <span className="font-medium">
                                Gedung Tokong Nanas Telkom University
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-white shrink-0" />
                            <a
                                href="mailto:kampusmerdeka@telkomuniversity.ac.id"
                                className="font-medium underline underline-offset-4 hover:text-white transition"
                            >
                                kampusmerdeka@telkomuniversity.ac.id
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
