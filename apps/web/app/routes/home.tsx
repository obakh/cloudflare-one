import { Footer } from "../components/footer";
import { FooterCTA } from "../components/footer-cta";
import { Header } from "../components/header";
import { Hero } from "../components/hero";
import { SectionFive } from "../components/section-five";
import { SectionFour } from "../components/section-four";
import { SectionOne } from "../components/section-one";
import { SectionSeven } from "../components/section-seven";
import { SectionSix } from "../components/section-six";
import { SectionThree } from "../components/section-three";
import { SectionTwo } from "../components/section-two";
import { Testimonials } from "../components/testimonials";

export function meta() {
	return [
		{ title: "Your Product | Your Tagline" },
		{
			name: "description",
			content: "Your product description. Explain what your product does and how it helps users.",
		},
	];
}

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />

			<main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
				<Hero />
				<SectionOne />
				<SectionTwo />
				<SectionThree />
				<SectionFour />
				<SectionFive />
				<SectionSix />
				<SectionSeven />
				<Testimonials />
			</main>

			<FooterCTA />
			<Footer />
		</div>
	);
}
