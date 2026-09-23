import { Head, Link } from '@inertiajs/react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface NotificationData {
    id: string;
    data: {
        title: string;
        message: string;
        url?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface HistoryProps {
    notifications: {
        data: NotificationData[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

export default function History({ notifications }: HistoryProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Notifikasi', href: route('notifications.history') }]}>
            <Head title="Riwayat Notifikasi" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        Notifikasi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Semua notifikasi baru Anda otomatis ditandai sudah dibaca.
                    </p>
                </div>

                <Card className="shadow-sm border-border">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg">Riwayat Anda</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                                <Bell className="h-12 w-12 mb-4 text-muted-foreground/30" />
                                <p>Belum ada notifikasi.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.data.map((notification) => (
                                    <div key={notification.id} className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h4 className="font-semibold text-base">{notification.data.title}</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notification.data.message}</p>
                                                <span className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(notification.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        {notification.data.url && (
                                            <Button asChild variant="outline" size="sm" className="shrink-0">
                                                <Link href={notification.data.url}>Lihat Detail</Link>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {notifications.links.map((link, i) => {
                            if (!link.url && link.label === '...') {
                                return <span key={i} className="px-3 py-2">...</span>;
                            }
                            return (
                                <Button
                                    key={i}
                                    asChild
                                    variant={link.active ? 'default' : 'outline'}
                                    disabled={!link.url}
                                    className="min-w-10"
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
