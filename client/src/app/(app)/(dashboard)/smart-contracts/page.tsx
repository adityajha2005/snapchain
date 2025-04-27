import SmartContracts from '@/components/icons/smartContracts';
import {  PlusCircle } from 'lucide-react';
import Link from 'next/link';

const SmartContractsPage = () => {
	return (
		<div className='container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8'>
			{/* Header */}
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Smart Contracts</h1>
					<p className='text-muted-foreground mt-1'>Create and deploy blockchain smart contracts</p>
				</div>
				<Link
					href='/project'
					className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium md:w-auto w-full justify-center'
				>
					<PlusCircle className='h-4 w-4' />
					Create Contract
				</Link>
			</div>

			<div className='mt-6 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 to-transparent'>
				<div className='px-6 py-5 border-b border-border bg-card/50'>
					<h2 className='text-xl font-semibold'>My Contracts</h2>
				</div>
				<div className='bg-card/50 p-10 flex flex-col items-center justify-center text-center'>
					<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5'>
						<SmartContracts className='h-7 w-7 text-primary' />
					</div>
					<h3 className='text-lg font-medium mb-2'>No contracts yet</h3>
					<p className='text-muted-foreground text-sm max-w-sm mb-6'>
						Start by creating your first smart contract with our simple interface.
					</p>
					<Link
						href='/project'
						className='flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-md'
					>
							Create Your First Contract
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SmartContractsPage;
