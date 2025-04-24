'use client';

import { ArrowLeft, ChevronRight, Clock, Code, FileCode, PlusCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const SmartContractsPage = () => {
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

	// Sample contract templates
	const contractTemplates = [
		{
			id: 'erc20',
			name: 'ERC-20 Token',
			description: 'Standard fungible token contract',
			complexity: 'Beginner',
			timeEstimate: '~5 min',
		},
		{
			id: 'nft',
			name: 'NFT Collection (ERC-721)',
			description: 'Non-fungible token collection',
			complexity: 'Intermediate',
			timeEstimate: '~10 min',
		},
		{
			id: 'dao',
			name: 'DAO Governance',
			description: 'Decentralized autonomous organization',
			complexity: 'Advanced',
			timeEstimate: '~15 min',
		},
		{
			id: 'marketplace',
			name: 'NFT Marketplace',
			description: 'Platform for buying and selling NFTs',
			complexity: 'Advanced',
			timeEstimate: '~20 min',
		},
	];

	// Get template complexity badge color
	const getComplexityColor = (complexity: string) => {
		switch (complexity) {
			case 'Beginner':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
			case 'Intermediate':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
			case 'Advanced':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	};

	return (
		<div className='container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-6'>
			{/* Header with breadcrumb */}
			<div className='flex flex-col space-y-1.5 mb-6'>
				<Link
					href='/dashboard'
					className='flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit'
				>
					<ArrowLeft className='h-3.5 w-3.5 mr-1' />
					Back to Dashboard
				</Link>
				<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Smart Contracts</h1>
						<p className='text-muted-foreground mt-1'>
							Create, deploy and manage your smart contracts
						</p>
					</div>
					{!selectedTemplate && (
						<button
							onClick={() => setSelectedTemplate('custom')}
							className='flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium md:w-auto w-full justify-center'
						>
							<PlusCircle className='h-4 w-4' />
							Create Custom Contract
						</button>
					)}
				</div>
			</div>

			{!selectedTemplate ? (
				<>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6'>
						{contractTemplates.map((template) => (
							<button
								key={template.id}
								onClick={() => setSelectedTemplate(template.id)}
								className='group flex items-start gap-4 p-6 bg-card hover:bg-accent/10 border border-border rounded-lg transition-all duration-300 text-left relative overflow-hidden'
							>
								{/* Subtle gradient hover effect */}
								<div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

								<div className='p-3 rounded-md bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors duration-300'>
									<FileCode className='h-5 w-5 text-primary' />
								</div>

								<div className='flex-1 z-10'>
									<div className='flex flex-wrap items-start justify-between gap-2 mb-2'>
										<h3 className='font-medium text-lg group-hover:text-primary transition-colors duration-300'>
											{template.name}
										</h3>
										<span
											className={`text-xs px-2 py-0.5 rounded-full ${getComplexityColor(
												template.complexity
											)}`}
										>
											{template.complexity}
										</span>
									</div>
									<p className='text-muted-foreground text-sm mb-3'>{template.description}</p>
									<div className='flex items-center text-xs text-muted-foreground'>
										<Clock className='h-3.5 w-3.5 mr-1.5' />
										<span>{template.timeEstimate}</span>
										<span className='mx-2'>•</span>
										<Zap className='h-3.5 w-3.5 mr-1.5' />
										<span>One-click deploy</span>
									</div>
								</div>

								<ChevronRight className='h-5 w-5 text-muted-foreground self-center group-hover:text-primary group-hover:translate-x-1 transition-all duration-300' />
							</button>
						))}
					</div>
				</>
			) : (
				<div className='mt-6 p-6 bg-card border border-border rounded-lg animate-in fade-in-50 duration-300'>
					<h2 className='text-xl font-semibold mb-6 pb-4 border-b border-border'>
						{selectedTemplate === 'custom'
							? 'Create Custom Contract'
							: `Configure ${contractTemplates.find((t) => t.id === selectedTemplate)?.name}`}
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

						{selectedTemplate === 'erc20' && (
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
						)}

						<div className='flex justify-end gap-3 pt-4'>
							<button
								onClick={() => setSelectedTemplate(null)}
								className='px-4 py-2 border border-border rounded-md hover:bg-accent/20 transition-colors'
							>
								Cancel
							</button>
							<button className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm'>
								Create Contract
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='mt-8 rounded-xl overflow-hidden border border-border'>
				<div className='px-6 py-5 border-b border-border bg-card'>
					<h2 className='text-xl font-semibold'>My Contracts</h2>
				</div>
				<div className='bg-card/50 p-10 flex flex-col items-center justify-center text-center'>
					<div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Code className='h-7 w-7 text-primary' />
					</div>
					<h3 className='text-lg font-medium mb-1'>No contracts yet</h3>
					<p className='text-muted-foreground text-sm max-w-md'>
						Select a template to create your first smart contract or build a custom one from
						scratch.
					</p>
				</div>
			</div>
		</div>
	);
};

export default SmartContractsPage;
