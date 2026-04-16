"use client";

import { Card, CardContent } from "@repo/ui";

interface BlogCardProps {
	href: string;
	image: string;
	title: string;
	date: string;
	description?: string;
	featured?: boolean;
}

export function BlogCard({ href, image, title, date, description, featured }: BlogCardProps) {
	return (
		<a href={href} className="group block h-full">
			<Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
				<img
					src={image}
					alt=""
					className={`w-full object-cover ${featured ? "h-64 md:h-80" : "h-48"}`}
				/>
				<CardContent className={featured ? "p-6" : "p-4"}>
					<p className="text-sm text-muted-foreground mb-2">{date}</p>
					<h3
						className={`font-semibold text-foreground group-hover:text-primary transition-colors ${featured ? "text-2xl mb-2" : ""}`}
					>
						{title}
					</h3>
					{description && <p className="text-muted-foreground">{description}</p>}
				</CardContent>
			</Card>
		</a>
	);
}
