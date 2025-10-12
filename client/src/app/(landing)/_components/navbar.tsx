"use client";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="flex items-center justify-between p-2 py-0 border-b border-border fixed top-0 left-0 right-0 z-50 bg-background w-full">
			<div className="flex items-center justify-center w-32 sm:w-44">
				<Logo />
			</div>
			<div className="hidden sm:flex items-center opacity-50 gap-2 flex-1 border-x border-border h-14 w-full bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_5px)] mx-2"></div>

			{/* Desktop navigation */}
			<div className="hidden sm:flex items-center gap-2 w-32 sm:w-44 justify-center">
				<Button className="rounded-none text-sm  ring-2 ring-black/20 hover:ring-black/30">
					<Link href="/smart-contracts">Launch App</Link>
				</Button>
			</div>

			{/* Mobile menu button */}
			<div className="flex sm:hidden">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
				>
					{mobileMenuOpen ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="sm:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-2 w-full">
					<Button className="rounded-none w-full">
						<Link href="/smart-contracts">Launch App</Link>
					</Button>
				</div>
			)}
		</div>
	);
};
export default Navbar;
