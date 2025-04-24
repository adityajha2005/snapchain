'use client';

import { Code, FileCode, PlusCircle, Zap } from 'lucide-react';
import { useState } from 'react';

const SmartContractsPage = () => {
	const [showCreateForm, setShowCreateForm] = useState(false);

	return (
		<div className='container mx-auto py-10 px-4 md:px-6 lg:px-8 space-y-8'>
			{/* Header */}
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Smart Contracts</h1>
					<p className='text-muted-foreground mt-1'>Create and deploy blockchain smart contracts</p>
				</div>
				{!showCreateForm && (
					<button
						onClick={() => setShowCreateForm(true)}
						className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium md:w-auto w-full justify-center'
					>
						<PlusCircle className='h-4 w-4' />
						Create Contract
					</button>
				)}
			</div>

			{showCreateForm ? (
				<div className='mt-6 p-6 bg-card border border-border rounded-lg animate-in fade-in-50 duration-300'>
					<h2 className='text-xl font-semibold mb-6 pb-4 border-b border-border'>
						Create Smart Contract
					</h2>

					<div className='space-y-6 max-w-2xl'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div>
								<label className='block text-sm font-medium mb-2'>Contract Name</label>
								<input
									type='text'
									className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
									placeholder='MyToken'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Network</label>
								<select className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'>
									<option>Ethereum</option>
									<option>Polygon</option>
									<option>Arbitrum</option>
									<option>Optimism</option>
								</select>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>Description</label>
							<textarea
								className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
								rows={3}
								placeholder='Describe your smart contract functionality'
							/>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-accent/10 rounded-lg border border-accent/20'>
							<div>
								<label className='block text-sm font-medium mb-2'>Token Symbol</label>
								<input
									type='text'
									className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
									placeholder='TKN'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Total Supply</label>
								<input
									type='number'
									className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
									placeholder='1000000'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Decimals</label>
								<input
									type='number'
									className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
									placeholder='18'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Access Control</label>
								<select className='w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'>
									<option>Ownable</option>
									<option>Role-based</option>
								</select>
							</div>
						</div>

						<div className='flex justify-end gap-3 pt-4'>
							<button
								onClick={() => setShowCreateForm(false)}
								className='px-4 py-2 border border-border rounded-md hover:bg-accent/20 transition-colors'
							>
								Cancel
							</button>
							<button className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm'>
								<Zap className='h-4 w-4' />
								Create Contract
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className='mt-6 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 to-transparent'>
					<div className='px-6 py-5 border-b border-border bg-card/50'>
						<h2 className='text-xl font-semibold'>My Contracts</h2>
					</div>
					<div className='bg-card/50 p-10 flex flex-col items-center justify-center text-center'>
						<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5'>
							<Code className='h-7 w-7 text-primary' />
						</div>
						<h3 className='text-lg font-medium mb-2'>No contracts yet</h3>
						<p className='text-muted-foreground text-sm max-w-sm mb-6'>
							Start by creating your first smart contract with our simple interface.
						</p>
						<button
							onClick={() => setShowCreateForm(true)}
							className='flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-md'
						>
							<FileCode className='h-4 w-4' />
							Create Your First Contract
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SmartContractsPage;
