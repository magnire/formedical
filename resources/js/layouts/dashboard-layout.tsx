import DashboardLayoutTemplate from '@/layouts/dashboard/dashboard-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    role: 'admin' | 'merchant' | 'user';
}

export default ({ children, breadcrumbs, role, ...props }: AppLayoutProps) => (
    <DashboardLayoutTemplate breadcrumbs={breadcrumbs} role={role} {...props}>
        {children}
    </DashboardLayoutTemplate>
);