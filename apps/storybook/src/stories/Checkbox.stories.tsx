import { Checkbox } from "@repo/ui/checkbox";
import { Label } from "@repo/ui/label";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Checkbox> = {
	title: "Components/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	argTypes: {
		disabled: { control: "boolean" },
		checked: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = {
	args: {
		defaultChecked: true,
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const DisabledChecked: Story = {
	args: {
		disabled: true,
		defaultChecked: true,
	},
};

export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Checkbox id="terms" />
			<Label htmlFor="terms">Accept terms and conditions</Label>
		</div>
	),
};

export const FormExample: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center space-x-2">
				<Checkbox id="marketing" />
				<Label htmlFor="marketing">Receive marketing emails</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="notifications" defaultChecked />
				<Label htmlFor="notifications">Enable notifications</Label>
			</div>
			<div className="flex items-center space-x-2">
				<Checkbox id="analytics" disabled />
				<Label htmlFor="analytics" className="text-muted-foreground">
					Share analytics (disabled)
				</Label>
			</div>
		</div>
	),
};
