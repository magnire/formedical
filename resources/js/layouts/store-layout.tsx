import StoreLayoutTemplate from '@/layouts/store/store-main-layout';
import { type BreadcrumbItem, type Item } from '@/types';
import { type ReactElement } from 'react';

interface StoreLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    items: Item[] | undefined;  // Allow undefined
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    onSearch: (query: string, categories: string[], results: Item[]) => void;
}

export default function StoreLayout({ 
    children, 
    breadcrumbs, 
    items,
    selectedCategories,
    onCategoryChange,
    onSearch
}: StoreLayoutProps) {
    const normalizedItems = items?.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? Number(item.price) : item.price
    })) || [];

    return (
        <StoreLayoutTemplate 
            breadcrumbs={breadcrumbs} 
            items={items || []}  // Provide empty array as fallback
            selectedCategories={selectedCategories}
            onCategoryChange={onCategoryChange}
            onSearch={onSearch}
        >
            {children}
        </StoreLayoutTemplate>
    );
}