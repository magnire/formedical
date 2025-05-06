import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StoreHeader } from '@/components/store-header';
import { StoreCartFloatingButton } from '@/components/store-cart-floating-button';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function CartHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell>
            <StoreHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}