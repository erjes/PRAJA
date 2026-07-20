import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, AlertTriangle } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');

    return (
        <>
            <Head title="Pengaturan" />
            <div className="flex flex-1 flex-col p-4 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-both">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Pengaturan Akun</h1>
                    <p className="text-sm text-muted-foreground mt-1.5">Kelola preferensi, keamanan, dan data pribadi akun Anda.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <aside className="w-full md:w-64 shrink-0 space-y-1.5">
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-[#901418] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-slate-500'}`} />
                            Profil Pengguna
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'security' ? 'bg-[#901418] text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            <Shield className={`w-4 h-4 ${activeTab === 'security' ? 'text-white' : 'text-slate-500'}`} />
                            Keamanan
                        </button>
                        <div className="pt-4 mt-4 border-t border-slate-200">
                            <button 
                                onClick={() => setActiveTab('danger')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'danger' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' : 'bg-transparent text-red-600/80 hover:bg-red-50 hover:text-red-700'}`}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Zona Berbahaya
                            </button>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 bg-white border border-slate-200/60 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-6 border-b pb-4">
                                    <h2 className="text-xl font-bold text-slate-900">Informasi Profil</h2>
                                    <p className="text-sm text-slate-500 mt-1">Perbarui nama lengkap dan alamat email Anda.</p>
                                </div>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-6 border-b pb-4">
                                    <h2 className="text-xl font-bold text-slate-900">Ubah Kata Sandi</h2>
                                    <p className="text-sm text-slate-500 mt-1">Pastikan akun Anda menggunakan kata sandi yang panjang dan acak untuk tetap aman.</p>
                                </div>
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-6 border-b border-red-100 pb-4">
                                    <h2 className="text-xl font-bold text-red-600">Hapus Akun</h2>
                                    <p className="text-sm text-slate-500 mt-1">Setelah akun Anda dihapus, semua sumber daya dan data di dalamnya akan dihapus secara permanen.</p>
                                </div>
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Pengaturan', href: '/profile' }]}
    >
        {page}
    </AppSidebarLayout>
);
