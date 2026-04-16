import { Button } from "@repo/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/card";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Card> = {
	title: "Components/Card",
	component: Card,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card description goes here.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card content with some example text.</p>
			</CardContent>
			<CardFooter>
				<Button>Action</Button>
			</CardFooter>
		</Card>
	),
};

export const Simple: Story = {
	render: () => (
		<Card className="w-[350px] p-6">
			<p>A simple card with just content.</p>
		</Card>
	),
};

export const WithForm: Story = {
	render: () => (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Create Account</CardTitle>
				<CardDescription>Enter your details below.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<label htmlFor="email" className="text-sm font-medium">
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="email@example.com"
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="password" className="text-sm font-medium">
						Password
					</label>
					<input
						id="password"
						type="password"
						className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
					/>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline">Cancel</Button>
				<Button>Create</Button>
			</CardFooter>
		</Card>
	),
};
