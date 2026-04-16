"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CtaLink } from "./cta-link";

const leftFeatures = [
	"Feature 1",
	"Feature 2",
	"Feature 3",
	"Feature 4",
	"Feature 5",
	"Feature 6",
	"Feature 7",
];

const rightFeatures = ["Capability 1", "Capability 2", "Capability 3"];

export function SectionFour() {
	return (
		<section className="flex justify-between space-y-12 lg:space-y-0 lg:space-x-8 flex-col lg:flex-row overflow-hidden mb-12 relative">
			{/* Left card - larger */}
			<div className="border border-border md:basis-2/3 bg-card p-10 flex justify-between md:space-x-8 md:flex-row flex-col group">
				<div className="flex flex-col md:basis-1/2">
					<h4 className="font-medium text-xl md:text-2xl mb-4">Feature Card 1</h4>

					<p className="text-muted-foreground md:mb-4 text-sm">
						Description for your main feature. Explain what users can do and the value it provides
						to them.
					</p>

					<div className="flex flex-col space-y-2 mt-8">
						{leftFeatures.map((feature, index) => (
							<div key={index} className="flex space-x-2 text-sm">
								<Check className="flex-none w-[1.125rem] h-[1lh] text-primary" size={18} />
								<span className="text-primary">{feature}</span>
							</div>
						))}

						<div className="absolute bottom-6">
							<CtaLink text="Get started with this feature" />
						</div>
					</div>
				</div>

				<div className="md:basis-1/2 md:mt-0 -ml-[40px] md:-ml-0 -bottom-[8px] relative">
					{/* Feature image */}
					<div className="w-[299px] h-[423px] bg-muted border border-border flex items-center justify-center ml-[10%] xl:ml-[20%] -bottom-[33px] relative">
						<span className="text-muted-foreground text-sm">Feature Image</span>
					</div>

					{/* Floating widget 1 */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.7 }}
						viewport={{ once: true }}
						className="absolute left-4 md:-left-[80px] bottom-[35px]"
					>
						<div className="w-[327px] h-[57px] bg-muted border border-border flex items-center justify-center">
							<span className="text-xs text-muted-foreground">Widget</span>
						</div>
					</motion.div>

					{/* Floating widget 2 */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 1.5 }}
						viewport={{ once: true }}
						className="absolute left-8 bottom-[100px]"
					>
						<div className="w-[136px] h-[34px] bg-muted border border-border flex items-center justify-center">
							<span className="text-xs text-muted-foreground">Mini</span>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Right card - smaller */}
			<div className="border border-border basis-1/3 bg-card p-10 flex flex-col relative group">
				<h4 className="font-medium text-xl md:text-2xl mb-4">Feature Card 2</h4>

				<ol className="list-decimal list-inside text-muted-foreground text-sm space-y-2 leading-relaxed">
					<li>Step one of your process described here.</li>
					<li>Step two explaining the next part of the workflow.</li>
					<li>Step three completing the flow.</li>
				</ol>

				<div className="flex flex-col space-y-2 mb-6 mt-8">
					{rightFeatures.map((feature, index) => (
						<div key={index} className="flex space-x-2 text-sm">
							<Check className="flex-none w-[1.125rem] h-[1lh] text-primary" size={18} />
							<span className="text-primary">{feature}</span>
						</div>
					))}
				</div>

				{/* Animated widgets */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 1.4 }}
					viewport={{ once: true }}
					className="xl:absolute bottom-[100px]"
				>
					<div className="w-[384px] h-[33px] bg-muted border border-border flex items-center justify-center scale-[0.9]">
						<span className="text-xs text-muted-foreground">Action Bar</span>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 20 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 1.8 }}
					viewport={{ once: true }}
					className="xl:absolute mt-4 xl:mt-0 bottom-[140px] right-10"
				>
					<div className="w-[106px] h-[19px] bg-muted border border-border flex items-center justify-center">
						<span className="text-[10px] text-muted-foreground">Badge</span>
					</div>
				</motion.div>

				<div className="absolute bottom-6">
					<CtaLink text="Automate your workflow" />
				</div>
			</div>
		</section>
	);
}
