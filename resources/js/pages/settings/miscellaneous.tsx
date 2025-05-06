import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

import SubSettingsLayout from '@/layouts/settings/settings-sub-layout';
import SettingsLayout from '@/layouts/settings/settings-sidebar-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Misc.',
        href: '/settings/miscellaneous',
    },
];

export default function Miscellaneous() {
    const { data, setData, post, processing, errors } = useForm({
        reason: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('merchant.apply'));
    };

    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <Head title="Miscellaneous" />

            <SubSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall 
                        title="Apply for Merchant" 
                        description="Submit your application to become a merchant" 
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">
                                Why do you want to become a merchant?
                            </Label>
                            <textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                required
                                placeholder="Explain your reasons and qualifications..."
                                rows={4}
                                className="mt-1 w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                            />
                            <InputError message={errors.reason} />
                        </div>

                        <Button type="submit" disabled={processing}>
                            Submit Application
                        </Button>
                    </form>
                </div>
            </SubSettingsLayout>
        </SettingsLayout>
    );
}