import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';
import { useIsMobile } from '@/hooks/use-mobile';

interface StoreHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function StoreHeader({ breadcrumbs = [] }: StoreHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const isMobile = useIsMobile();

    // User Menu Component
    const UserMenu = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <Avatar>
                        <AvatarImage src={auth.user.avatar} alt={auth.user.full_name} />
                        <AvatarFallback>{getInitials(auth.user.full_name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <>
            {/* Main Header */}
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center justify-between px-4 w-full">
                    {/* Mobile Menu */}
                    {/* <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col">
                                <SheetHeader className="flex justify-start">
                                    <AppLogoIcon className="h-6 w-6" />
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
                    </div> */}
    
                    {/* Breadcrumbs and User Menu */}
                    <div className="lg:flex flex-1 items-right justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Go to Dashboard Button */}
                            {/* <Button variant="link" asChild className="text-sm font-medium">
                                <a href="/dashboard">Go to Dashboard</a>
                            </Button> */}
                            {/* <UserMenu /> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}