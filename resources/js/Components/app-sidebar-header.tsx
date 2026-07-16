import { Link } from '@inertiajs/react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/Components/ui/breadcrumb';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { SidebarTrigger } from '@/Components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types/navigation';

interface NotificationData {
    id: string;
    data: {
        title: string;
        message: string;
    };
    read_at: string | null;
    created_at: string;
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as any;
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const lastIndex = breadcrumbs.length - 1;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!auth?.user) return;
            try {
                const response = await fetch('/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                }
            } catch {}
        };
        fetchNotifications();
        const id = setInterval(fetchNotifications, 15000);
        return () => clearInterval(id);
    }, [auth?.user]);

    const handleRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch {}
    };

    const handleReadAll = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            setNotifications([]);
        } catch {}
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 w-full">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {breadcrumbs.length > 0 && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((item, index) => (
                                <BreadcrumbItem key={`${item.title}-${index}`}>
                                    {index === lastIndex ? (
                                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                    ) : (
                                        <>
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href}>{item.title}</Link>
                                            </BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                        </>
                                    )}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            </div>

            <div className="flex items-center gap-4">
                {auth?.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="h-5 w-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
                            <div className="flex items-center justify-between px-2 py-1.5">
                                <DropdownMenuLabel className="p-0">Notifikasi</DropdownMenuLabel>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleReadAll}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        Tandai Semua Dibaca
                                    </button>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Belum ada notifikasi baru
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className="p-3 flex flex-col items-start gap-1 cursor-pointer"
                                    >
                                        <div className="flex justify-between w-full items-start gap-2">
                                            <span className="font-semibold text-sm">{notification.data.title}</span>
                                            <button
                                                onClick={(e) => handleRead(notification.id, e)}
                                                className="text-muted-foreground hover:text-green-600"
                                                title="Tandai sudah dibaca"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <span className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.data.message}
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
