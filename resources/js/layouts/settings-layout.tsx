import SettingsLayoutTemplate from '@/layouts/settings/settings-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <SettingsLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </SettingsLayoutTemplate>
);
