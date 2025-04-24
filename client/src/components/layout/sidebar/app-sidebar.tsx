'use client';

import { Bot, FileCode, Plus, Settings, Sparkles } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Logo from '@/components/shared/Logo';

// Menu items.
export const items = [
	{
		title: 'Smart Contracts',
		url: '/smart-contracts',
		icon: FileCode,
	},
	{
		title: 'AI Chat',
		url: '/ai-chat',
		icon: Bot,
	},
	{
		title: 'Templates',
		url: '/templates',
		icon: Sparkles,
	},
	{
		title: 'Settings',
		url: '#',
		icon: Settings,
	},
];

export function AppSidebar() {
	const { state } = useSidebar();
	const pathname = usePathname();

	return (
		<Sidebar collapsible='icon'>
			<SidebarContent>
				<div className='flex items-center px-4 py-2.5 mb-2 border-b border-border justify-center'>
					<Logo className='h-6 w-6 text-primary' />
				</div>
				<div className='px-2'>
					<button className='w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2 font-medium text-sm'>
						<Plus className='h-4 w-4' />
						{state === 'expanded' && <span>Create</span>}
					</button>
				</div>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem
									key={item.title}
									className={
										pathname === item.url
											? 'bg-background	 border rounded-md border-sidebar-border '
											: ''
									}
								>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
