'use client';

import { Bot, Code, FileCode, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Simple feature card component
const FeatureCard = ({
	title,
	description,
	icon: Icon,
	href,
}: {
	title: string;
	description: string;
	icon: React.ElementType;
	href: string;
}) => {
	return (
		<Link
			href={href}
			className='flex flex-col p-6 bg-card border border-border rounded-lg space-y-3'
		>
			<div className='flex items-center gap-3'>
				<div className='p-2 rounded-md bg-primary/10'>
					<Icon className='h-5 w-5 text-primary' />
				</div>
				<h3 className='font-medium'>{title}</h3>
			</div>
			<p className='text-muted-foreground text-sm'>{description}</p>
		</Link>
	);
};

const Dashboard = () => {
	return (
		<div className='container mx-auto py-8 px-4 space-y-6'>
			{/* Simple header */}
			<div className='mb-6 text-center'>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<p className='text-muted-foreground'>Manage your blockchain projects</p>
			</div>

			{/* Main features */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>Quick Actions</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<FeatureCard
						title='Smart Contracts'
						description='Build and manage smart contracts'
						icon={Code}
						href='/smart-contracts'
					/>

					<FeatureCard
						title='AI Chat'
						description='Get assistance with your projects'
						icon={Bot}
						href='/ai-chat'
					/>

					<FeatureCard
						title='Templates'
						description='Use pre-built templates'
						icon={Sparkles}
						href='/templates'
					/>
				</div>
			</div>

			{/* Recent activity - simplified */}
			<div className='border border-border rounded-lg'>
				<div className='px-4 py-3 border-b border-border'>
					<h2 className='font-medium'>Recent Activity</h2>
				</div>
				<div className='p-4 text-center text-muted-foreground'>
					No recent activity. Start by creating a project.
				</div>
				<div className='px-4 py-3 border-t border-border'>
					<Link
						href='/smart-contracts'
						className='text-sm text-primary hover:underline'
					>
						Create a project
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
