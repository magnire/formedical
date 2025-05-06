import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const getLabel = () => {
        const url = page.url;
        if (url.startsWith('/dashboard/merchant') || url.startsWith('/merchant')) {
            return 'Merchant Dashboard';
        } else if (url.startsWith('/dashboard/admin') || url.startsWith('/admin')) {
            return 'Admin Dashboard';
        } else if (url.startsWith('/dashboard/user') || url.startsWith('/user')) {
            return 'User Dashboard';
        }
        return 'Feature';
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{getLabel()}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton  
                            asChild 
                            isActive={item.href === page.url}
                            tooltip={{ children: item.title }}
                            onClick={item.onClick}
                        >
                            <Link href={item.href} prefetch onClick={(e) => {
                                if (item.onClick) {
                                    e.preventDefault();
                                    item.onClick();
                                }
                            }}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}