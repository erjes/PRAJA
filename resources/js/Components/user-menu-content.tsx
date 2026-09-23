import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/Components/ui/dropdown-menu';
import { UserInfo } from '@/Components/user-info';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    real_role?: string;
    avatar?: string;
}

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={route('profile.edit')}
                        prefetch
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                
                {user.real_role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href={route('users.toggleRole')}
                            method="post"
                            as="button"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            {user.role === 'staff' ? 'Switch to Admin' : 'Simulate Staff'}
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
