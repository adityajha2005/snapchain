'use client';
import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { items } from './sidebar/app-sidebar';
import UserDropdown from '@/components/shared/UserDropdown';
import { useSession } from 'next-auth/react';

const Navbar: FC = () => {
	const pathname = usePathname();
	const currentItem = items.find((item) => item.url === pathname);
	const { data: session } = useSession();

	return (
		<nav className='w-[calc(100%-13rem)]  px-6 flex items-center justify-between border-b border-border bg-sidebar py-2.5 fixed z-50 h-13'>
			<div className='flex items-center justify-between w-full pr-10'>
				<div className='flex items-center gap-2 py-1'>
					{currentItem && <currentItem.icon className='size-4' />}
					<h1 className='font-medium text-sm '>{currentItem?.title || 'SnapChain'}</h1>
				</div>
				<div>
					<UserDropdown user={session?.user} />
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
