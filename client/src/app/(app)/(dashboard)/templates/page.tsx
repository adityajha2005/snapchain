'use client';

import { Download, Filter, Search } from 'lucide-react';
import { useState } from 'react';

// Define interface for template data
interface Template {
	id: string;
	title: string;
	description: string;
	category: string;
	image: string;
}

const TemplatesPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Sample templates data
	const templates: Template[] = [
		{
			id: 'defi-exchange',
			title: 'DeFi Exchange',
			description:
				'A decentralized exchange template with liquidity pools and token swapping functionality',
			category: 'DeFi',
			image: '/images/templates/defi-exchange.jpg',
		},
		{
			id: 'nft-marketplace',
			title: 'NFT Marketplace',
			description: 'A marketplace for buying, selling, and auctioning NFTs with royalty support',
			category: 'NFT',
			image: '/images/templates/nft-marketplace.jpg',
		},
		{
			id: 'dao-voting',
			title: 'DAO Voting System',
			description: 'A decentralized autonomous organization with proposal and voting mechanisms',
			category: 'Governance',
			image: '/images/templates/dao-voting.jpg',
		},
		{
			id: 'ico-platform',
			title: 'ICO Platform',
			description: 'An initial coin offering platform with vesting schedules and KYC integration',
			category: 'Fundraising',
			image: '/images/templates/ico-platform.jpg',
		},
		{
			id: 'wallet-integration',
			title: 'Multi-Chain Wallet',
			description: 'Connect to multiple blockchain wallets with a unified interface',
			category: 'Infrastructure',
			image: '/images/templates/wallet.jpg',
		},
		{
			id: 'game-assets',
			title: 'Blockchain Game Assets',
			description: 'Manage in-game assets as NFTs with trading and marketplace capabilities',
			category: 'Gaming',
			image: '/images/templates/game-assets.jpg',
		},
	];

	// Get unique categories
	const categories = Array.from(new Set(templates.map((t) => t.category)));

	// Filter templates by search and category
	const filteredTemplates = templates.filter((template) => {
		const matchesSearch =
			searchQuery === '' ||
			template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.category.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesCategory = selectedCategory === null || template.category === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Filter button component
	const FilterButton = ({ category }: { category: string }) => (
		<button
			onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
			className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
				selectedCategory === category
					? 'bg-primary text-primary-foreground'
					: 'bg-card border border-border hover:bg-accent/20'
			}`}
		>
			{category}
		</button>
	);

	return (
		<div className='container mx-auto py-8 space-y-8 px-5'>
			{/* Header with breadcrumb */}
			<div className='flex flex-col space-y-2'>
				
				<div className='flex items-center justify-between flex-wrap gap-4'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Template Library</h1>
						<p className='text-muted-foreground mt-1.5'>
							Explore pre-built templates to kickstart your blockchain projects
						</p>
					</div>
				</div>
			</div>

			{/* Search and filters */}
			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center py-3 bg-card/50 rounded-lg p-4 border border-border/50'>
				<div className='relative flex-1 max-w-md'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Search className='h-4 w-4 text-muted-foreground' />
					</div>
					<input
						type='text'
						placeholder='Search templates...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
					/>
				</div>
				<div className='flex items-center gap-3 text-sm overflow-x-auto pb-1 w-full md:w-auto'>
					<div className='flex items-center gap-1.5 text-muted-foreground font-medium'>
						<Filter className='h-3.5 w-3.5 flex-shrink-0' />
						Filter:
					</div>
					<div className='flex gap-2 flex-wrap'>
						{categories.map((category) => (
							<FilterButton
								key={category}
								category={category}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Templates grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
				{filteredTemplates.map((template) => (
					<TemplateCard
						key={template.id}
						template={template}
					/>
				))}
			</div>

			{/* Empty state when no templates match */}
			{filteredTemplates.length === 0 && (
				<div className='text-center py-12 border border-border rounded-lg bg-card/50 mt-4'>
					<div className='mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
						<Search className='h-7 w-7 text-primary' />
					</div>
					<h3 className='text-lg font-medium mb-1'>No templates found</h3>
					<p className='text-muted-foreground text-sm max-w-md mx-auto'>
						No templates match your current search criteria. Try changing your filters or search
						term.
					</p>
					<button
						onClick={() => {
							setSearchQuery('');
							setSelectedCategory(null);
						}}
						className='mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
					>
						Clear Filters
					</button>
				</div>
			)}
		</div>
	);
};

// Template card component to display each template
const TemplateCard = ({ template }: { template: Template }) => {
	return (
		<div className='bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30'>
			{/* Card content */}
			<div className='p-6 space-y-4'>
				<div>
					<h3 className='font-medium text-lg'>{template.title}</h3>
					<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
						{template.description}
					</p>
				</div>

				<div className='flex gap-2'>
					<span className='inline-block px-3 py-1 bg-secondary/70 text-secondary-foreground text-xs rounded-full'>
						{template.category}
					</span>
				</div>
			</div>

			{/* Card actions */}
			<div className='border-t border-border'>
				<button className='w-full py-3 flex justify-center items-center gap-1 hover:bg-accent/20 transition-colors text-sm font-medium'>
					<Download className='h-4 w-4 mr-1' />
					Download
				</button>
			</div>
		</div>
	);
};

export default TemplatesPage;
