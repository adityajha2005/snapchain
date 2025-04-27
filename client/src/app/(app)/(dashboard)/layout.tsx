"use client";

import Navbar from "@/components/layout/navbar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<SessionProvider>
			<SidebarProvider>
				<AppSidebar />
				<div className="flex relative flex-col w-full">
					<Navbar />
					<main className="w-full mt-10">{children}</main>
				</div>
			</SidebarProvider>
		</SessionProvider>
	);
}
