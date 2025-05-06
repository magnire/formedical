import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCartUpdate?: (items: CartItem[]) => void;
}

export default function StoreCartSidebar({ isOpen, onClose, onCartUpdate }: CartSidebarProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const handleQuantityChange = (itemId: number, quantity: number) => {
        if (quantity < 0) return;
    
        fetch('/cart/update', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ item_id: itemId, quantity }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (quantity === 0) {
                const updatedCart = cartItems.filter((cartItem) => cartItem.id !== itemId);
                setCartItems(updatedCart);
                onCartUpdate?.(updatedCart);
                // Dispatch event when removing item
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                const updatedCart = cartItems.map((cartItem) =>
                    cartItem.id === itemId ? { ...cartItem, quantity: data.cartItem.quantity } : cartItem
                );
                setCartItems(updatedCart);
                onCartUpdate?.(updatedCart);
            }
        })
        .catch((error) => console.error('Error updating quantity:', error));
    };

    const handleQuantityInput = (itemId: number, value: string) => {
        const quantity = parseInt(value, 10);
        
        if (isNaN(quantity)) return;
        
        // If quantity is 0 or negative, set it to 1
        if (quantity <= 0) {
            handleQuantityChange(itemId, 1);
            return;
        }
        
        handleQuantityChange(itemId, quantity);
    };

    const handleRemoveItem = (itemId: number) => {
        handleQuantityChange(itemId, 0);
    };

    const handleClearCart = () => {
        // Clear all items from cart
        cartItems.forEach(item => {
            handleQuantityChange(item.id, 0);
        });
    };

    useEffect(() => {
        if (isOpen) {
            fetch('/api/cart')
                .then((response) => response.json())
                .then((data) => setCartItems(data))
                .catch((error) => console.error('Error fetching cart items:', error));
        }
    }, [isOpen]);

    useEffect(() => {
        const handleCartUpdate = () => {
            fetch('/api/cart')
                .then((response) => response.json())
                .then((data) => setCartItems(data))
                .catch((error) => console.error('Error fetching cart items:', error));
        };
        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, []);

    useEffect(() => {
        if (cartItems.length === 0 && isOpen) {
            onClose();
        }
    }, [cartItems, isOpen]);
    
    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40" 
                    onClick={onClose}
                />
            )}
            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                } transition-transform duration-300 z-50`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Your Cart</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Close
                        </button>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                            Clear Cart
                        </button>
                    )}
                    <div className="mt-4">
                        {cartItems.length > 0 ? (
                            <ul>
                                {cartItems.map((item) => (
                                    <li key={item.id} className="flex flex-col mb-4 p-2 border-b">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                        <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-800 rounded-l hover:bg-gray-300 transition-colors"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                                                className="w-12 text-center font-medium border rounded px-1 [appearance:textfield]"
                                                min="1"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-800 rounded-r hover:bg-gray-300 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Your cart is empty.</p>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div className="mt-4">
                            <Link
                                href="/user/checkout"
                                className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}