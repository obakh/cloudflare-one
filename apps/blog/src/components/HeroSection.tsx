"use client";

import { Button } from "@repo/ui";

interface HeroSectionProps {
	title: string;
	description: string;
}

export function HeroSection({ title, description }: HeroSectionProps) {
	return (
		<section className="max-w-4xl mx-auto px-4 py-16 text-center">
			<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
			<p
				className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: safe static content
				dangerouslySetInnerHTML={{ __html: description }}
			/>
			<div className="flex gap-4 justify-center">
				<Button asChild>
					<a href="/blog">Read Blog</a>
				</Button>
				<Button variant="outline" asChild>
					<a href="/about">About Me</a>
				</Button>
			</div>
		</section>
	);
}
