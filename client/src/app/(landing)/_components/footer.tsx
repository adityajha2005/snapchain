import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
	return (
		<footer className="w-full bg-zinc-900 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-12">
				{/* Top section with logo and social links */}
				<div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-zinc-800 pb-8">
					<div className="mb-6 md:mb-0">
						<Logo
							href="/"
							className="text-white invert size-8"
							textClassName="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-white"
						/>
					</div>

					<div className="flex space-x-6">
						<SocialLink
							href="https://github.com"
							icon={<Github size={20} />}
							label="GitHub"
						/>
						<SocialLink
							href="https://twitter.com"
							icon={<Twitter size={20} />}
							label="Twitter"
						/>
						<SocialLink
							href="https://linkedin.com"
							icon={<Linkedin size={20} />}
							label="LinkedIn"
						/>
						<SocialLink
							href="mailto:contact@snapchain.com"
							icon={<Mail size={20} />}
							label="Email"
						/>
					</div>
				</div>

				{/* Middle section with links */}
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
					<div>
						<h3 className="text-lg font-medium mb-4">Product</h3>
						<ul className="space-y-2">
							<FooterLink href="/features">Features</FooterLink>
							<FooterLink href="/pricing">Pricing</FooterLink>
							<FooterLink href="/documentation">Documentation</FooterLink>
							<FooterLink href="/changelog">Changelog</FooterLink>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-medium mb-4">Resources</h3>
						<ul className="space-y-2">
							<FooterLink href="/blog">Blog</FooterLink>
							<FooterLink href="/tutorials">Tutorials</FooterLink>
							<FooterLink href="/support">Support</FooterLink>
							<FooterLink href="/status">Status</FooterLink>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-medium mb-4">Company</h3>
						<ul className="space-y-2">
							<FooterLink href="/about">About</FooterLink>
							<FooterLink href="/careers">Careers</FooterLink>
							<FooterLink href="/contact">Contact</FooterLink>
							<FooterLink href="/partners">Partners</FooterLink>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-medium mb-4">Legal</h3>
						<ul className="space-y-2">
							<FooterLink href="/privacy">Privacy Policy</FooterLink>
							<FooterLink href="/terms">Terms of Service</FooterLink>
							<FooterLink href="/cookies">Cookie Policy</FooterLink>
						</ul>
					</div>
				</div>

				{/* Bottom section with copyright */}
				<div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center">
					<p className="text-zinc-400 text-sm mb-4 md:mb-0">
						© {new Date().getFullYear()} SnapChain. All rights reserved.
					</p>
					<div className="flex space-x-6">
						<FooterLink href="/privacy" className="text-sm text-zinc-400">
							Privacy
						</FooterLink>
						<FooterLink href="/terms" className="text-sm text-zinc-400">
							Terms
						</FooterLink>
						<FooterLink href="/cookies" className="text-sm text-zinc-400">
							Cookies
						</FooterLink>
					</div>
				</div>
			</div>
		</footer>
	);
};

// Helper components
const SocialLink = ({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) => (
	<Link
		href={href}
		className="text-zinc-400 hover:text-white transition-colors"
		aria-label={label}
		target="_blank"
		rel="noopener noreferrer"
	>
		{icon}
	</Link>
);

const FooterLink = ({
	href,
	children,
	className = "",
}: {
	href: string;
	children: React.ReactNode;
	className?: string;
}) => (
	<li>
		<Link
			href={href}
			className={`text-zinc-400 hover:text-white transition-colors ${className}`}
		>
			{children}
		</Link>
	</li>
);

export default Footer;
