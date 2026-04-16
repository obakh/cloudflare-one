import { Button, Input, ThemeSwitch } from "@repo/ui";
import { Link } from "react-router";
import { SocialLinks } from "./social-links";

const footerLinks = {
	features: [
		{ title: "Feature 1", path: "/feature-1" },
		{ title: "Feature 2", path: "/feature-2" },
		{ title: "Feature 3", path: "/feature-3" },
		{ title: "Feature 4", path: "/feature-4" },
		{ title: "Pricing", path: "/pricing" },
		{ title: "Download", path: "/download" },
	],
	resources: [
		{ title: "GitHub", path: "/github" },
		{ title: "Support", path: "/support" },
		{ title: "Privacy Policy", path: "/privacy" },
		{ title: "Terms", path: "/terms" },
	],
	company: [
		{ title: "Story", path: "/story" },
		{ title: "Updates", path: "/updates" },
		{ title: "Open Source", path: "/open-source" },
	],
};

export function Footer() {
	return (
		<footer className="border-t border-border px-4 md:px-6 pt-10 md:pt-16 bg-background overflow-hidden md:max-h-[820px]">
			<div className="container mx-auto">
				{/* Top Section */}
				<div className="flex justify-between items-center border-b border-border pb-10 md:pb-16 mb-12">
					<Link to="/" className="scale-50 -ml-[52px] md:ml-0 md:scale-100">
						{/* Logo placeholder */}
						<div className="flex items-center space-x-2">
							<div className="w-12 h-12 bg-primary flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-xl">L</span>
							</div>
							<span className="font-bold text-2xl hidden md:block">Logo</span>
						</div>
						<span className="sr-only">Logo</span>
					</Link>

					<span className="font-normal md:text-2xl text-right">Your tagline goes here.</span>
				</div>

				{/* Links Section */}
				<div className="flex flex-col md:flex-row w-full">
					<div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:w-6/12 justify-between leading-8">
						{/* Features */}
						<div>
							<span className="font-medium">Features</span>
							<ul>
								{footerLinks.features.map((link) => (
									<li
										key={link.path}
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										<Link to={link.path}>{link.title}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Resources */}
						<div>
							<span className="font-medium">Resources</span>
							<ul>
								{footerLinks.resources.map((link) => (
									<li
										key={link.path}
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										<Link to={link.path}>{link.title}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company */}
						<div>
							<span className="font-medium">Company</span>
							<ul>
								{footerLinks.company.map((link) => (
									<li
										key={link.path}
										className="text-muted-foreground hover:text-foreground transition-colors"
									>
										<Link to={link.path}>{link.title}</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Newsletter & Social */}
					<div className="md:w-6/12 flex mt-8 md:mt-0 md:justify-end">
						<div className="flex md:items-end flex-col">
							<div className="flex items-start md:items-center flex-col md:flex-row space-y-6 md:space-y-0 mb-8">
								{/* GitHub stars placeholder */}
								<a
									href="https://github.com"
									className="flex items-center space-x-2 border border-border px-4 py-2 text-sm mr-4"
								>
									<span>⭐ Star us on GitHub</span>
								</a>
								<SocialLinks />
							</div>

							{/* Newsletter */}
							<div className="mb-8">
								<p className="text-sm mb-4">Subscribe to our newsletter</p>
								<div className="flex space-x-2">
									<Input
										type="email"
										placeholder="Email address"
										className="w-[200px] bg-background"
									/>
									<Button>Subscribe</Button>
								</div>
							</div>

							{/* Status widget & Theme switch */}
							<div className="md:mr-0 mt-auto mr-auto flex items-center space-x-4">
								<div className="flex items-center space-x-2 text-sm">
									<span className="w-2 h-2 rounded-full bg-green-500"></span>
									<span className="text-muted-foreground">All systems operational</span>
								</div>
								<div className="border-l border-border pl-4">
									<ThemeSwitch />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Large text footer decoration */}
			<h5 className="dark:text-[#161616] text-[#F4F4F3] text-[300px] md:text-[500px] leading-none text-center pointer-events-none select-none overflow-hidden">
				brand
			</h5>
		</footer>
	);
}
