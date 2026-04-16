import baseConfig from "@repo/ui/tailwind.config";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"../../packages/ui/src/**/*.{ts,tsx}",
	],
	presets: [baseConfig],
};
