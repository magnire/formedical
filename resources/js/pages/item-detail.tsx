import { Head } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';
import { Item, type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';

interface ItemDetailProps {
    item: {
        id: number;
        name: string;
        description: string;
        price: number;
        stock: number;
        image_url: string;
        categories: { id: string; name: string }[];
    };
}

export default function ItemDetail({ item }: ItemDetailProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const handleSearch = (query: string, categories: string[], results: Item[])=> {
    };
    const [isLoading, setIsLoading] = useState(false);
    const [isInCart, setIsInCart] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Store',
            href: '/store',
        },
        {
            title: item.name,
            href: `/store/items/${item.id}`,
        },
    ];

    // Check if item is in cart on component mount
    useEffect(() => {
        fetch('/api/cart')
            .then(res => res.json())
            .then(cartData => {
                setIsInCart(cartData.some((cartItem: any) => cartItem.id === item.id));
            })
            .catch(error => console.error('Error checking cart:', error));
    }, [item.id]);

    // Listen for cart updates
    useEffect(() => {
        const handleCartUpdate = () => {
            fetch('/api/cart')
                .then(res => res.json())
                .then(cartData => {
                    setIsInCart(cartData.some((cartItem: any) => cartItem.id === item.id));
                })
                .catch(error => console.error('Error checking cart:', error));
        };

        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, [item.id]);

    const handleBuy = () => {
        setIsLoading(true);

        fetch('/cart/add', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ item_id: item.id }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                window.dispatchEvent(new Event('cart-updated'));
            }
        })
        .catch((error) => console.error('Error adding to cart:', error))
        .finally(() => {
            setIsLoading(false);
        });
    };

    // Replace the existing button with this new one:
    const buyButton = (
        <button
            onClick={handleBuy}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            disabled={item.stock === 0 || isLoading || isInCart}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                            fill="none"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Adding...</span>
                </>
            ) : isInCart ? (
                'Added to Cart'
            ) : item.stock === 0 ? (
                'Out of Stock'
            ) : (
                'Buy Now'
            )}
        </button>
    );

    return (
        <StoreLayout 
            breadcrumbs={breadcrumbs} 
            items={[]}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            onSearch={handleSearch}
        >
            <div>
                <Head title={item.name} />
                <div className="max-w-4xl mx-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="aspect-square relative overflow-hidden rounded-xl">
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold">{item.name}</h1>
                            <p className="text-xl font-semibold">
                                ${typeof item.price === 'string' ? Number(item.price).toFixed(2) : item.price.toFixed(2)}
                            </p>
                            <p className="text-gray-600">{item.description}</p>
                            <p className="text-sm">Stock: {item.stock}</p>
                            <div className="flex flex-wrap gap-2">
                                {item.categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="inline-flex px-3 py-1 bg-gray-100 rounded-full text-sm whitespace-nowrap"
                                    >
                                        {category.name}
                                    </span>
                                ))}
                            </div>
                            {buyButton}
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}