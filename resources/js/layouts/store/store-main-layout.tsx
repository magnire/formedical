import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { StoreSidebar } from '@/components/store-sidebar';
import { StoreHeader } from '@/components/store-header';
import CartSidebar, { CartItem } from '@/components/store-cart-sidebar';
import { Item, type BreadcrumbItem } from '@/types';
import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface StoreMainLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    items: Item[];
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    onSearch: (query: string, categories: string[], results: Item[]) => void;
}

export default function StoreMainLayout({ 
    children, 
    breadcrumbs = [], 
    items,
    selectedCategories,
    onCategoryChange,
    onSearch
}: StoreMainLayoutProps) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        fetch('/api/cart')
            .then(res => res.json())
            .then(data => {
                setCartItems(data);
            })
            .catch(error => console.error('Error fetching cart:', error));
    }, []);

    useEffect(() => {
        const handleCartChange = () => {
            fetch('/api/cart')
                .then(res => res.json())
                .then(data => {
                    setCartItems(data);
                })
                .catch(error => console.error('Error fetching cart:', error));
        };
    
        window.addEventListener('cart-updated', handleCartChange);
        return () => window.removeEventListener('cart-updated', handleCartChange);
    }, []);

    const handleCartUpdate = (updatedCart: CartItem[]) => {
        setCartItems(updatedCart);
    };

   return (
        <AppShell variant="sidebar">
            <StoreSidebar 
                selectedCategories={selectedCategories}
                onCategoryChange={onCategoryChange}
                onSearch={onSearch}
                items={items}
            />
            <AppContent variant="sidebar">
                <StoreHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            {/* Only show cart button if there are items */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-4 right-4">
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 relative"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartItems.length}
                        </span>
                    </button>
                </div>
            )}
            <CartSidebar 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)}
                onCartUpdate={handleCartUpdate}
            />
        </AppShell>
    );
}