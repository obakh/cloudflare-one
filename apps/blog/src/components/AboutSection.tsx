"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";

export function AboutSection() {
	return (
		<section className="max-w-3xl mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold text-foreground mb-8">About Me</h1>

			<div className="prose">
				<p className="text-lg text-muted-foreground mb-6">
					This is the about page. Write something about yourself here.
				</p>

				<p className="text-muted-foreground mb-6">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua. Vitae ultricies leo integer malesuada nunc vel risus
					commodo viverra.
				</p>

				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Get in Touch</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Feel free to reach out if you have any questions or just want to say hello.
						</p>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
