import { Button } from "@repo/ui";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { HeroImage } from "./hero-image";
import { Metrics } from "./metrics";

// App URL for auth pages
const APP_URL = "http://localhost:5174";

export function Hero() {
	return (
		<section className="mt-[60px] lg:mt-[180px] min-h-[530px] relative lg:h-[calc(100vh-300px)]">
			<div className="flex flex-col">
				{/* Announcement Badge */}
				<Link to="/updates">
					<Button
						variant="outline"
						className="rounded-full border-border flex space-x-2 items-center w-fit"
					>
						<span className="text-xs">Announcement v1.0</span>
						<ArrowRight size={12} />
					</Button>
				</Link>

				{/* Headline */}
				<h2 className="mt-6 md:mt-10 max-w-[580px] text-muted-foreground leading-tight text-[24px] md:text-[36px] font-medium">
					Your main headline describing your product's{" "}
					<span className="text-primary">key value proposition here</span>.
				</h2>

				{/* CTA Buttons */}
				<div className="mt-8 md:mt-10">
					<div className="flex items-center space-x-4">
						<a href={`${APP_URL}/sign-up`}>
							<Button className="h-11 px-5">Get Started</Button>
						</a>
					</div>
				</div>

				{/* Subtext */}
				<p className="text-xs text-muted-foreground mt-4 font-mono">
					Free trial available (No credit card required)
				</p>
			</div>

			<HeroImage />
			<Metrics />
		</section>
	);
}
