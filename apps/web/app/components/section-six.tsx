"use client";

export function SectionSix() {
    return (
        <section
            className="mt-[300px] mb-[250px] md:mt-24 md:mb-12 relative"
            id="assistant"
        >
            {/* Background visual - tray placeholder */}
            <div className="w-full h-[400px] bg-gradient-to-br from-muted to-card border border-border flex items-center justify-center">
                <span className="text-muted-foreground">Visual Background Element</span>
            </div>

            <div className="absolute w-full h-full flex items-center justify-center flex-col top-8 xl:top-0">
                <h4 className="text-4xl mb-4 font-medium md:text-white">Feature Highlight</h4>
                <p className="max-w-[790px] px-4 text-center text-sm md:text-white dark:text-muted-foreground mb-12 md:mb-0">
                    Placeholder text describing your highlighted feature. This section
                    creates visual interest and draws attention to a key capability.
                </p>

                {/* Assistant/chat placeholder */}
                <div className="xl:mt-14 w-full flex justify-center scale-[0.50] lg:scale-[0.80] xl:scale-100 min-w-[720px]">
                    <div className="w-[600px] h-[300px] bg-card/80 backdrop-blur border border-border flex items-center justify-center">
                        <span className="text-muted-foreground">Interactive Component</span>
                    </div>
                </div>
            </div>

            {/* Floating elements on the side */}
            <div className="absolute right-12 top-[120px] hidden xl:flex flex-col space-y-8 text-center items-center">
                <div className="text-center">
                    <div className="w-16 h-12 bg-muted border border-border flex items-center justify-center mb-1">
                        <span className="text-xs text-muted-foreground">📁</span>
                    </div>
                    <span className="text-sm">Item 1</span>
                </div>

                <div className="text-center">
                    <div className="w-16 h-12 bg-muted border border-border flex items-center justify-center mb-1">
                        <span className="text-xs text-muted-foreground">📁</span>
                    </div>
                    <span className="text-sm">Item 2</span>
                </div>

                <div>
                    <div className="w-20 h-20 bg-card border border-border flex items-center justify-center mb-1">
                        <span className="text-xs text-muted-foreground">📄</span>
                    </div>
                    <span className="text-sm">document.pdf</span>
                </div>
            </div>
        </section>
    );
}
