import { Head } from '@inertiajs/react';
import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface OrderItem {
    id: number;
    item: {
        name: string;
        price: number | string;
    };
    quantity: number;
    price: number | string;
}

interface Order {
    id: number;
    total: number | string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
    items: OrderItem[];
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    payment_method: string;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Order Status',
        href: '/dashboard/user/order-status',
    }
];

const formatPrice = (price: string | number): string => {
    const numericPrice = typeof price === 'string' ? Number(price) : price;
    return numericPrice.toFixed(2);
};

export default function OrderStatus() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
    const [sendingReceiptId, setSendingReceiptId] = useState<number | null>(null);

    useEffect(() => {
        axios.get('/api/orders')
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            });
    }, []);

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

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setCancellingOrderId(orderId);
        try {
            await axios.post(`/api/orders/${orderId}/cancel`);
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled' as const } 
                    : order
            ));
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const handleSendReceipt = async (orderId: number) => {
        setSendingReceiptId(orderId);
        try {
            await axios.post(`/api/orders/${orderId}/send-receipt`);
            alert('Receipt sent successfully');
        } catch (error) {
            console.error('Error sending receipt:', error);
            alert('Failed to send receipt');
        } finally {
            setSendingReceiptId(null);
        }
    };

    return (
        <DashboardSidebarLayout role="user" breadcrumbs={breadcrumbs}>
            <Head title="Order Status" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center">
                        <p>No orders found</p>
                        <a href="/store" className="text-blue-600 hover:underline">
                            Start Shopping
                        </a>
                    </div>
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
                                        <button
                                            onClick={() => handleSendReceipt(order.id)}
                                            disabled={sendingReceiptId === order.id}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                        >
                                            {sendingReceiptId === order.id ? 'Sending...' : 'Send Receipt'}
                                        </button>
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancellingOrderId === order.id}
                                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                            >
                                                {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-medium mb-2">Items</h3>
                                    <div className="space-y-2">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between">
                                                <div>
                                                    <p>{item.item.name}</p>
                                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                </div>
                                                <p>${formatPrice(Number(item.price) * item.quantity)}</p>
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
                                        </div>
                                        <div>
                                            <h3 className="font-medium mb-2">Payment Details</h3>
                                            <p>Method: {order.payment_method.toUpperCase()}</p>
                                            <p className="font-semibold mt-2">Total: ${formatPrice(order.total)}</p>
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