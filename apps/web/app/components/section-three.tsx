"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CtaLink } from "./cta-link";

const features = [
	"Feature point 1",
	"Feature point 2",
	"Feature point 3",
	"Feature point 4",
	"Feature point 5",
];

export function SectionThree() {
	return (
		<section className="relative mb-12 group">
			<div className="border border-border container bg-card p-8 md:p-10 md:pb-0 overflow-hidden">
				<div className="flex flex-col md:space-x-12 md:flex-row">
					<div className="xl:mt-6 md:max-w-[40%] md:mr-8 md:mb-8">
						<h3 className="font-medium text-xl md:text-2xl mb-4">Another Feature Title</h3>

						<p className="text-muted-foreground md:mb-4 text-sm">
							Describe your second feature here. Explain the value proposition and benefits to your
							users.
						</p>

						<div className="flex flex-col space-y-2 mt-8">
							{features.map((feature, index) => (
								<div key={index} className="flex space-x-2 text-sm">
									<Check className="flex-none w-[1.125rem] h-[1lh] text-primary" size={18} />
									<span className="text-primary">{feature}</span>
								</div>
							))}
						</div>

						<div className="absolute bottom-6">
							<CtaLink text="Explore this feature" />
						</div>
					</div>

					<div className="relative mt-8 md:mt-0">
						{/* Animated floating elements */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.7 }}
							viewport={{ once: true }}
							className="absolute -left-[80px] top-[200px] hidden md:block"
						>
							<div className="w-[135px] h-[142px] bg-muted border border-border flex items-center justify-center">
								<span className="text-xs text-muted-foreground">Widget 1</span>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 1.2 }}
							viewport={{ once: true }}
							className="absolute -right-[15px] -top-[20px] hidden md:block"
						>
							<div className="w-[238px] h-[124px] bg-muted border border-border flex items-center justify-center">
								<span className="text-xs text-muted-foreground">Widget 2</span>
							</div>
						</motion.div>

						{/* Main feature image */}
						<div className="w-full md:w-[500px] h-[400px] bg-muted border border-border flex items-center justify-center -mb-[1px]">
							<span className="text-muted-foreground">Feature Image 2</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
