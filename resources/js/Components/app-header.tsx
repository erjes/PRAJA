import { Link, usePage } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types/navigation';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';

type Props = {
    breadcrumbs?: BreadcrumbItemType[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props as any;
    const getInitials = useInitials();
    const lastIndex = breadcrumbs.length - 1;

    return (
        <div className="border-b border-sidebar-border/80">
            <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                <Link
                    href={dashboard().url}
                    className="text-sm font-semibold tracking-wide"
                >
                    BPA Ticketing
                </Link>

                <div className="ml-6 hidden md:flex">
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
                                                    <Link href={item.href}>
                                                        {item.title}
                                                    </Link>
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

                <div className="ml-auto flex items-center gap-2">
                    <span className="hidden text-sm text-muted-foreground md:block">
                        {auth?.user?.name ?? 'User'}
                    </span>
                    <Avatar className="size-8">
                        <AvatarFallback>
                            {getInitials(auth?.user?.name ?? '')}
                        </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" asChild>
                        <Link href={route('logout')} method="post" as="button">
                            Log Out
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
