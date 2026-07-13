import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <>
            <Head title="Profile Settings" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pengaturan Profil</h1>
                    <p className="text-sm text-muted-foreground">Perbarui informasi profil dan keamanan akun Anda.</p>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-card border text-card-foreground p-6 rounded-xl shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl text-foreground"
                        />
                    </div>

                    <div className="bg-card border text-card-foreground p-6 rounded-xl shadow-sm">
                        <UpdatePasswordForm className="max-w-xl text-foreground" />
                    </div>

                    <div className="bg-card border text-card-foreground p-6 rounded-xl shadow-sm">
                        <DeleteUserForm className="max-w-xl text-foreground" />
                    </div>
                </div>
            </div>
        </>
    );
}

Edit.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[{ title: 'Profile Settings', href: '/profile' }]}
    >
        {page}
    </AppSidebarLayout>
);
