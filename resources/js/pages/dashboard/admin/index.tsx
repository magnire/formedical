import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    }
];

export default function AdminDashboard() {
    const { auth } = usePage<SharedData>().props;
    const activeMode = (auth.user.active_mode ?? auth.user.role) as 'admin' | 'merchant' | 'user';

    return (
        <DashboardSidebarLayout role={activeMode} breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Welcome to your admin dashboard. Use the sidebar to navigate to different sections.
                </p>
            </div>
        </DashboardSidebarLayout>
    );
}