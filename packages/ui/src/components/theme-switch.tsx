import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../providers/theme";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

type Theme = "dark" | "system" | "light";

const THEMES: Theme[] = ["light", "dark", "system"];

const ThemeIcon = ({ theme }: { theme: "dark" | "light" }) => {
	if (theme === "dark") return <Moon size={12} />;
	return <Sun size={12} />;
};

export function ThemeSwitch() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <div className="h-[32px]" />;
	}

	return (
		<div className="flex items-center relative">
			<Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
				<SelectTrigger className="w-full pl-6 pr-3 py-1.5 bg-transparent outline-none capitalize h-[32px] text-xs">
					<SelectValue>
						{theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "Select theme"}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{THEMES.map((t) => (
							<SelectItem key={t} value={t} className="capitalize text-xs">
								{t}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			<div className="absolute left-2 pointer-events-none">
				{theme === "system" ? <Monitor size={12} /> : <ThemeIcon theme={resolvedTheme} />}
			</div>
		</div>
	);
}
