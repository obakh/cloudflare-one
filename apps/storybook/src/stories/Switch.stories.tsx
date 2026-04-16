import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Switch> = {
	title: "Components/Switch",
	component: Switch,
	tags: ["autodocs"],
	argTypes: {
		disabled: { control: "boolean" },
		checked: { control: "boolean" },
	},
};

export default meta;
type Story = StoryObj<typeof Switch>;

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
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane Mode</Label>
		</div>
	),
};

export const SettingsExample: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label htmlFor="dark-mode">Dark Mode</Label>
				<Switch id="dark-mode" />
			</div>
			<div className="flex items-center justify-between">
				<Label htmlFor="notifications">Notifications</Label>
				<Switch id="notifications" defaultChecked />
			</div>
			<div className="flex items-center justify-between">
				<Label htmlFor="beta" className="text-muted-foreground">
					Beta Features (disabled)
				</Label>
				<Switch id="beta" disabled />
			</div>
		</div>
	),
};
