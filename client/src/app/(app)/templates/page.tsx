'use client';

import {
	ArrowLeft,
	Check,
	ChevronRight,
	Download,
	ExternalLink,
	Filter,
	Search,
	Star,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const TemplatesPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Sample templates data
	const templates = [
		{
			id: 'defi-exchange',
			title: 'DeFi Exchange',
			description:
				'A decentralized exchange template with liquidity pools and token swapping functionality',
			category: 'DeFi',
			complexity: 'Advanced',
			features: ['Token Swapping', 'Liquidity Pools', 'Staking', 'Governance'],
			popular: true,
			stars: 324,
		},
		{
			id: 'nft-marketplace',
			title: 'NFT Marketplace',
			description: 'A marketplace for buying, selling, and auctioning NFTs with royalty support',
			category: 'NFT',
			complexity: 'Intermediate',
			features: ['Minting', 'Buying/Selling', 'Auctions', 'Royalties'],
			popular: true,
			stars: 287,
		},
		{
			id: 'dao-voting',
			title: 'DAO Voting System',
			description: 'A decentralized autonomous organization with proposal and voting mechanisms',
			category: 'Governance',
			complexity: 'Intermediate',
			features: ['Proposal Creation', 'Voting', 'Token-gated Access', 'Treasury Management'],
			popular: false,
			stars: 156,
		},
		{
			id: 'ico-platform',
			title: 'ICO Platform',
			description: 'An initial coin offering platform with vesting schedules and KYC integration',
			category: 'Fundraising',
			complexity: 'Advanced',
			features: ['Token Distribution', 'Vesting', 'Whitelist', 'Analytics Dashboard'],
			popular: false,
			stars: 132,
		},
		{
			id: 'wallet-integration',
			title: 'Multi-Chain Wallet',
			description: 'Connect to multiple blockchain wallets with a unified interface',
			category: 'Infrastructure',
			complexity: 'Intermediate',
			features: ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Multi-Chain Support'],
			popular: true,
			stars: 241,
		},
		{
			id: 'game-assets',
			title: 'Blockchain Game Assets',
			description: 'Manage in-game assets as NFTs with trading and marketplace capabilities',
			category: 'Gaming',
			complexity: 'Advanced',
			features: ['NFT Assets', 'Trading', 'In-Game Integration', 'Royalties'],
			popular: false,
			stars: 198,
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

	// Display a complexity badge with appropriate color
	const ComplexityBadge = ({ level }: { level: string }) => {
		const getColor = () => {
			switch (level) {
				case 'Beginner':
					return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
				case 'Intermediate':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';
				case 'Advanced':
					return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
			}
		};

		return <span className={`text-xs px-2 py-1 rounded-full ${getColor()}`}>{level}</span>;
	};

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
				<div className='flex items-center justify-between flex-wrap gap-4'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>Template Library</h1>
						<p className='text-muted-foreground mt-1'>
							Explore pre-built templates to kickstart your blockchain projects
						</p>
					</div>
				</div>
			</div>

			{/* Search and filters */}
			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center py-3'>
				<div className='relative flex-1 max-w-md'>
					<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
						<Search className='h-4 w-4 text-muted-foreground' />
					</div>
					<input
						type='text'
						placeholder='Search templates...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors outline-none'
					/>
				</div>
				<div className='flex items-center gap-3 text-sm overflow-x-auto pb-1 w-full md:w-auto'>
					<Filter className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
					<div className='flex gap-2'>
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
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
				{filteredTemplates.map((template) => (
					<div
						key={template.id}
						className='group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20'
					>
						{/* Popular tag */}
						{template.popular && (
							<div className='absolute top-4 right-4 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium shadow-sm z-10 flex items-center gap-1'>
								<Star className='h-3 w-3 fill-current' />
								Popular
							</div>
						)}

						{/* Subtle gradient background on hover */}
						<div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

						<div className='p-6 z-10 relative'>
							<div className='flex justify-between items-start mb-4'>
								<div>
									<h3 className='font-medium text-lg group-hover:text-primary transition-colors duration-300'>
										{template.title}
									</h3>
									<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
										{template.description}
									</p>
								</div>
								<ComplexityBadge level={template.complexity} />
							</div>

							<div className='flex gap-2 mb-4'>
								<span className='inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full'>
									{template.category}
								</span>
								<span className='inline-flex items-center px-3 py-1 bg-card border border-border text-xs rounded-full'>
									<Star className='h-3 w-3 text-amber-500 mr-1 fill-current' />
									{template.stars}
								</span>
							</div>

							<div className='space-y-2'>
								<p className='text-sm font-medium'>Features:</p>
								<ul className='grid grid-cols-2 gap-2'>
									{template.features.map((feature) => (
										<li
											key={feature}
											className='flex items-center text-sm'
										>
											<Check className='h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0' />
											<span className='truncate'>{feature}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						<div className='flex border-t border-border'>
							<button className='flex-1 py-3 flex justify-center items-center gap-1 hover:bg-accent/20 transition-colors text-sm font-medium group/btn'>
								<Download className='h-4 w-4 mr-1 group-hover/btn:text-primary transition-colors' />
								Download
							</button>
							<div className='w-px bg-border' />
							<button className='flex-1 py-3 flex justify-center items-center gap-1 hover:bg-accent/20 transition-colors text-sm font-medium group/btn'>
								<ExternalLink className='h-4 w-4 mr-1 group-hover/btn:text-primary transition-colors' />
								Preview
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Empty state when no templates match */}
			{filteredTemplates.length === 0 && (
				<div className='text-center py-12 border border-border rounded-lg bg-card/50'>
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

			{/* Request custom template */}
			<div className='mt-8 p-6 bg-card border border-border rounded-lg relative overflow-hidden'>
				{/* Background gradient */}
				<div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5' />

				<div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-10'>
					<div>
						<h3 className='font-medium text-lg'>Request a Custom Template</h3>
						<p className='text-sm text-muted-foreground mt-1'>
							Can't find what you're looking for? Our team can build a custom template for your
							needs.
						</p>
					</div>
					<Link
						href='#'
						className='flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm md:w-auto w-full justify-center'
					>
						Request Custom
						<ChevronRight className='h-4 w-4' />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default TemplatesPage;
