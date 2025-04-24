"use client";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TextEffect } from "@/components/ui/text-effect";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

// Reusable animated link component
const AnimatedLink = ({ href, text }: { href: string; text: string }) => (
	<AnimatedGroup variants={transitionVariants}>
		<Link
			href={href}
			className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
		>
			<span className="text-foreground text-sm">{text}</span>
			<span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

			<div className="bg-background group-hover:bg-muted size-6 overflow-hidden duration-500">
				<div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
					<span className="flex size-6">
						<ArrowRight className="m-auto size-3" />
					</span>
					<span className="flex size-6">
						<ArrowRight className="m-auto size-3" />
					</span>
				</div>
			</div>
		</Link>
	</AnimatedGroup>
);

// Reusable call-to-action buttons component
const CTAButtons = () => (
	<AnimatedGroup
		variants={{
			container: {
				visible: {
					transition: {
						staggerChildren: 0.05,
						delayChildren: 0.75,
					},
				},
			},
			...transitionVariants,
		}}
		className="mt-10 flex flex-col items-center justify-center gap-2 md:flex-row"
	>
		<div key={1} className="bg-foreground/10 border p-0.5">
			<Button asChild size="lg" className="rounded-none px-4 text-sm">
				<Link href="/smart-contracts">
					<span className="text-nowrap">Start Building</span>
				</Link>
			</Button>
		</div>
		<Button
			key={2}
			asChild
			size="lg"
			variant="outline"
			className="h-10 rounded-none px-4 text-sm"
		>
			<Link href="/smart-contracts">
				<span className="text-nowrap">Get Started</span>
			</Link>
		</Button>
	</AnimatedGroup>
);

// Reusable tech slider component
const TechSlider = () => (
	<div className="relative py-6 md:w-[calc(100%-11rem)]">
		<InfiniteSlider speedOnHover={20} speed={40} gap={80}>
			<TechLogo
				src="/images/tech/solana.svg"
				alt="Solana Logo"
				height={20}
				width={20}
				className="h-8"
			/>
			<TechLogo
				src="/images/tech/nextjs.svg"
				alt="Next.js Logo"
				height={16}
				width={16}
				className="h-5"
			/>
			<TechLogo
				src="/images/tech/rust.svg"
				alt="Rust Logo"
				height={16}
				width={16}
				className="h-8"
			/>
			<TechLogo
				src="/images/tech/react.svg"
				alt="React Logo"
				height={20}
				width={20}
				className="h-8"
			/>
			<TechLogo
				src="/images/tech/solana.svg"
				alt="Solana Logo"
				height={20}
				width={20}
				className="h-8"
			/>
			<TechLogo
				src="/images/tech/rust.svg"
				alt="Rust Logo"
				height={16}
				width={16}
				className="h-8"
			/>
			<TechLogo
				src="/images/tech/nextjs.svg"
				alt="Next.js Logo"
				height={28}
				width={28}
				className="h-5"
			/>
			<TechLogo
				src="/images/tech/react.svg"
				alt="Solana Logo"
				height={24}
				width={24}
				className="h-8"
			/>
		</InfiniteSlider>

		<div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
		<div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
		<ProgressiveBlur
			className="pointer-events-none absolute left-0 top-0 h-full w-20"
			direction="left"
			blurIntensity={1}
		/>
		<ProgressiveBlur
			className="pointer-events-none absolute right-0 top-0 h-full w-20"
			direction="right"
			blurIntensity={1}
		/>
	</div>
);

// Reusable tech logo component
const TechLogo = ({
	src,
	alt,
	height,
	width,
	className,
}: {
	src: string;
	alt: string;
	height: number;
	width: number;
	className: string;
}) => (
	<div className="flex">
		<Image
			className={`mx-auto w-auto dark:invert ${className}`}
			src={src}
			alt={alt}
			height={height}
			width={width}
		/>
	</div>
);

const Hero = () => {
	return (
		<>
			<section className="">
				<div className="relative pt-24 ">
					<div className="mx-auto max-w-7xl px-6">
						<div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
							<AnimatedLink
								href="#link"
								text="Build Smart Contracts Visually"
							/>

							<TextEffect
								preset="fade-in-blur"
								speedSegment={0.3}
								as="h1"
								className="mt-8 text-balance text-6xl  lg:mt-16 "
							>
								Snapy Chain: Visual Smart Contract Builder
							</TextEffect>
							<TextEffect
								per="line"
								preset="fade-in-blur"
								speedSegment={0.3}
								delay={0.5}
								as="p"
								className="mx-auto mt-6 max-w-3xl text-balance text-base"
							>
								Create powerful blockchain smart contracts by simply snapping
								blocks together. No coding required - build, test, and deploy
								with confidence.
							</TextEffect>

							<CTAButtons />
						</div>
					</div>
				</div>
			</section>
			<section className="bg-background overflow-hidden py-16 w-full  my-20">
				<div className="group relative m-auto max-w-7xl px-6">
					<div className="flex flex-col items-center md:flex-row">
						<div className="md:max-w-44 md:border-r md:pr-6">
							<p className="text-end text-sm">Powering the app by</p>
						</div>
						<TechSlider />
					</div>
				</div>
			</section>
		</>
	);
};

export default Hero;
