import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, Shield, Box, User2  } from 'lucide-react';
import { useState } from 'react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const page = usePage();
    const [isSwitching, setIsSwitching] = useState(false);

    const switchMode = async (mode: string) => {
        if (isSwitching) return;
        
        setIsSwitching(true);
        try {
            // Remove the router.on('before') as it prevents the POST request
            const response = await router.post(route('switch.mode'), { mode });
            
            // Wait a bit for the server state to update
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Reload the page to the dashboard
            window.location.href = route('dashboard');
        } catch (error) {
            console.error('Mode switch failed:', error);
            setIsSwitching(false);
        }
    };

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            {/* User Info Section */}
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Mode Switching Section */}
            <DropdownMenuGroup>
                {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <button
                            className="block w-full"
                            onClick={() => switchMode('admin')}
                            disabled={isSwitching}
                        >
                            <Shield className="mr-2" />    {isSwitching ? 'Switching...' : `Admin Mode ${user.active_mode === 'admin' ? '(Active)' : ''}`}
                        </button>
                    </DropdownMenuItem>
                )}
                
                {(user.role === 'admin' || user.role === 'merchant') && (
                    <DropdownMenuItem asChild>
                       <button
                           className="block w-full"
                           onClick={() => switchMode('merchant')}
                           disabled={isSwitching}
                       >
                           <Box className="mr-2" />    {isSwitching ? 'Switching...' : `Merchant Mode ${user.active_mode === 'merchant' ? '(Active)' : ''}`}
                       </button>
                    </DropdownMenuItem>
                )}
                
                {(user.role === 'admin' || user.role === 'merchant') && (
                    <>
                        <DropdownMenuItem asChild>
                            <button
                                className="block w-full"
                                onClick={() => switchMode('user')}
                                disabled={isSwitching}
                            >
                                <User2 className="mr-2" />    {isSwitching ? 'Switching...' : `User Mode ${user.active_mode === 'user' ? '(Active)' : ''}`}
                            </button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
            </DropdownMenuGroup>

            {/* Settings Section */}
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={route('profile.edit')}
                    as="button"
                    prefetch
                    onClick={cleanup}
                >
                    <Settings className="mr-2" />
                    Settings
                </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout Section */}
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}