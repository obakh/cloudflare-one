"use client";

import { cn } from "@repo/ui";
import { ArrowUpRight } from "lucide-react";

interface CtaLinkProps {
	text: string;
	href?: string;
	className?: string;
}

export function CtaLink({ text, href = "#", className }: CtaLinkProps) {
	return (
		<a
			href={href}
			className={cn(
				"font-medium text-sm flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden xl:flex",
				className,
			)}
		>
			<span>{text}</span>
			<ArrowUpRight size={16} />
		</a>
	);
}
