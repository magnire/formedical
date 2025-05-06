import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { SharedData } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
    message?: string;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
}

interface Location {
    id: number;
    name: string;
}

interface FormData {
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_property: string;
    shipping_country_id: number | null;
    shipping_state_id: number | null;
    shipping_city_id: number | null;
    shipping_zip_postal_code: string;
    shipping_phone: string;
    shipping_email: string;
    payment_method: 'card' | 'cash';
    card_number: string;
    card_expiry: string;
    card_cvv: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Checkout',
        href: '/user/checkout',
    }
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export default function UserCheckout() {
    const { auth } = usePage<SharedData>().props;
    const activeMode = (auth.user.active_mode ?? auth.user.role) as 'admin' | 'merchant' | 'user';

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [countries, setCountries] = useState<Location[]>([]);
    const [states, setStates] = useState<Location[]>([]);
    const [cities, setCities] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState({
        states: false,
        cities: false
    });

    const [formData, setFormData] = useState<FormData>({
        shipping_first_name: auth.user.first_name || '',
        shipping_last_name: auth.user.last_name || '',
        shipping_address: auth.user.address || '',
        shipping_property: auth.user.property || '',
        shipping_country_id: auth.user.country_id || null,
        shipping_state_id: auth.user.state_id || null,
        shipping_city_id: auth.user.city_id || null,
        shipping_zip_postal_code: auth.user.zip_postal_code || '',
        shipping_phone: auth.user.phone || '',
        shipping_email: auth.user.email || '',
        payment_method: 'card',
        card_number: '',
        card_expiry: '',
        card_cvv: '',
    });

    // Fetch cart items
    useEffect(() => {
        axios.get('/api/cart')
            .then(response => {
                setCartItems(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching cart:', error);
                setLoading(false);
            });
    }, []);

        // Fetch locations data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch cart and locations data in parallel
                const [cartResponse, countriesResponse] = await Promise.all([
                    axios.get('/api/cart'),
                    axios.get('/api/countries')
                ]);
                
                setCartItems(cartResponse.data);
                setCountries(countriesResponse.data.data);
                
                // If user has a country_id, fetch states
                if (auth.user.country_id) {
                    const statesResponse = await axios.get(`/api/states?filters[country_id]=${auth.user.country_id}`);
                    setStates(statesResponse.data.data);
                    
                    // If user has a state_id, fetch cities
                    if (auth.user.state_id) {
                        const citiesResponse = await axios.get(`/api/cities?filters[state_id]=${auth.user.state_id}`);
                        setCities(citiesResponse.data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };
   
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.shipping_country_id) {
            setIsLoading(prev => ({ ...prev, states: true }));
            axios.get(`/api/states?filters[country_id]=${formData.shipping_country_id}`)
                .then(response => {
                    setStates(response.data.data);
                    // Only reset state_id if the country changed from the initial value
                    if (formData.shipping_country_id !== auth.user.country_id) {
                        setFormData(prev => ({ ...prev, shipping_state_id: null, shipping_city_id: null }));
                    }
                })
                .catch(() => setStates([]))
                .finally(() => setIsLoading(prev => ({ ...prev, states: false })));
        } else {
            setStates([]);
            setCities([]);
        }
    }, [formData.shipping_country_id]);

    useEffect(() => {
        if (formData.shipping_state_id) {
            setIsLoading(prev => ({ ...prev, cities: true }));
            axios.get(`/api/cities?filters[state_id]=${formData.shipping_state_id}`)
                .then(response => {
                    setCities(response.data.data);
                    // Only reset city_id if the state changed from the initial value
                    if (formData.shipping_state_id !== auth.user.state_id) {
                        setFormData(prev => ({ ...prev, shipping_city_id: null }));
                    }
                })
                .catch(() => setCities([]))
                .finally(() => setIsLoading(prev => ({ ...prev, cities: false })));
        } else {
            setCities([]);
        }
    }, [formData.shipping_state_id]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        
        // Handle select fields with number values
        if (name === 'shipping_country_id' || name === 'shipping_state_id' || name === 'shipping_city_id') {
            setFormData(prev => ({
                ...prev,
                [name]: value ? Number(value) : null
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Show some loading state
            setLoading(true);
            
            const orderData = {
                ...formData,
                items: cartItems.map(item => ({
                    item_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: calculateTotal(),
                // status: 'pending',
                // // Ensure these match the required fields in your migration
                // shipping_email: formData.shipping_email || auth.user.email, // Fallback to user's email
                // payment_method: formData.payment_method,
                // // Clear card details if payment method is cash
                // stripe_payment_intent_id: null,
                // stripe_payment_status: null
            };

            const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

            if (!token) {
                throw new Error('CSRF token not found');
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(token)
                },
                withCredentials: true
            };
            
            const response = await axios.post('/api/orders', orderData, config);
            
            if (response.data.success) {
                // Clear cart
                await axios.delete('/api/cart');
                
                // Redirect to order confirmation page
                window.location.href = '/dashboard/user/order-status';
            // } else {
            //     // Show error message
            //     alert(response.data.message || 'Failed to place order');
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error('Error creating order:', apiError);
            
            if (apiError.response?.status === 404) {
                alert('Order endpoint not found. Please try again later.');
            } else if (apiError.response?.status === 422) {
                alert('Please check your form data and try again.');
            } else {
                alert(apiError.message || 'Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardSidebarLayout role={activeMode} breadcrumbs={breadcrumbs}>
            <Head title="Checkout" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center">
                        <p>Your cart is empty</p>
                        <a href="/store" className="text-blue-600 hover:underline">
                            Continue Shopping
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{item.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-medium">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Form */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Shipping & Payment</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="shipping_first_name" className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_first_name"
                                            name="shipping_first_name"
                                            value={formData.shipping_first_name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="shipping_last_name" className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_last_name"
                                            name="shipping_last_name"
                                            value={formData.shipping_last_name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="shipping_address"
                                        name="shipping_address"
                                        value={formData.shipping_address}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shipping_property" className="block text-sm font-medium text-gray-700">
                                        Property (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="shipping_property"
                                        name="shipping_property"
                                        value={formData.shipping_property}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="shipping_country_id" className="block text-sm font-medium text-gray-700">
                                        Country
                                    </label>
                                    <select
                                        id="shipping_country_id"
                                        name="shipping_country_id"
                                        value={formData.shipping_country_id?.toString() || ''}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a country</option>
                                        {countries.map((country) => (
                                            <option key={country.id} value={country.id.toString()}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="shipping_state_id" className="block text-sm font-medium text-gray-700">
                                            State/Province
                                        </label>
                                        <select
                                            id="shipping_state_id"
                                            name="shipping_state_id"
                                            value={formData.shipping_state_id?.toString() || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                            disabled={!formData.shipping_country_id || isLoading.states}
                                        >
                                            <option value="">{isLoading.states ? 'Loading...' : 'Select a state'}</option>
                                            {states.map((state) => (
                                                <option key={state.id} value={state.id.toString()}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="shipping_city_id" className="block text-sm font-medium text-gray-700">
                                            City
                                        </label>
                                        <select
                                            id="shipping_city_id"
                                            name="shipping_city_id"
                                            value={formData.shipping_city_id?.toString() || ''}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                            disabled={!formData.shipping_state_id || isLoading.cities}
                                        >
                                            <option value="">{isLoading.cities ? 'Loading...' : 'Select a city'}</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.id.toString()}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="shipping_zip_postal_code" className="block text-sm font-medium text-gray-700">
                                            ZIP/Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="shipping_zip_postal_code"
                                            name="shipping_zip_postal_code"
                                            value={formData.shipping_zip_postal_code}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="shipping_phone"
                                            name="shipping_phone"
                                            value={formData.shipping_phone}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* After phone number field and before PayPal email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Payment Method
                                    </label>
                                    <div className="mt-2 space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                id="card"
                                                name="payment_method"
                                                value="card"
                                                checked={formData.payment_method === 'card'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="card" className="text-sm text-gray-700">
                                                Debit/Credit Card
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                id="cash"
                                                name="payment_method"
                                                value="cash"
                                                checked={formData.payment_method === 'cash'}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="cash" className="text-sm text-gray-700">
                                                Cash
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Details (shown only when card is selected) */}
                                {formData.payment_method === 'card' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                                                Card Number
                                            </label>
                                            <input
                                                type="text"
                                                id="card_number"
                                                name="card_number"
                                                value={formData.card_number}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                required={formData.payment_method === 'card'}
                                                pattern="[0-9]{16}"
                                                maxLength={16}
                                                placeholder="1234 5678 9012 3456"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="card_expiry" className="block text-sm font-medium text-gray-700">
                                                    Expiry Date
                                                </label>
                                                <input
                                                    type="text"
                                                    id="card_expiry"
                                                    name="card_expiry"
                                                    value={formData.card_expiry}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required={formData.payment_method === 'card'}
                                                    placeholder="MM/YY"
                                                    pattern="[0-9]{2}/[0-9]{2}"
                                                    maxLength={5}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="card_cvv" className="block text-sm font-medium text-gray-700">
                                                    CVV
                                                </label>
                                                <input
                                                    type="text"
                                                    id="card_cvv"
                                                    name="card_cvv"
                                                    value={formData.card_cvv}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                    required={formData.payment_method === 'card'}
                                                    pattern="[0-9]{3,4}"
                                                    maxLength={4}
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* <div>
                                    <label htmlFor="paypal_email" className="block text-sm font-medium text-gray-700">
                                        PayPal Email
                                    </label>
                                    <input
                                        type="email"
                                        id="paypal_email"
                                        name="paypal_email"
                                        value={formData.paypal_email}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div> */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardSidebarLayout>
    );
}