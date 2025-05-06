import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardSidebarHeader } from '@/components/dashboard-sidebar-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface DashboardSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
    role: 'admin' | 'merchant' | 'user'; // Add role prop
}

export default function DashboardSidebarLayout({
    children,
    breadcrumbs = [],
    role,
}: DashboardSidebarLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <DashboardSidebar role={role} />
            <AppContent variant="sidebar">
                <DashboardSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}