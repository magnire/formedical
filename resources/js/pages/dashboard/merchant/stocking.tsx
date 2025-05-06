import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem, SharedData } from '@/types';
import axios from 'axios';

interface FormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    image_url: string;
    categories: string[];
}

interface Category {
    id: string;
    name: string;
    type: string;
    parent_id: number;
}

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    categories: Category[];
    merchant_id: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Stocking',
        href: '/merchant/stocking',
    }
];

interface GroupedCategories {
    [key: string]: Category[];
}

export default function MerchantStocking() {
    const { auth } = usePage<SharedData>().props;
    const activeMode = (auth.user.active_mode ?? auth.user.role) as 'admin' | 'merchant' | 'user';
    const [items, setItems] = useState<Item[]>([]);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
        
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        categories: [],
    });

    const [categories, setCategories] = useState<GroupedCategories>({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axios.get('/api/merchant/items', {
                params: {
                    merchant_id: auth.user.id
                }
            });
            console.log('API Response:', response.data);
            setItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch items:', error);
            setItems([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (categoryId: string) => {
        setFormData((prev) => {
            const isSelected = prev.categories.includes(categoryId);
            return {
                ...prev,
                categories: isSelected
                    ? prev.categories.filter((id) => id !== categoryId)
                    : [...prev.categories, categoryId],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formattedData = {
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                image_url: formData.image_url?.trim() || null,
                categories: formData.categories.filter(Boolean),
                merchant_id: auth.user.id
            };
    
            const response = await axios.post('/api/merchant/items', formattedData);
            console.log('Success:', response.data);
            alert('Item added successfully!');
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                image_url: '',
                categories: [],
            });
            fetchItems();
        } catch (error: any) {
            console.error('Error details:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Failed to add item';
            alert(errorMessage);
        }
    };

    const handleEditItem = async (item: Item) => {
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            stock: item.stock.toString(),
            image_url: item.image_url,
            categories: item.categories.map(c => c.id.toString()),
        });
        setEditingItem(item);
        setActiveTab('add');
    };

    // Update handleDeleteItem function
    const handleDeleteItem = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await axios.delete(`/api/merchant/items/${itemId}`); // Update endpoint
            setItems(items.filter(item => item.id !== itemId));
            alert('Item deleted successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to delete item');
        }
    };

    return (
        <DashboardSidebarLayout role={activeMode}  breadcrumbs={breadcrumbs}>
            <Head title="Merchant Dashboard - Stocking" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Stocking Management</h1>
                
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('add')}
                                className={`${
                                    activeTab === 'add'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('manage');
                                    setEditingItem(null);
                                    setFormData({
                                        name: '',
                                        description: '',
                                        price: '',
                                        stock: '',
                                        image_url: '',
                                        categories: [],
                                    });
                                }}
                                className={`${
                                    activeTab === 'manage'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Manage Items
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'add' ? (

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Image URL
                            </label>
                            <input
                                type="url"
                                id="image_url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Categories
                            </label>
                            <div className="mt-2 space-y-4">
                                {Object.entries(categories).map(([type, categoryList]) => (
                                    <div key={type}>
                                        <label className="block text-sm text-gray-600 dark:text-gray-400">
                                            {type}
                                        </label>
                                        <select
                                            value={formData.categories.find(id =>
                                                categoryList.some(cat => cat.id.toString() === id)
                                            ) || ''}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            <option value="">Select category</option>
                                            {categoryList.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {editingItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </form>
                ) : (
                    // Items management table
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categories</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.image_url && (
                                                    <img className="h-10 w-10 rounded-full mr-3" src={item.image_url} alt="" />
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">${item.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{item.stock}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {item.categories.map((category) => (
                                                    <span key={category.id} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                        {category.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditItem(item)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
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