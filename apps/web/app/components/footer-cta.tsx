"use client";

import { Button } from "@repo/ui";

// App URL - in production this would be your app domain
const APP_URL = "http://localhost:5174";

export function FooterCTA() {
    return (
        <div className="border border-border md:container text-center px-10 py-14 mx-4 md:mx-auto md:px-24 md:py-20 mb-32 mt-24 flex items-center flex-col bg-accent">
            <span className="text-6xl md:text-8xl font-medium text-primary">
                Your tagline here.
            </span>
            <p className="text-muted-foreground mt-6">
                List your key features, value props, or benefits here. <br />
                Keep it concise and impactful.
            </p>

            <div className="mt-10 md:mb-8">
                <div className="flex items-center space-x-4">
                    <a
                        href="#contact"
                    >
                        <Button
                            variant="outline"
                            className="border border-primary h-12 px-6 hidden md:block"
                        >
                            Talk to us
                        </Button>
                    </a>

                    <a href={`${APP_URL}/sign-up`}>
                        <Button className="h-12 px-5 bg-primary text-primary-foreground hover:opacity-90">
                            Start free trial
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
