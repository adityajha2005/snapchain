'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserIcon, LogOut, UserCircle } from 'lucide-react';

interface UserDropdownProps {
	user?: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
}

const UserDropdown: FC<UserDropdownProps> = ({ user }) => {
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut({ redirect: true, callbackUrl: '/' });
	};

	const handleProfileClick = () => {
		router.push('/profile');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='outline'
					className='h-auto p-0.5 hover:bg-transparent cursor-pointer flex items-center gap-1'
				>
					<Avatar className='h-8 w-8'>
						{user?.image ? (
							<AvatarImage
								src={user.image}
								alt={user?.name || 'User'}
							/>
						) : (
							<AvatarFallback>
								<UserIcon className='h-4 w-4' />
							</AvatarFallback>
						)}
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56 -translate-x-2'
				side='bottom'
				align='center'
			>
				<DropdownMenuLabel className='flex min-w-0 flex-col'>
					<span className='text-foreground truncate text-sm font-medium'>
						{user?.name || 'User'}
					</span>
					<span className='text-muted-foreground truncate text-xs font-normal'>
						{user?.email || 'No email'}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={handleProfileClick}>
						<UserCircle
							size={16}
							className='opacity-60'
							aria-hidden='true'
						/>
						<span>Profile</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut}>
					<LogOut
						size={16}
						className='opacity-60'
						aria-hidden='true'
					/>
					<span>Logout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserDropdown;
