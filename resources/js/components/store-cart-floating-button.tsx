import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function StoreCartFloatingButton() {
    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                asChild
                size="lg"
                className="size-14 rounded-full shadow-lg hover:shadow-xl"
            >
                <Link href="/cart">
                    <ShoppingCart className="size-6" />
                    <span className="sr-only">Shopping Cart</span>
                </Link>
            </Button>
        </div>
    );
}