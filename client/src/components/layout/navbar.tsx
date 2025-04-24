'use client';
import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { items } from './sidebar/app-sidebar';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

const Navbar: FC = () => {
	const pathname = usePathname();
	const currentItem = items.find((item) => item.url === pathname);

	// Mock state for UI demonstration
	const isConnected = false;
	const mockAddress = '0x1234...5678';

	const handleConnectWallet = () => {
		// This will be implemented later with actual wallet connection logic
		console.log('Connect wallet clicked');
	};

	return (
		<nav className='w-[calc(100%-13rem)]  px-6 flex items-center justify-between border-b border-border bg-sidebar py-2.5 fixed z-50'>
			<div className='flex items-center justify-between w-full'>
				<div className='flex items-center gap-2 py-1'>
					{currentItem && <currentItem.icon className='size-4' />}
					<h1 className='font-medium text-sm '>{currentItem?.title || 'SnapChain'}</h1>
				</div>
				<div>
					
					{isConnected ? (
						<Button
							variant='outline'
							size='sm'
							className='rounded-none'
						>
							<Wallet className="mr-2 h-4 w-4" />
							{mockAddress}
						</Button>
					) : (
						<Button
							size='sm'
							className='rounded-none'
							onClick={handleConnectWallet}
						>
							<Wallet className="mr-2 h-4 w-4" />
							Connect Wallet
						</Button>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
