import { Github, Linkedin, Twitter, Youtube } from "lucide-react";

export function SocialLinks() {
	return (
		<ul className="flex space-x-4 items-center md:ml-5">
			<li>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://twitter.com"
					className="text-[#878787] hover:text-foreground transition-colors"
				>
					<span className="sr-only">Twitter</span>
					<Twitter size={22} />
				</a>
			</li>
			<li>
				<a
					href="https://github.com/obakh/cloudflare-one"
					target="_blank"
					rel="noreferrer"
					className="text-[#878787] hover:text-foreground transition-colors"
				>
					<span className="sr-only">Github</span>
					<Github size={22} />
				</a>
			</li>
			<li>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://linkedin.com"
					className="text-[#878787] hover:text-foreground transition-colors"
				>
					<span className="sr-only">LinkedIn</span>
					<Linkedin size={22} />
				</a>
			</li>
			<li>
				<a
					target="_blank"
					rel="noreferrer"
					href="https://youtube.com"
					className="text-[#878787] hover:text-foreground transition-colors"
				>
					<span className="sr-only">Youtube</span>
					<Youtube size={22} />
				</a>
			</li>
		</ul>
	);
}
