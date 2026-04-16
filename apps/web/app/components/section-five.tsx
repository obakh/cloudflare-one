"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CtaLink } from "./cta-link";

const features = [
    "Feature benefit 1",
    "Feature benefit 2",
];

export function SectionFive() {
    return (
        <section className="flex justify-between space-y-12 lg:space-y-0 lg:space-x-8 flex-col lg:flex-row overflow-hidden mb-12">
            {/* Left card - Vault style */}
            <div className="border border-border lg:basis-2/3 bg-card p-10 flex lg:space-x-8 lg:flex-row flex-col-reverse lg:items-start group">
                {/* Image placeholder */}
                <div className="mt-8 lg:mt-0 basis-1/2 max-w-[70%] sm:max-w-[50%] md:max-w-[35%]">
                    <div className="w-full aspect-square bg-muted border border-border flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Feature Image</span>
                    </div>
                </div>

                <div className="flex flex-col basis-1/2 relative h-full">
                    <h4 className="font-medium text-xl md:text-2xl mb-4">Feature Title</h4>

                    <p className="text-muted-foreground mb-4 text-sm">
                        Short description of your feature.
                    </p>

                    <p className="text-muted-foreground text-sm">
                        Extended description providing more details about the feature
                        and its benefits to users.
                    </p>

                    <div className="flex flex-col space-y-2 h-full mt-8">
                        {features.map((feature, index) => (
                            <div key={index} className="flex space-x-2 text-sm">
                                <Check className="flex-none w-[1.125rem] h-[1lh] text-primary" size={18} />
                                <span className="text-primary">{feature}</span>
                            </div>
                        ))}

                        <div className="absolute bottom-0 left-0">
                            <CtaLink text="Get started now" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right card - Export style */}
            <div className="border border-border basis-1/3 bg-card p-10 flex flex-col group">
                <h4 className="font-medium text-xl md:text-2xl mb-4">
                    Secondary Feature
                </h4>
                <p className="text-muted-foreground text-sm mb-8">
                    Description of another key feature. Explain the process and
                    benefits in a clear and concise way.
                </p>

                {/* Animated toast/notification placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-auto"
                >
                    <div className="bg-muted border border-border p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="text-green-500" size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Success notification</span>
                            <span className="text-xs text-muted-foreground">Action completed</span>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-8 hidden md:flex">
                    <CtaLink text="Learn more" />
                </div>
            </div>
        </section>
    );
}
