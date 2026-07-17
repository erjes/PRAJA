import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CheckSquare,
    FolderKanban,
    LayoutGrid,
    Users,
    History,
    Bell,
    Building2,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/Components/ui/sidebar';
import { NavUser } from '@/Components/nav-user';
import type { NavItem } from '@/types/navigation';
import { useCurrentUrl } from '@/hooks/use-current-url';

const ALL_NAV_ITEMS: (NavItem & { roles: string[] })[] = [
    { title: 'Dashboard',  href: '/dashboard',  icon: LayoutGrid,    roles: ['staff'] },
    { title: 'Events',     href: '/events',     icon: CalendarDays,  roles: ['staff'] },
    { title: 'Projects',   href: '/projects',   icon: FolderKanban,  roles: ['staff', 'admin'] },
    { title: 'My Tasks',   href: '/tasks',      icon: CheckSquare,   roles: ['staff'] },
    { title: 'Documents',  href: '/documents',  icon: BookOpen,      roles: ['staff'] },
    { title: 'Users',      href: '/users',      icon: Users,         roles: ['admin'] },
    { title: 'Divisi',     href: '/divisions',  icon: Building2,     roles: ['admin'] },
    { title: 'Activity Log', href: '/activity-logs', icon: History,    roles: ['admin'] },
    { title: 'Notifikasi',   href: '/notifications/history', icon: Bell, roles: ['staff', 'admin'] },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role: string = auth?.user?.role ?? 'staff';
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const navItems: NavItem[] = ALL_NAV_ITEMS
        .filter((item) => item.roles.includes(role))
        .map(({ roles: _roles, ...item }) => item);

    const logoHref = role === 'admin' ? '/users' : '/dashboard';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-gray-100 transition-colors py-2">
                            <Link href={logoHref} prefetch>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-white p-1 border border-gray-200/80 shadow-xs flex-shrink-0">
                                    <img src="/logo.png" alt="PRAJA Logo" className="size-full object-contain" />
                                </div>
                                <span className="grid flex-1 text-left text-sm leading-tight ml-2">
                                    <span className="truncate font-bold text-gray-900">PRAJA</span>
                                    <span className="truncate text-xs text-muted-foreground font-medium">
                                        BPA Integrated Portal
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
