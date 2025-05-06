import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLogo from './app-logo';
import axios from 'axios';
import { Search, LayoutGrid, FilterIcon } from 'lucide-react';
import { NavMain } from './nav-main';

interface Category {
    id: string;
    name: string;
    type: string;
    parent_id: number | null;
}

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
    categories: { id: string; name: string }[];
}

interface GroupedCategories {
    [key: string]: Category[];
}

interface StoreSidebarProps {
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    onSearch: (query: string, categories: string[], results: Item[]) => void;
    items: Item[];
}

export function StoreSidebar({ selectedCategories, onCategoryChange, onSearch, items }: StoreSidebarProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<GroupedCategories>({});
    const [isSearching, setIsSearching] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Fetch categories when component mounts
        fetch('/api/categories')
            .then((response) => response.json())
            .then((data) => setCategories(data))
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            // Call the onSearch prop directly with current query and categories
            onSearch(searchQuery, selectedCategories, items);
            setIsSearchOpen(false);
        } catch (error) {
            console.error('Error searching items:', error);
            onSearch(searchQuery, selectedCategories, []);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCategoryToggle = (category: string) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];
        onCategoryChange(updatedCategories);
    };

    // Define nav items with search dialog trigger
    const mainNavItems: NavItem[] = [
        {
            title: 'Search',
            href: '#',
            icon: Search,
            onClick: () => {
                setIsSearchOpen(true);
            },
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    return (
        <>
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard">
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>

                <SidebarFooter>
                    <NavFooter items={footerNavItems} className="mt-auto" />
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <Dialog 
                open={isSearchOpen} 
                onOpenChange={(open) => {
                    setIsSearchOpen(open);
                    if (!open) {
                        setShowFilters(false);
                        setSearchQuery('');
                    }
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Search Products</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-4">
                            <input
                                type="search"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2"
                                disabled={isSearching}
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-sm text-gray-600"
                            >
                                <FilterIcon className="h-4 w-4" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>

                            {showFilters && (
                                <div className="max-h-[300px] overflow-y-auto">
                                    {Object.entries(categories).map(([type, categoryList]) => (
                                        <div key={type} className="mb-4">
                                            <h3 className="mb-2 text-sm font-medium">{type}</h3>
                                            <div className="space-y-2">
                                                {categoryList.map((category) => (
                                                    <label key={category.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(category.id)}
                                                            onChange={() => handleCategoryToggle(category.id)}
                                                            disabled={isSearching}
                                                        />
                                                        <span className="text-sm">{category.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}