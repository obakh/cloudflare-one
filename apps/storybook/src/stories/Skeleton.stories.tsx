import { Skeleton } from "@repo/ui/skeleton";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Skeleton> = {
	title: "Components/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	render: () => <Skeleton className="h-4 w-[250px]" />,
};

export const Circle: Story = {
	render: () => <Skeleton className="h-12 w-12 rounded-full" />,
};

export const Card: Story = {
	render: () => (
		<div className="flex items-center space-x-4">
			<Skeleton className="h-12 w-12 rounded-full" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
		</div>
	),
};

export const CardLoading: Story = {
	render: () => (
		<div className="w-[350px] rounded-xl border p-6 space-y-4">
			<div className="space-y-2">
				<Skeleton className="h-5 w-[150px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
			<Skeleton className="h-[125px] w-full rounded-md" />
			<div className="flex justify-end">
				<Skeleton className="h-9 w-[100px]" />
			</div>
		</div>
	),
};
