'use client';

import { ExternalLink, Filter, Search } from 'lucide-react';
import { useState } from 'react';

// Define interface for template data
interface Template {
	id: string;
	title: string;
	description: string;
	category: string;
	githubUrl: string;
	auditStatus: string;
	author: string;
}

const TemplatesPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Real pre-audited Solana smart contracts
	const templates: Template[] = [
		{
			id: 'spl-token',
			title: 'SPL Token Program',
			description:
				'Official Solana Program Library token program - the standard for creating and managing tokens on Solana',
			category: 'DeFi',
			githubUrl: 'https://github.com/solana-labs/solana-program-library/tree/master/token/program',
			auditStatus: 'Audited by Solana Labs',
			author: 'Solana Labs',
		},
		{
			id: 'metaplex-token-metadata',
			title: 'Metaplex Token Metadata',
			description: 'NFT standard for Solana - attach metadata to tokens, create NFT collections, and manage digital assets',
			category: 'NFT',
			githubUrl: 'https://github.com/metaplex-foundation/mpl-token-metadata',
			auditStatus: 'Audited by Kudelski Security',
			author: 'Metaplex Foundation',
		},
		{
			id: 'governance',
			title: 'SPL Governance Program',
			description: 'Decentralized governance with proposal creation, voting, and on-chain execution for DAOs',
			category: 'Governance',
			githubUrl: 'https://github.com/solana-labs/solana-program-library/tree/master/governance/program',
			auditStatus: 'Audited by Solana Labs',
			author: 'Solana Labs',
		},
		{
			id: 'serum-dex',
			title: 'Serum DEX',
			description: 'Decentralized exchange protocol with on-chain orderbook and matching engine',
			category: 'DeFi',
			githubUrl: 'https://github.com/project-serum/serum-dex',
			auditStatus: 'Multiple audits',
			author: 'Project Serum',
		},
		{
			id: 'stake-pool',
			title: 'SPL Stake Pool',
			description: 'Liquid staking protocol allowing users to stake SOL and receive pool tokens',
			category: 'DeFi',
			githubUrl: 'https://github.com/solana-labs/solana-program-library/tree/master/stake-pool/program',
			auditStatus: 'Audited by Solana Labs',
			author: 'Solana Labs',
		},
		{
			id: 'metaplex-auction',
			title: 'Metaplex Auction House',
			description: 'Decentralized NFT marketplace protocol with auction and fixed-price sale support',
			category: 'NFT',
			githubUrl: 'https://github.com/metaplex-foundation/mpl-auction-house',
			auditStatus: 'Audited',
			author: 'Metaplex Foundation',
		},
		{
			id: 'spl-memo',
			title: 'SPL Memo Program',
			description: 'Simple program to attach memo strings to transactions for record-keeping',
			category: 'Infrastructure',
			githubUrl: 'https://github.com/solana-labs/solana-program-library/tree/master/memo/program',
			auditStatus: 'Audited by Solana Labs',
			author: 'Solana Labs',
		},
		{
			id: 'pyth-oracle',
			title: 'Pyth Oracle Program',
			description: 'High-fidelity price oracle providing real-time market data for DeFi applications',
			category: 'Infrastructure',
			githubUrl: 'https://github.com/pyth-network/pyth-client',
			auditStatus: 'Multiple audits',
			author: 'Pyth Network',
		},
		{
			id: 'switchboard-oracle',
			title: 'Switchboard Oracle',
			description: 'Decentralized oracle network for fetching and verifying off-chain data',
			category: 'Infrastructure',
			githubUrl: 'https://github.com/switchboard-xyz/sbv2-solana',
			auditStatus: 'Audited',
			author: 'Switchboard',
		},
		{
			id: 'candy-machine',
			title: 'Metaplex Candy Machine',
			description: 'NFT minting and distribution program for fair launches and collections',
			category: 'NFT',
			githubUrl: 'https://github.com/metaplex-foundation/mpl-candy-machine',
			auditStatus: 'Audited',
			author: 'Metaplex Foundation',
		},
		{
			id: 'lending-protocol',
			title: 'Solend Protocol',
			description: 'Algorithmic, decentralized lending and borrowing protocol on Solana',
			category: 'DeFi',
			githubUrl: 'https://github.com/solendprotocol/solana-program-library',
			auditStatus: 'Audited by Kudelski',
			author: 'Solend',
		},
		{
			id: 'name-service',
			title: 'Solana Name Service',
			description: 'Domain name system for Solana - human-readable names for wallet addresses',
			category: 'Infrastructure',
			githubUrl: 'https://github.com/Bonfida/solana-name-service',
			auditStatus: 'Audited',
			author: 'Bonfida',
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
	const handleViewContract = () => {
		// Open the GitHub URL in a new tab
		window.open(template.githubUrl, '_blank', 'noopener,noreferrer');
	};

	return (
		<div className='bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30'>
			{/* Card content */}
			<div className='p-6 space-y-4'>
				<div>
					<div className='flex items-start justify-between mb-2'>
						<h3 className='font-medium text-lg'>{template.title}</h3>
						<span className='text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
							✓ Audited
						</span>
					</div>
					<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
						{template.description}
					</p>
				</div>

				<div className='flex flex-wrap gap-2'>
					<span className='inline-block px-3 py-1 bg-secondary/70 text-secondary-foreground text-xs rounded-full'>
						{template.category}
					</span>
					<span className='inline-block px-3 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full border border-blue-500/20'>
						{template.author}
					</span>
				</div>

				<div className='text-xs text-muted-foreground pt-2 border-t border-border'>
					{template.auditStatus}
				</div>
			</div>

			{/* Card actions */}
			<div className='border-t border-border'>
				<button 
					onClick={handleViewContract}
					className='w-full py-3 flex justify-center items-center gap-2 hover:bg-accent/20 transition-colors text-sm font-medium text-primary'
				>
					<ExternalLink className='h-4 w-4' />
					View Contract
				</button>
			</div>
		</div>
	);
};

export default TemplatesPage;
