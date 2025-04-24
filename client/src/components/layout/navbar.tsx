"use client";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { items } from "./sidebar/app-sidebar";

const Navbar: FC = () => {
	const pathname = usePathname();
	const currentItem = items.find((item) => item.url === pathname);

	return (
		<nav className="w-full px-6 flex items-center justify-between border-b border-border bg-sidebar py-2.5 fixed  z-50">
			<div className="flex items-center gap-2 py-1">
				{currentItem && <currentItem.icon className="size-4" />}
				<h1 className="font-medium text-sm ">
					{currentItem?.title || "SnapChain"}
				</h1>
			</div>
		</nav>
	);
};

export default Navbar;
