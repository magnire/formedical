import { useEffect, useState } from 'react';
import StoreLayout from '@/layouts/store-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { StoreSidebar } from '@/components/store-sidebar';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Store',
        href: '/store',
    },
];

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    categories: { id: string; name: string }[];
}
interface CartItem {
    id: number;  // Changed from item_id to id
    name: string;
    price: number;
    quantity: number;
    image_url: string;
}

interface PaginatedResponse {
    current_page: number;
    data: Item[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface StoreProps {
    items: Item[] | undefined;
    // filteredItems: Item[];
    // selectedCategories: string[];
    // onCategoryChange: (categories: string[]) => void;
}

export default function Store({ items, 
    //filteredItems, selectedCategories, onCategoryChange
    } : StoreProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});

    const refreshCart = () => {
        fetch('/api/cart')
            .then(res => res.json())
            .then(cartData => {
                setCart(cartData);
                setLoadingItems({});
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching cart:', error);
                setLoadingItems({});
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const cartUpdateHandler = () => refreshCart();
        window.addEventListener('cart-updated', cartUpdateHandler);
        return () => window.removeEventListener('cart-updated', cartUpdateHandler);
    }, []);
    
    useEffect(() => {
        console.log('Items:', items);
        console.log('Filtered Items:', filteredItems);
    }, [items, filteredItems]);

    useEffect(() => {
        console.log('Items prop:', items);
        console.log('Items type:', typeof items);
        console.log('Is Array:', Array.isArray(items));
        
        if (Array.isArray(items)) {
            setFilteredItems(items);
            setIsLoading(false);
        }
    }, [items]);
    
    useEffect(() => {
        // Only fetch cart data since items are now managed by the layout
        fetch('/api/cart')
            .then(res => res.json())
            .then(cartData => {
                setCart(cartData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching cart:', error);
                setIsLoading(false);
            });
    }, []);

    const filterItems = (query: string, categories: string[]) => {
        if (!Array.isArray(items)) return;

        let filtered = [...items];

        if (query) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (categories.length > 0) {
            filtered = filtered.filter(item =>
                item.categories?.some(cat => categories.includes(cat.id))
            );
        }

        setFilteredItems(filtered);
    };

    const handleBuy = (itemId: number) => {
        setLoadingItems(prev => ({ ...prev, [itemId]: true }));

        fetch('/cart/add', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ item_id: itemId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                console.log('Item added to cart:', data.cartItem);
                window.dispatchEvent(new Event('cart-updated'));
                // Refresh cart data after successful addition
                fetch('/api/cart')
                    .then((response) => response.json())
                    .then((data) => {
                        setCart(data);
                    })
                    .catch((error) => console.error('Error fetching cart:', error));
            }
        })
        .catch((error) => console.error('Error adding to cart:', error));
    };
    

    // const handleQuantityChange = (itemId: number, quantity: number) => {
    //     if (quantity < 0) return;  // Changed from quantity < 1
    
    //     fetch('/cart/update', {
    //         method: 'POST',
    //         credentials: 'same-origin',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    //         },
    //         body: JSON.stringify({ item_id: itemId, quantity }),
    //     })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .then((data) => {
    //         if (quantity === 0) {
    //             // Remove the item from cart when quantity is 0
    //             setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
    //         } else {
    //             setCart((prevCart) =>
    //                 prevCart.map((cartItem) =>
    //                     cartItem.id === itemId ? { ...cartItem, quantity: data.cartItem.quantity } : cartItem
    //                 )
    //             );
    //         }
    //     })
    //     .catch((error) => console.error('Error updating quantity:', error));
    // };

    return (
        <StoreLayout 
            breadcrumbs={breadcrumbs} 
            items={items}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            onSearch={filterItems}
        >
            <div>
                <Head title="Store" />
                <div className="flex-1 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {isLoading ? (
                        <div className="col-span-3 flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        </div>
                    ) : Array.isArray(filteredItems) && filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                            const cartItem = cart.find((cartItem) => cartItem.id === item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border p-4"
                                    >
                                        <Link
                                            href={`/store/items/${item.id}`}
                                            className="absolute inset-0 z-10 group"
                                        >
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 text-white">
                                                <h3 className="text-lg font-bold">{item.name}</h3>
                                                <p className="text-sm">{item.description}</p>
                                                <p className="text-sm font-semibold">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                                <p className="text-sm">Stock: {item.stock}</p>
                                            </div>
                                        </Link>
                                        {/* Cart controls outside of Link to prevent navigation when using them */}
                                        <div className="absolute bottom-4 right-4 z-20">
                                        {cartItem ? (
                                            <button
                                                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-default"
                                                disabled
                                            >
                                                Added to Cart
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleBuy(item.id);
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                                disabled={item.stock === 0 || loadingItems[item.id]}
                                            >
                                                {loadingItems[item.id] ? (
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
                                                ) : (
                                                    item.stock === 0 ? 'Out of Stock' : 'Buy Now'
                                                )}
                                            </button>
                                        )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 col-span-3">
                                <p className="text-lg">No items available.</p>
                                <p className="text-sm">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}