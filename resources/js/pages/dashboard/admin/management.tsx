import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'user' | 'merchant' | 'admin';
    email_verified_at: string | null;
    date_of_birth: string;
    gender: 'male' | 'female';
    address: string;
    phone: string;
    created_at: string;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'User Management',
        href: '/dashboard/admin/management',
    },
];

export default function AdminManagement() {
    const { auth } = usePage<SharedData>().props;
    const activeMode = (auth.user.active_mode ?? auth.user.role) as 'admin' | 'merchant' | 'user';
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/dashboard/admin/api/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setToast({
                show: true,
                message: 'Error fetching users. Please try again.',
                type: 'error'
            });
        }
    };

    const handleUserUpdate = async (userId: number, data: Partial<User>) => {
        try {
            await axios.patch(`/dashboard/admin/api/users/${userId}`, data);
            await fetchUsers(); // Refresh the users list
            
            setToast({
                show: true,
                message: 'User updated successfully',
                type: 'success'
            });
        } catch (error) {
            setToast({
                show: true,
                message: 'Error updating user. Please try again.',
                type: 'error'
            });
        }
    };

    const handleRoleChange = async (userId: number, newRole: 'user' | 'merchant' | 'admin') => {
        try {
            await axios.patch(`/dashboard/admin/api/users/${userId}`, {
                role: newRole
            });

            setUsers(users.map(user => 
                user.id === userId ? { ...user, role: newRole } : user
            ));

            setToast({
                show: true,
                message: 'User role updated successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            setToast({
                show: true,
                message: 'Error updating user role. Please try again.',
                type: 'error'
            });
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`/dashboard/admin/api/users/${userId}`);
            setUsers(users.filter(user => user.id !== userId));
            
            setToast({
                show: true,
                message: 'User deleted successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            setToast({
                show: true,
                message: 'Error deleting user. Please try again.',
                type: 'error'
            });
        }
    };

    return (
        <DashboardSidebarLayout role={activeMode} breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">User Management</h1>

                {/* Toast Notification */}
                {toast.show && (
                    <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white transition-all duration-500 z-50`}>
                        {toast.message}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                onBlur={(e) => {
                                                    if (e.target.value !== user.email) {
                                                        handleUserUpdate(user.id, { email: e.target.value });
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            {!user.email_verified_at && (
                                                <span className="text-xs text-amber-500 mt-1 block">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Select
                                                value={user.role}
                                                onValueChange={(value: 'user' | 'merchant' | 'admin') => 
                                                    handleRoleChange(user.id, value)
                                                }
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="merchant">Merchant</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.email_verified_at
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.email_verified_at ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                onClick={() => handleDeleteUser(user.id)}
                                                variant="destructive"
                                                size="sm"
                                                className="ml-2"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardSidebarLayout>
    );
}