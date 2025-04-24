import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield, Zap, Coins } from "lucide-react";
import { ReactNode } from "react";

// Feature card component
interface FeatureCardProps {
	icon: ReactNode;
	title: string;
	description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
	<div className="group shadow-zinc-950/5 p-5">
		<CardHeader className="pb-3">
			<CardDecorator>{icon}</CardDecorator>
			<h3 className="mt-6 font-medium">{title}</h3>
		</CardHeader>
		<CardContent className="text-sm p-0 pb-6">
			<p className="text-sm ">{description}</p>
		</CardContent>
	</div>
);

// Card decorator component
const CardDecorator = ({ children }: { children: ReactNode }) => (
	<div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
		<div
			aria-hidden
			className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
		/>
		<div
			aria-hidden
			className="bg-radial to-background absolute inset-0 from-transparent to-75%"
		/>
		<div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
			{children}
		</div>
	</div>
);

export default function Features() {
	const features = [
		{
			icon: <Zap className="size-6" aria-hidden />,
			title: "Lightning Fast",
			description:
				"Experience blazing-fast transactions on Solana with SnapChain's optimized infrastructure and minimal latency.",
		},
		{
			icon: <Shield className="size-6" aria-hidden />,
			title: "Secure by Design",
			description:
				"Built with security-first principles, SnapChain ensures your assets and data remain protected through advanced cryptographic methods.",
		},
		{
			icon: <Coins className="size-6" aria-hidden />,
			title: "Low Transaction Fees",
			description:
				"Benefit from Solana's cost-effective ecosystem with SnapChain's optimized smart contracts that minimize gas costs.",
		},
	];

	return (
		<section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent w-full border-y border-border">
			<div className="@container mx-auto max-w-5xl px-6">
				<div className="text-center">
					<h2 className="text-balance text-4xl font-medium lg:text-5xl">
						Built for the Solana ecosystem
					</h2>
					<p className="mt-4">
						SnapChain delivers the speed, security, and scalability you need for
						next-generation blockchain applications.
					</p>
				</div>
				<Card className="@min-4xl:max-w-full rounded-none p-0 @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
					{features.map((feature, index) => (
						<FeatureCard
							key={index}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</Card>
			</div>
		</section>
	);
}
