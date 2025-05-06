import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SubSettingsLayout from '@/layouts/settings/settings-sub-layout';
import SettingsLayout from '@/layouts/settings-layout';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    address: string;
    property?: string;
    country_id: number | null;
    state_id: number | null;
    city_id: number | null;
    zip_postal_code: string;
    phone: string;
}

// apply for vendor

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [countries, setCountries] = useState<Location[]>([]);
    const [states, setStates] = useState<Location[]>([]);
    const [cities, setCities] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState({
        states: false,
        cities: false
    });

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        first_name: auth.user.first_name,
        last_name: auth.user.last_name,
        email: auth.user.email,
        date_of_birth: auth.user.date_of_birth ?? '',
        gender: auth.user.gender ?? 'male',
        address: auth.user.address ?? '',
        property: auth.user.property || '',
        country_id: auth.user.country_id ?? null,
        state_id: auth.user.state_id ?? null, 
        city_id: auth.user.city_id ?? null,
        zip_postal_code: auth.user.zip_postal_code ?? '',
        phone: auth.user.phone ?? '',
    });

    // Update the state fetch function
    const debouncedFetchStates = useMemo(
        () => debounce(async (countryId: number) => {
            setIsLoading(prev => ({ ...prev, states: true }));
            try {
                const response = await axios.get(`/api/states?filters[country_id]=${countryId}`);
                setStates(response.data.data);
            } catch (error) {
                setStates([]);
            } finally {
                setIsLoading(prev => ({ ...prev, states: false }));
            }
        }, 300),
        []
    );
    // useEffect(() => {
    //     console.log('Auth user data:', {
    //         country_id: auth.user.country_id,
    //         state_id: auth.user.state_id,
    //         city_id: auth.user.city_id
    //     });
    // }, []);
    // Update the city fetch function
    const debouncedFetchCities = useMemo(
        () => debounce(async (stateId: number) => {
            setIsLoading(prev => ({ ...prev, cities: true }));
            try {
                const response = await axios.get(`/api/cities?filters[state_id]=${stateId}`);
                setCities(response.data.data);
            } catch (error) {
                setCities([]);
            } finally {
                setIsLoading(prev => ({ ...prev, cities: false }));
            }
        }, 300),
        []
    );

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch countries first
                const countriesResponse = await axios.get('/api/countries');
                setCountries(countriesResponse.data.data);
                
                if (auth.user.country_id) {
                    // Immediately fetch states if country_id exists
                    const statesResponse = await axios.get(`/api/states?filters[country_id]=${auth.user.country_id}`);
                    setStates(statesResponse.data.data);
                    
                    if (auth.user.state_id) {
                        // Immediately fetch cities if state_id exists
                        const citiesResponse = await axios.get(`/api/cities?filters[state_id]=${auth.user.state_id}`);
                        setCities(citiesResponse.data.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching location data:', error);
                setCountries([]);
                setStates([]);
                setCities([]);
            }
        };
    
        fetchInitialData();
    
        return () => {
            debouncedFetchStates.cancel();
            debouncedFetchCities.cancel();
        };
    }, []); // Add dependencies here
    
    // useEffect(() => {
    //     console.log('Country changed:', data.country_id);
    //     console.log('Available states:', states);
    // }, [data.country_id, states]);
    
    // useEffect(() => {
    //     console.log('State changed:', data.state_id);
    //     console.log('Available cities:', cities);
    // }, [data.state_id, cities]);

    // States fetch when country changes
    useEffect(() => {
        if (data.country_id) {
            debouncedFetchStates(data.country_id);
            // setCities([]);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [data.country_id]);

    // Cities fetch when state changes
    useEffect(() => {
        if (data.state_id) {
            debouncedFetchCities(data.state_id);
        } else {
            setCities([]);
        }
    }, [data.state_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    // useEffect(() => {
    //     console.log('Cities state:', {
    //         cities,
    //         selectedCityId: data.city_id
    //     });
    // }, [cities, data.city_id]);

    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SubSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                    placeholder="First name"
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    required
                                    placeholder="Last name"
                                />
                                <InputError message={errors.last_name} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="Email address"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    required
                                    className="appearance-none border-gray-300 rounded-md focus:ring focus:ring-blue-500 focus:border-blue-500"
                                />
                                <InputError message={errors.date_of_birth} />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={data.gender}
                                    onValueChange={(value: 'male' | 'female') => setData('gender', value)}
                                    required
                                    disabled={processing}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                                placeholder="Street address"
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="property">Property (Optional)</Label>
                            <Input
                                id="property"
                                value={data.property}
                                onChange={(e) => setData('property', e.target.value)}
                                placeholder="Apartment, suite, unit, etc."
                            />
                            <InputError message={errors.property} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="country_id">Country</Label>
                            <Select
                                value={data.country_id?.toString()}
                                onValueChange={(value) => {setData('country_id', parseInt(value));}}
                            >
                                <SelectTrigger id="country_id">
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id.toString()}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.country_id} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="state_id">State/Province</Label>
                                <Select
                                    value={data.state_id?.toString()}
                                    onValueChange={(value) => {setData('state_id', parseInt(value));}}
                                    disabled={!data.country_id || isLoading.states}
                                >
                                    <SelectTrigger id="state_id">
                                        <SelectValue placeholder={isLoading.states ? "Loading..." : "Select state"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {states.map((state) => (
                                            <SelectItem key={state.id} value={state.id.toString()}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.state_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city_id">City</Label>
                                <Select
                                    value={data.city_id?.toString()}
                                    onValueChange={(value) => setData('city_id', parseInt(value))}
                                    disabled={!data.state_id || isLoading.cities}
                                >
                                    <SelectTrigger id="city_id">
                                        <SelectValue placeholder={isLoading.cities ? "Loading..." : "Select city"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((city) => (
                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.city_id} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="zip_postal_code">ZIP/Postal Code</Label>
                                <Input
                                    id="zip_postal_code"
                                    value={data.zip_postal_code}
                                    onChange={(e) => setData('zip_postal_code', e.target.value)}
                                    required
                                    placeholder="ZIP/Postal code"
                                />
                                <InputError message={errors.zip_postal_code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                    placeholder="Phone number"
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>
                        
                        {/* Show email verification status */}
                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
                <DeleteUser />
            </SubSettingsLayout>
        </SettingsLayout>
    );
}
