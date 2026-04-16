import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Input> = {
	title: "Components/Input",
	component: Input,
	tags: ["autodocs"],
	argTypes: {
		type: {
			control: "select",
			options: ["text", "email", "password", "number", "search", "tel", "url"],
		},
		disabled: { control: "boolean" },
		placeholder: { control: "text" },
	},
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

export const Email: Story = {
	args: {
		type: "email",
		placeholder: "email@example.com",
	},
};

export const Password: Story = {
	args: {
		type: "password",
		placeholder: "Enter password",
	},
};

export const Disabled: Story = {
	args: {
		placeholder: "Disabled input",
		disabled: true,
	},
};

export const WithLabel: Story = {
	render: () => (
		<div className="grid w-full max-w-sm gap-1.5">
			<Label htmlFor="email">Email</Label>
			<Input type="email" id="email" placeholder="email@example.com" />
		</div>
	),
};

export const File: Story = {
	render: () => (
		<div className="grid w-full max-w-sm gap-1.5">
			<Label htmlFor="file">Upload file</Label>
			<Input id="file" type="file" />
		</div>
	),
};
