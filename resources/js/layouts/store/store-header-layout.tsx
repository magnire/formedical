import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StoreHeader } from '@/components/store-header';
import { StoreCartFloatingButton } from '@/components/store-cart-floating-button';
import { type BreadcrumbItem } from '@/types';
import { useState, type PropsWithChildren } from 'react';
import { ShoppingCart } from 'lucide-react';
import StoreCartSidebar from '@/components/store-cart-sidebar';

export default function StoreHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [isCartOpen, setIsCartOpen] = useState(false); // State to manage cart visibility

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen); // Toggle cart visibility
    };

    return (
        <AppShell>
            <StoreHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
            {/* Pass toggleCart to CartFloatingButton */}
            <button
                onClick={toggleCart}
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700"
            >
                <ShoppingCart className="w-6 h-6" />
            </button>
            <StoreCartSidebar isOpen={isCartOpen} onClose={toggleCart} />
        </AppShell>
    );
}