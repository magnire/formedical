import CheckoutLayoutTemplate from '@/layouts/checkout/checkout-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <CheckoutLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
    </CheckoutLayoutTemplate>
);
