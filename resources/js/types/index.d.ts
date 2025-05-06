import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    onClick?: () => void;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}
export interface User {
    id: number;
    role: 'user' | 'merchant' | 'admin';
    active_mode?: 'user' | 'merchant' | 'admin';
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    email_verified_at: string | null;
    date_of_birth?: string;
    gender?: 'male' | 'female';
    address?: string;
    property?: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
    zip_postal_code?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    avatar?: string;
    remember_token?: string;
}

export interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    categories: { id: string; name: string }[];
}