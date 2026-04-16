import { InfiniteMovingCards } from "./infinite-moving-cards";

const testimonials = [
	{
		name: "User Name 1",
		handle: "@username1",
		verified: true,
		quote: "This product is amazing! It has completely transformed how we work.",
	},
	{
		name: "User Name 2",
		handle: "@username2",
		verified: true,
		quote: "I love how easy it is to use. Highly recommended!",
	},
	{
		name: "User Name 3",
		handle: "@username3",
		verified: true,
		quote: "The best solution I've found. Our team productivity has increased significantly.",
	},
	{
		name: "User Name 4",
		handle: "@username4",
		verified: false,
		quote: "Great integration and smooth experience overall.",
	},
	{
		name: "User Name 5",
		handle: "@username5",
		verified: true,
		quote: "Finally, a tool that understands our needs perfectly.",
	},
	{
		name: "User Name 6",
		handle: "@username6",
		verified: true,
		quote: "Excellent support team and fantastic product!",
	},
	{
		name: "Company Name",
		handle: "@company",
		verified: true,
		quote: "We love using this product for our daily operations.",
	},
	{
		name: "Industry Expert",
		handle: "@expert",
		verified: true,
		quote: "One of the best in the market. Great features and usability.",
	},
];

export function Testimonials() {
	return (
		<div className="relative pb-22">
			<h3 className="text-4xl mb-8 font-medium">What people say</h3>
			<InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
		</div>
	);
}
