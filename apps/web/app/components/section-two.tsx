import { Check } from "lucide-react";
import { CtaLink } from "./cta-link";

const features = [
    "Feature benefit 1",
    "Feature benefit 2",
    "Feature benefit 3",
    "Feature benefit 4",
];

export function SectionTwo() {
    return (
        <section className="border border-border container bg-card lg:pb-0 overflow-hidden mb-12 group">
            <div className="flex flex-col lg:space-x-12 lg:flex-row">
                {/* Image placeholder */}
                <div className="lg:w-1/2 aspect-video bg-muted flex items-center justify-center -mb-[1px]">
                    <span className="text-muted-foreground">Feature Image 1</span>
                </div>

                <div className="xl:mt-6 lg:max-w-[40%] md:ml-8 md:mb-8 flex flex-col justify-center p-8 md:pl-0 relative">
                    <h3 className="font-medium text-xl md:text-2xl mb-4">
                        Feature Section Title
                    </h3>

                    <p className="text-muted-foreground mb-8 lg:mb-4 text-sm">
                        Describe your feature here. Explain what it does and how it helps
                        your users. This is placeholder content for you to customize.
                    </p>

                    <div className="flex flex-col space-y-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex space-x-2 text-sm">
                                <Check className="flex-none w-[1.125rem] h-[1lh] text-primary" size={18} />
                                <span className="text-primary">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-0 right-0">
                        <CtaLink text="Learn more about this feature" />
                    </div>
                </div>
            </div>
        </section>
    );
}
