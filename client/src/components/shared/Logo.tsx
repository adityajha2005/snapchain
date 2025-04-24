import * as React from "react";
import { SVGProps } from "react";
import Link from "next/link";

interface LogoProps extends SVGProps<SVGSVGElement> {
	href?: string;
	iconOnly?: boolean;
	textClassName?: string;
}

const Logo = ({
	href = "/",
	iconOnly = false,
	textClassName,
	...props
}: LogoProps) => {
	const logoContent = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={64}
			height={64}
			className="text-emerald-900 size-6"
			viewBox="10 10.026 80 79.947"
			{...props}
		>
			<path d="M37.062 10.077c-6.51-.76-12.471 7.218-8.956 12.917 3.831 2.659 6.64 9.497 1.579 12.536-5.362 3.04-12.572-1.52-17.322 3.42-3.813 4.178-1.764 10.256-2.17 15.575-.083 9.877-.3 19.754.17 29.632 1.2 4.938 6.78 5.698 11.002 5.698 3.708.38 8.023 0 10.228-3.419 2.88-4.938-3.396-7.978-4.556-11.777-2.042-6.078 4.063-12.156 9.941-11.776 5.71 0 11.398 6.078 9.453 11.776-2.086 3.8-7.607 7.598-4.221 12.157 3.814 4.179 9.946 3.04 14.88 2.66 5.197-1.14 7.416-6.839 6.045-11.778-.338-3.799.873-9.497 5.482-10.257 5.143-.38 7.658 6.838 13.08 5.699 6.51-.76 10.287-8.738 7.221-14.436-1.861-4.18-7.446-7.598-11.716-4.939-3.126 3.04-8.194 7.598-12.073 3.04-4.414-5.32.748-12.917-4.034-18.236-4.92-4.938-12.765.38-17.863-3.799-3.689-3.039-1.03-7.977 1.508-10.637 4.528-4.179 1.413-11.777-3.882-13.676-1.212-.38-2.52-.38-3.796-.38z" />
		</svg>
	);

	if (href) {
		return (
			<Link href={href} className="flex items-center">
				{logoContent}
				{!iconOnly && (
					<span
						className={`ml-2 font-medium text-xl translate-y-0.5 bg-gradient-to-r from-emerald-900 to-black text-transparent bg-clip-text ${textClassName}  `}
					>
						SnapChain
					</span>
				)}
			</Link>
		);
	}

	return logoContent;
};

export default Logo;
