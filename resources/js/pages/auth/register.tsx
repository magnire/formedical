import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React, { FormEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';


// Types and Interfaces
interface Location {
    id: number;
    name: string;
}

type RegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    address: string;
    property: string;
    country_id: number | null;
    state_id: number | null;
    city_id: number | null;
    zip_postal_code: string;
    phone: string;
};

// Memoized Components
const PersonalInformationSection = React.memo(({ 
    data, 
    setData, 
    processing, 
    errors,
    firstNameRef,
    countries,
    states,
    cities,
}: {
    data: RegisterForm;
    setData: Function;
    processing: boolean;
    errors: any;
    firstNameRef: React.RefObject<HTMLInputElement>;
    countries: Location[];
    states: Location[];
    cities: Location[];
}) => {
    const updateField = useCallback((field: keyof RegisterForm, value: any) => {
        setData(field, value);
    }, [setData]);

    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        ref={firstNameRef}
                        id="first_name"
                        type="text"
                        required
                        value={data.first_name}
                        onChange={(e) => updateField('first_name', e.target.value)}
                        disabled={processing}
                        placeholder="First name"
                    />
                    <InputError message={errors.first_name} className="mt-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                        id="last_name"
                        type="text"
                        required
                        value={data.last_name}
                        onChange={(e) => updateField('last_name', e.target.value)}
                        disabled={processing}
                        placeholder="Last name"
                    />
                    <InputError message={errors.last_name} className="mt-1" />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={processing}
                    placeholder="email@example.com"
                />
                <InputError message={errors.email} className="mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        disabled={processing}
                        placeholder="Password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => updateField('password_confirmation', e.target.value)}
                        disabled={processing}
                        placeholder="Confirm password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        required
                        value={data.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.date_of_birth} className="mt-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                        value={data.gender}
                        onValueChange={(value) => updateField('gender', value as 'male' | 'female')}
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
                    type="text"
                    required
                    value={data.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    disabled={processing}
                    placeholder="Address"
                />
                <InputError message={errors.address} className="mt-1" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="property">Property (Optional)</Label>
                <Input
                    id="property"
                    type="text"
                    value={data.property}
                    onChange={(e) => updateField('property', e.target.value)}
                    disabled={processing}
                    placeholder="Apartment, suite, etc."
                />
                <InputError message={errors.property} className="mt-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocationSelectFields
                    data={data}
                    setData={setData}
                    processing={processing}
                    errors={errors}
                    countries={countries}
                    states={states}
                    cities={cities}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="zip_postal_code">ZIP / Postal Code</Label>
                    <Input
                        id="zip_postal_code"
                        type="text"
                        required
                        value={data.zip_postal_code}
                        onChange={(e) => updateField('zip_postal_code', e.target.value)}
                        disabled={processing}
                        placeholder="ZIP / Postal code"
                    />
                    <InputError message={errors.zip_postal_code} className="mt-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        required
                        value={data.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        disabled={processing}
                        placeholder="Phone number"
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>
            </div>
        </div>
    );
});

// Don't forget to add the displayName for debugging purposes
PersonalInformationSection.displayName = 'PersonalInformationSection';

const LocationSelectFields = React.memo(({
    data,
    setData,
    processing,
    errors,
    countries,
    states,
    cities,
}: {
    data: RegisterForm;
    setData: Function;
    processing: boolean;
    errors: any;
    countries: Location[];
    states: Location[];
    cities: Location[];
}) => {
    const updateField = useCallback((field: keyof RegisterForm, value: any) => {
        setData(field, value);
    }, [setData]);

    return (
        <>
            <div className="col-span-full">
                <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                        value={data.country_id?.toString()}
                        onValueChange={(value) => {
                            updateField('country_id', parseInt(value));
                            updateField('state_id', null);
                            updateField('city_id', null);
                        }}
                        disabled={processing}
                    >
                        <SelectTrigger id="country">
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
                    <InputError message={errors.country_id} className="mt-1" />
                </div>
            </div>
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Select
                        value={data.state_id?.toString()}
                        onValueChange={(value) => {
                            updateField('state_id', parseInt(value));
                            updateField('city_id', null);
                        }}
                        disabled={processing || !data.country_id}
                    >
                        <SelectTrigger id="state">
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            {states.map((state) => (
                                <SelectItem key={state.id} value={state.id.toString()}>
                                    {state.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.state_id} className="mt-1" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Select
                        value={data.city_id?.toString()}
                        onValueChange={(value) => updateField('city_id', parseInt(value))}
                        disabled={processing || !data.state_id}
                    >
                        <SelectTrigger id="city">
                            <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.city_id} className="mt-1" />
                </div>
            </div>
        </>
    );
});

// Add display name for debugging
LocationSelectFields.displayName = 'LocationSelectFields';

export default function Register() {
    const firstNameRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;;
    const [countries, setCountries] = useState<Location[]>([]);
    const [states, setStates] = useState<Location[]>([]);
    const [cities, setCities] = useState<Location[]>([]);

    // Form State
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        property: '',
        country_id: null,
        state_id: null,
        city_id: null,
        zip_postal_code: '',
        phone: '',
    });

    // Debounced API Calls
    const debouncedFetchStates = useMemo(
        () => debounce((countryId: number) => {
            axios.get(`/api/states?filters[country_id]=${countryId}`)
                .then(response => setStates(response.data.data))
                .catch(() => setStates([]));
        }, 300),
        []
    );

    const debouncedFetchCities = useMemo(
        () => debounce((stateId: number) => {
            axios.get(`/api/cities?filters[state_id]=${stateId}`)
                .then(response => setCities(response.data.data))
                .catch(() => setCities([]));
        }, 300),
        []
    );

    // Initial countries fetch
    useEffect(() => {
        axios.get('/api/countries')
            .then(response => setCountries(response.data.data))
            .catch(() => setCountries([]));

        return () => {
            debouncedFetchStates.cancel();
            debouncedFetchCities.cancel();
        };
    }, []);

    // States fetch when country changes
    useEffect(() => {
        if (data.country_id) {
            debouncedFetchStates(data.country_id);
            setCities([]); // Clear cities when country changes
        } else {
            setStates([]);
            setCities([]);
        }
    }, [data.country_id, debouncedFetchStates]);

    // Cities fetch when state changes
    useEffect(() => {
        if (data.state_id) {
            debouncedFetchCities(data.state_id);
        } else {
            setCities([]);
        }
    }, [data.state_id, debouncedFetchCities]);

    // Focus Management
    useEffect(() => {
        if (firstNameRef.current && !data.first_name) {
            firstNameRef.current.focus();
        }
    }, []);

    // Form Submission
    const submit: FormEventHandler = useCallback((e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }, [post, reset]);

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <PersonalInformationSection 
                        data={data}
                        setData={setData}
                        processing={processing}
                        errors={errors}
                        firstNameRef={firstNameRef}
                        countries={countries}  // Add this
                        states={states}       // Add this
                        cities={cities}      // Add this
                    />
                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')}>Log in</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}