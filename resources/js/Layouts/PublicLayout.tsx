import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { login } from '@/routes';
import { MapPin, Mail, Globe } from 'lucide-react';

interface PublicLayoutProps {
    children: ReactNode;
    active?: 'beranda' | 'tentang' | 'dokumen' | 'agenda';
}

const navItems: { key: 'beranda' | 'tentang' | 'agenda' | 'dokumen'; label: string; href: string }[] = [
    { key: 'beranda', label: 'Beranda', href: '/' },
    { key: 'tentang', label: 'Tentang BPA', href: '/tentang-bpa' },
    { key: 'agenda', label: 'Event', href: '/agenda' },
    { key: 'dokumen', label: 'Dokumen Publik', href: '/dokumen' },
];

export default function PublicLayout({ children, active }: PublicLayoutProps) {
    return (
        <div className="min-h-screen bg-white text-[#1b1b18] font-sans antialiased overflow-x-hidden flex flex-col">
            {/* Top Header Navigation */}
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-colors border-b border-slate-100">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group shrink-0"
                    >
                        <img
                            src="images/logo praja 3.png"
                            alt="PRAJA Logo"
                            className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none uppercase">
                                PRAJA
                            </span>
                            
                        </div>
                    </Link>

                    <nav className="hidden sm:flex items-center gap-7">
                        {navItems.map((item) => {
                            const isActive = active === item.key;
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`relative py-1 text-xs sm:text-sm transition-colors ${
                                        isActive
                                            ? 'text-[#9b1c1c] font-bold'
                                            : 'text-slate-600 hover:text-slate-900 font-medium'
                                    }`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#9b1c1c]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            href={login()}
                            className="bg-[#9b1c1c] hover:bg-[#801515] text-white px-5 py-2 rounded-full font-semibold shadow-2xs hover:shadow-sm transition-all text-xs tracking-wide active:scale-95"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>

                {/* Mobile nav row */}
                <div className="sm:hidden flex items-center justify-center gap-5 pb-3 px-4 border-t border-slate-100 pt-2">
                    {navItems.map((item) => {
                        const isActive = active === item.key;
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`relative py-0.5 text-xs transition-colors ${
                                    isActive
                                        ? 'text-[#9b1c1c] font-bold'
                                        : 'text-slate-600 hover:text-slate-900 font-medium'
                                }`}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] rounded-full bg-[#9b1c1c]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 w-full">{children}</main>

            {/* Footer */}
            <footer className="mt-auto bg-[#8b1116] text-white pt-12 pb-8 px-4 sm:px-6 md:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/15">
                        {/* Column 1: Brand Info */}
                        <div className="md:col-span-5 space-y-3">
                            <span className="text-xl font-extrabold tracking-tight text-white uppercase block">
                                PRAJA
                            </span>
                            <p className="text-xs text-red-100/85 leading-relaxed max-w-sm">
                                Portal informasi akademik Bagian Pengembangan Akademik Telkom University.
                                Menyajikan event, dokumen publik, dan informasi inti untuk mendukung tata kelola
                                akademik yang lebih terbuka dan terpusat.
                            </p>
                        </div>

                        {/* Column 2: Navigasi */}
                        <div className="md:col-span-3 space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                                Navigasi
                            </h4>
                            <ul className="space-y-2 text-xs text-red-100/85">
                                {navItems.map((item) => (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href}
                                            className="hover:text-white transition"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Kontak Resmi */}
                        <div className="md:col-span-4 space-y-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white/90">
                                Kontak Resmi
                            </h4>
                            <div className="space-y-2.5 text-xs text-red-100/85">
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-3.5 h-3.5 text-white shrink-0" />
                                    <a
                                        href="mailto:kampusmerdeka@telkomuniversity.ac.id"
                                        className="hover:text-white transition"
                                    >
                                        kampusmerdeka@telkomuniversity.ac.id
                                    </a>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                                    <span>Gedung Tokong Nanas, Telkom University</span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <Globe className="w-3.5 h-3.5 text-white shrink-0" />
                                    <a
                                        href="https://www.telkomuniversity.ac.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-4 hover:text-white transition"
                                    >
                                        www.telkomuniversity.ac.id
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Copyright Bar */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-red-100/75">
                        <p>© 2026 Bagian Pengembangan Akademik, Telkom University. Portal informasi publik.</p>
                        <p>Versi publik • Informasi yang ditampilkan hanya untuk keperluan akses publik.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

