import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardSidebarLayout from '@/layouts/dashboard/dashboard-sidebar-layout';
import { SharedData } from '@/types';
import { Button } from '@/components/ui/button';

interface MerchantApplication {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Merchant Applications',
        href: '/dashboard/admin/approval',
    },
];

export default function AdminApproval() {
    const { auth } = usePage<SharedData>().props;
    const activeMode = (auth.user.active_mode ?? auth.user.role) as 'admin' | 'merchant' | 'user';
    const [applications, setApplications] = useState<MerchantApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState<{ [key: number]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/dashboard/admin/api/merchant-applications');
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };
    
    const handleReview = async (applicationId: number, status: 'approved' | 'rejected') => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const response = await axios.post(`/dashboard/admin/api/merchant-applications/${applicationId}/review`, {
                status,
                admin_notes: adminNotes[applicationId] || null,
            });
            
            setToast({
                show: true,
                message: `Application ${status} successfully`,
                type: 'success'
            });
            
            // Remove the reviewed application from the list
            setApplications(applications.filter(app => app.id !== applicationId));
            
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Error reviewing application. Please try again.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardSidebarLayout role={activeMode} breadcrumbs={breadcrumbs}>
            <Head title="Merchant Applications" />
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Merchant Applications</h1>
                
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
                ) : applications.length === 0 ? (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                            No Pending Applications
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            All merchant applications have been reviewed
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((application) => (
                            <div
                                key={application.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                            >
                                {/* ...existing application content... */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {application.user.first_name} {application.user.last_name}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {application.user.email}
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(application.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                                        <h3 className="font-medium mb-2">Application Reason:</h3>
                                        <p className="text-gray-700 dark:text-gray-300">{application.reason}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">Admin Notes (Optional):</h3>
                                        <textarea
                                            value={adminNotes[application.id] || ''}
                                            onChange={(e) =>
                                                setAdminNotes({
                                                    ...adminNotes,
                                                    [application.id]: e.target.value,
                                                })
                                            }
                                            placeholder="Enter your review notes (optional)..."
                                            className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={() => handleReview(application.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Approve'}
                                        </Button>
                                        <Button
                                            onClick={() => handleReview(application.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Processing...' : 'Reject'}
                                        </Button>
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