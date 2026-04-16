import { Spinner } from "@repo/ui/spinner";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Spinner> = {
	title: "Components/Spinner",
	component: Spinner,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Spinner className="h-4 w-4" />
			<Spinner className="h-6 w-6" />
			<Spinner className="h-8 w-8" />
			<Spinner className="h-12 w-12" />
		</div>
	),
};

export const WithText: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Spinner className="h-4 w-4" />
			<span className="text-sm text-muted-foreground">Loading...</span>
		</div>
	),
};
