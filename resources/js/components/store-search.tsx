import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuItem,
    SidebarInput 
} from '@/components/ui/sidebar';
import { Item } from '@/types';
import { FilterIcon } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface StoreSearchProps {
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    onSearch: (query: string, categories: string[], results: Item[]) => void;
    categories: {
        [key: string]: {
            id: string;
            name: string;
            type: string;
        }[];
    };
    isSearching: boolean;
    setIsSearching: (isSearching: boolean) => void;
}

export function StoreSearch({ 
    selectedCategories, 
    onCategoryChange, 
    onSearch,
    categories,
    isSearching,
    setIsSearching
}: StoreSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = async () => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) {
                params.append('query', searchQuery.trim());
            }
            if (selectedCategories.length > 0) {
                selectedCategories.forEach(catId => params.append('categories[]', catId));
            }
            
            const response = await axios.get<Item[]>(`/api/search?${params.toString()}`);
            onSearch(searchQuery, selectedCategories, response.data);
        } catch (error) {
            console.error('Error searching items:', error);
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || 'Failed to search items';
                console.error(errorMessage);
            }
            onSearch(searchQuery, selectedCategories, []); // Return empty results on error
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryToggle = (category: string) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter((c) => c !== category)
            : [...selectedCategories, category];
        onCategoryChange(updatedCategories);
    };

    return (
        <SidebarGroup>
            <SidebarInput
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="mb-4"
                disabled={isSearching}
            />
            <button
                onClick={handleSearch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSearching}
            >
                Submit
            </button>

            <button
                onClick={() => setShowFilters(!showFilters)}
                className="mt-4 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
            >
                <FilterIcon className="h-5 w-5" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            {showFilters && (
                Object.entries(categories).map(([type, categoryList]) => (
                    <div key={type} className="mb-6">
                        <SidebarGroupLabel>{type}</SidebarGroupLabel>
                        <SidebarMenu>
                            {categoryList.map((category) => (
                                <SidebarMenuItem key={category.id}>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => handleCategoryToggle(category.id)}
                                            className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                                            disabled={isSearching}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {category.name}
                                        </span>
                                    </label>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                ))
            )}
        </SidebarGroup>
    );
}