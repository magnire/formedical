import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Store, Settings, CheckSquare, Package, ShoppingCart, ClipboardList } from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems: NavItem[] = [
    {
        title: 'Approval',
        href: '/dashboard/admin/approval',
        icon: CheckSquare,
    },
    {
        title: 'Management',
        href: '/dashboard/admin/management',
        icon: Folder,
    },
];

const merchantNavItems: NavItem[] = [
    {
        title: 'Shipping',
        href: '/dashboard/merchant/shipping',
        icon: Package,
    },
    {
        title: 'Stocking',
        href: '/dashboard/merchant/stocking',
        icon: LayoutGrid,
    },
];

const userNavItems: NavItem[] = [
    {
        title: 'Checkout',
        href: '/dashboard/user/checkout',
        icon: ShoppingCart,
    },
    {
        title: 'Order Status',
        href: '/dashboard/user/order-status',
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Store',
        href: route('store.index'),
        icon: Store,
    },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

interface DashboardSidebarProps {
    role: 'admin' | 'merchant' | 'user'; // Define role types
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
    const { auth } = usePage<SharedData>().props;
    const activeMode = auth.user.active_mode ?? auth.user.role;
    let mainNavItems: NavItem[] = [];

    // Determine mainNavItems based on active mode
    if (activeMode === 'admin') {
        mainNavItems = adminNavItems;
    } else if (activeMode === 'merchant') {
        mainNavItems = merchantNavItems;
    } else {
        mainNavItems = userNavItems;
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/store" prefetch>
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
    );
}