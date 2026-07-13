import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/Components/ui/card';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';

export default function Dashboard({ categories }: { categories: string[] }) {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Halo, {auth.user.name} 👋</h1>
                        <p className="text-muted-foreground">Silakan pilih kategori untuk mengirim pertanyaan ke BPA.</p>
                    </div>
                    <Link href="">
                        <Button>Buat Ticket</Button>
                    </Link>
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, i) => (
                        <Card key={i} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-primary text-lg">{cat}</CardTitle>
                                <CardDescription>Pilih kategori ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="">
                                    <Button variant="outline" className="w-full">Buat Ticket</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div> */}
            </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => (
    <AppSidebarLayout
        breadcrumbs={[
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
        ]}
    >
        {page}
    </AppSidebarLayout>
);
