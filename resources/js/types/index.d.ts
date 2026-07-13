import type { LucideIcon } from 'lucide-react';

export type AppVariant = 'sidebar' | 'header';

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    division_id?: number | null;
    avatar?: string;
    email_verified_at?: string | null;
}

export interface Auth {
    user: User;
    unreadNotificationsCount?: number;
}

export interface SharedData {
    auth: Auth;
    [key: string]: unknown;
}

export type AppLayoutProps = {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
};

export type AuthLayoutProps = {
    title?: string;
    description?: string;
    children: React.ReactNode;
};
