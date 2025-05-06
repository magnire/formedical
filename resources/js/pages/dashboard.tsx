import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    role: 'admin' | 'merchant' | 'user';
}

export default function Dashboard({ role }: DashboardProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        categories: [] as string[],
    });

    type Category = {
        id: string;
        name: string;
        type: string;
        parent_id: number;
    };

    type GroupedCategories = {
        [key: string]: Category[];
    };

    const [categories, setCategories] = useState<GroupedCategories>({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/admin/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

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
            await axios.post('/admin/items', formData);
            alert('Item added successfully!');
            setFormData({ name: '', description: '', price: '', stock: '', image_url: '', categories: [] });
        } catch (error) {
            console.error(error);
            alert('Failed to add item.');
        }
    };

    const renderRoleSpecificContent = () => {
        switch (role) {
            case 'admin':
                return <p>Welcome, Admin! You can manage the entire system here.</p>;
            case 'merchant':
                return <p>Welcome, Merchant! You can manage your products here.</p>;
            case 'user':
                return <p>Welcome, User! You can browse and purchase items here.</p>;
            default:
                return <p>Welcome to the Dashboard!</p>;
        }
    };

    return (
        <DashboardLayout breadcrumbs={breadcrumbs} role={role}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
                {renderRoleSpecificContent()}
                {role === 'admin' && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
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
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
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
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="stock"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
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
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="image_url"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
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
                                            className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm 
                                                    focus:border-blue-500 focus:ring-blue-500 
                                                    dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
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
                            Add Item
                        </button>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}