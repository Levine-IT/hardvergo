import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Header from "./Header";

// Define the meta configuration
const meta: Meta<typeof Header> = {
	title: "Components/Header",
	component: Header,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<Meta<typeof Header>>;

// Desktop view story
export const Desktop: Story = {};
