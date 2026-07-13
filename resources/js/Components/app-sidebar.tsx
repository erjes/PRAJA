import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CheckSquare,
    FolderKanban,
    LayoutGrid,
    Users,
    History,
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
    { title: 'Projects',   href: '/projects',   icon: FolderKanban,  roles: ['staff'] },
    { title: 'My Tasks',   href: '/tasks',      icon: CheckSquare,   roles: ['staff'] },
    { title: 'Documents',  href: '/documents',  icon: BookOpen,      roles: ['staff'] },
    { title: 'Users',      href: '/users',      icon: Users,         roles: ['admin'] },
    { title: 'Activity Log', href: '/activity-logs', icon: History,    roles: ['admin'] },
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
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHref} prefetch>
                                <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                                    PJ
                                </span>
                                <span className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">PRAJA</span>
                                    <span className="truncate text-xs text-muted-foreground">
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
