import { Head, usePage } from '@inertiajs/react';
import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SharedData } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    return { auth };
}

interface OrderItem {
    id: number;
    item: {
        id: number;  // Add this
        name: string;
        price: number;
        stock: number;  // Add this
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
    items: OrderItem[];
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_phone: string;
    payment_method: string;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard/merchant',
    },
    {
        title: 'Shipping',
        href: '/dashboard/merchant/shipping',
    }
];

export default function MerchantShipping() {
    const { auth } = usePage<SharedData>().props;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await axios.get('/api/merchant/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading orders:', error);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
        if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
            return;
        }
    
        if (newStatus === 'processing') {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                for (const orderItem of order.items) {
                    const { item, quantity } = orderItem;
                    const newStock = item.stock - quantity;
                    
                    if (newStock < 0) {
                        throw new Error(`Not enough stock for item: ${item.name}`);
                    }
        
                    // Update the endpoint to match the new route
                    await axios.patch(`/api/merchant/items/${item.id}/stock`, {
                        stock: newStock
                    });
                }
            }
        }

        setProcessingOrderId(orderId);
        try {
            await axios.post(`/api/merchant/orders/${orderId}/status`, { status: newStatus });
            
            // Reduce stock when marking as processing
            if (newStatus === 'processing') {
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    for (const orderItem of order.items) {
                        const { item, quantity } = orderItem;
                        const newStock = item.stock - quantity;
                        
                        if (newStock < 0) {
                            throw new Error(`Not enough stock for item: ${item.name}`);
                        }
    
                        await axios.patch(`/api/merchant/items/${item.id}/stock`, {
                            stock: newStock
                        });
                    }
                }
            }
    
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus } 
                    : order
            ));
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setProcessingOrderId(null);
        }
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardSidebarLayout role="merchant" breadcrumbs={breadcrumbs}>
            <Head title="Shipping Management" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Shipping Management</h1>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center">No orders to process</div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Order #{order.id}</h2>
                                        <p className="text-sm text-gray-600">
                                            Placed on {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                disabled={processingOrderId === order.id}
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                {processingOrderId === order.id ? 'Processing...' : 'Mark as Processing'}
                                            </button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button
                                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                disabled={processingOrderId === order.id}
                                                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {processingOrderId === order.id ? 'Completing...' : 'Mark as Completed'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Order Items</h3>
                                    <div className="space-y-2">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between">
                                                <div>
                                                    <p>{item.item.name}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Shipping Details</h3>
                                            <p>{order.shipping_first_name} {order.shipping_last_name}</p>
                                            <p>{order.shipping_address}</p>
                                            <p>Phone: {order.shipping_phone}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">Payment Details</h3>
                                            <p>Method: {order.payment_method.toUpperCase()}</p>
                                            <p className="font-semibold mt-2">Total: ${order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardSidebarLayout>
    );
}