"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn } from "@repo/ui";
import { motion } from "framer-motion";
import {
	BookOpen,
	Box,
	Component,
	Cpu,
	FolderOpen,
	Github,
	LayoutDashboard,
	Puzzle,
	Receipt,
	Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

const listVariant = {
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.03,
		},
	},
	hidden: {
		opacity: 0,
	},
};

const itemVariant = {
	hidden: { opacity: 0 },
	show: { opacity: 1 },
};

// App URLs - in production these would be your actual domains
const APP_URL = "http://localhost:5174";
const BLOG_URL = "http://localhost:4321";
const DOCS_URL = "http://localhost:3004";

export function Header() {
	const location = useLocation();
	const pathname = location.pathname;
	const [isOpen, setOpen] = useState(false);
	const [showBlur, setShowBlur] = useState(false);
	const [hidden, setHidden] = useState(false);
	const lastPath = `/${pathname.split("/").pop()}`;

	useEffect(() => {
		const setPixelRatio = () => {
			const pixelRatio = window.devicePixelRatio || 1;
			document.documentElement.style.setProperty("--pixel-ratio", `${1 / pixelRatio}`);
		};

		setPixelRatio();
		window.addEventListener("resize", setPixelRatio);

		return () => window.removeEventListener("resize", setPixelRatio);
	}, []);

	const handleToggleMenu = () => {
		setOpen((prev) => {
			document.body.style.overflow = prev ? "" : "hidden";
			return !prev;
		});
	};

	const handleOnClick = () => {
		setShowBlur(false);
		setHidden(true);

		setTimeout(() => {
			setHidden(false);
		}, 100);
	};

	const links = [
		{
			title: "Product",
			cover: (
				<div className="bg-muted aspect-video rounded flex items-center justify-center">
					<span className="text-muted-foreground text-sm">Product Image</span>
				</div>
			),
			children: [
				{
					path: "/",
					title: "Overview",
					icon: <LayoutDashboard size={20} />,
				},
				{
					path: "/features",
					title: "Features",
					icon: <Box size={20} />,
				},
				{
					path: "/integrations",
					title: "Integrations",
					icon: <Puzzle size={20} />,
				},
				{
					path: "/security",
					title: "Security",
					icon: <FolderOpen size={20} />,
				},
				{
					path: "/changelog",
					title: "Changelog",
					icon: <Timer size={20} />,
				},
			],
		},
		{
			title: "Solutions",
			path: "/solutions",
		},
		{
			title: "Pricing",
			path: "/pricing",
		},
		{
			title: "Company",
			path: "/company",
		},
		{
			title: "Blog",
			path: BLOG_URL,
			external: true,
		},
		{
			title: "Resources",
			cover: (
				<div className="bg-muted aspect-video rounded flex items-center justify-center">
					<span className="text-muted-foreground text-sm">Resources Image</span>
				</div>
			),
			children: [
				{
					path: DOCS_URL,
					title: "Documentation",
					icon: <BookOpen size={20} />,
					external: true,
				},
				{
					path: "/guides",
					title: "Guides",
					icon: <Receipt size={20} />,
				},
				{
					path: "/api",
					title: "API Reference",
					icon: <Cpu size={20} />,
				},
				{
					path: "/support",
					title: "Support",
					icon: <Github size={19} />,
				},
				{
					path: "/community",
					title: "Community",
					icon: <Component size={20} />,
				},
			],
		},
	];

	return (
		<header className="sticky mt-4 top-4 z-50 px-2 md:px-4 md:flex justify-center">
			<nav className="border border-border px-4 flex items-center backdrop-filter backdrop-blur-xl bg-[#FFFFFF] dark:bg-[#121212] bg-opacity-70 h-[50px] z-20 relative">
				{/* Logo */}
				<Link to="/">
					<span className="sr-only">Logo</span>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="size-6"
					>
						<rect width="24" height="24" rx="4" fill="currentColor" />
						<text x="6" y="17" fontSize="12" fill="white" fontWeight="bold">
							L
						</text>
					</svg>
				</Link>

				<ul className="space-x-2 font-medium text-sm hidden md:flex mx-3">
					{links.map(({ path, title, children, cover, external }) => {
						if (path) {
							if (external) {
								return (
									<li key={path}>
										<a
											href={path}
											target="_blank"
											rel="noopener noreferrer"
											className="h-8 items-center justify-center text-sm font-medium px-3 py-2 inline-flex text-secondary-foreground transition-opacity hover:opacity-70 duration-200"
										>
											{title}
										</a>
									</li>
								);
							}
							return (
								<li key={path}>
									<Link
										onClick={handleOnClick}
										to={path}
										className="h-8 items-center justify-center text-sm font-medium px-3 py-2 inline-flex text-secondary-foreground transition-opacity hover:opacity-70 duration-200"
									>
										{title}
									</Link>
								</li>
							);
						}

						return (
							<li
								key={title}
								className="group"
								onMouseEnter={() => setShowBlur(true)}
								onMouseLeave={() => setShowBlur(false)}
							>
								<span className="h-8 items-center justify-center text-sm font-medium transition-opacity hover:opacity-70 duration-200 px-3 py-2 inline-flex text-secondary-foreground cursor-pointer">
									{title}
								</span>

								{children && (
									<div
										className={cn(
											"absolute top-[48px] left-0 right-0 bg-[#fff] dark:bg-[#121212] flex h-0 group-hover:h-[250px] overflow-hidden transition-all duration-300 ease-in-out border-l border-r border-b border-border",
											hidden && "hidden",
										)}
									>
										<ul className="p-4 w-[200px] flex-shrink-0 space-y-4 mt-2">
											{children.map((child) => {
												if (child.external) {
													return (
														<li key={child.path}>
															<a
																href={child.path}
																target="_blank"
																rel="noopener noreferrer"
																className="flex space-x-2 items-center transition-opacity hover:opacity-70 duration-200"
															>
																<span>{child.icon}</span>
																<span className="text-sm font-medium">{child.title}</span>
															</a>
														</li>
													);
												}
												return (
													<li key={child.path}>
														<Link
															onClick={handleOnClick}
															to={child.path}
															className="flex space-x-2 items-center transition-opacity hover:opacity-70 duration-200"
														>
															<span>{child.icon}</span>
															<span className="text-sm font-medium">{child.title}</span>
														</Link>
													</li>
												);
											})}
										</ul>

										<div className="flex-1 p-4">{cover}</div>
									</div>
								)}
							</li>
						);
					})}
				</ul>

				<button type="button" className="ml-auto md:hidden p-2" onClick={() => handleToggleMenu()}>
					<svg xmlns="http://www.w3.org/2000/svg" width={18} height={13} fill="none">
						<path
							fill="currentColor"
							d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
						/>
					</svg>
				</button>

				<a
					className="text-sm font-medium pr-2 border-l-[1px] border-border pl-4 hidden md:block"
					href={`${APP_URL}/sign-in`}
				>
					Sign in
				</a>
			</nav>

			{isOpen && (
				<motion.div
					className="fixed bg-background -top-[2px] right-0 left-0 bottom-0 h-screen z-10 px-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<div className="mt-4 flex justify-between p-3 px-4 relative ml-[1px]">
						<button type="button" onClick={handleToggleMenu}>
							<span className="sr-only">Logo</span>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="size-6"
							>
								<rect width="24" height="24" rx="4" fill="currentColor" />
								<text x="6" y="17" fontSize="12" fill="white" fontWeight="bold">
									L
								</text>
							</svg>
						</button>

						<button
							type="button"
							className="ml-auto md:hidden p-2 absolute right-[10px] top-2"
							onClick={handleToggleMenu}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width={24}
								height={24}
								className="fill-primary"
							>
								<path fill="none" d="M0 0h24v24H0V0z" />
								<path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
							</svg>
						</button>
					</div>

					<div className="h-screen pb-[150px] overflow-auto">
						<motion.ul
							initial="hidden"
							animate="show"
							className="px-3 pt-8 text-xl text-[#878787] space-y-8 mb-8 overflow-auto"
							variants={listVariant}
						>
							{links.map(({ path, title, children, external }) => {
								const isActive = path === BLOG_URL ? pathname.includes("blog") : path === lastPath;

								if (path) {
									if (external) {
										return (
											<motion.li variants={itemVariant} key={path}>
												<a
													href={path}
													target="_blank"
													rel="noopener noreferrer"
													className={cn(isActive && "text-primary")}
												>
													{title}
												</a>
											</motion.li>
										);
									}
									return (
										<motion.li variants={itemVariant} key={path}>
											<Link
												to={path}
												className={cn(isActive && "text-primary")}
												onClick={handleToggleMenu}
											>
												{title}
											</Link>
										</motion.li>
									);
								}

								return (
									<li key={title}>
										<Accordion collapsible type="single">
											<AccordionItem value="item-1" className="border-none">
												<AccordionTrigger className="flex items-center justify-between w-full font-normal p-0 hover:no-underline">
													<span className="text-[#878787]">{title}</span>
												</AccordionTrigger>

												{children && (
													<AccordionContent className="text-xl">
														<ul className="space-y-8 ml-4 mt-6">
															{children.map((child) => {
																if (child.external) {
																	return (
																		<li key={child.path}>
																			<a
																				href={child.path}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-[#878787]"
																			>
																				{child.title}
																			</a>
																		</li>
																	);
																}
																return (
																	<li key={child.path}>
																		<Link
																			onClick={handleToggleMenu}
																			to={child.path}
																			className="text-[#878787]"
																		>
																			{child.title}
																		</Link>
																	</li>
																);
															})}
														</ul>
													</AccordionContent>
												)}
											</AccordionItem>
										</Accordion>
									</li>
								);
							})}

							<motion.li className="mt-auto border-t-[1px] pt-8" variants={itemVariant}>
								<a className="text-xl text-primary" href={`${APP_URL}/sign-in`}>
									Sign in
								</a>
							</motion.li>
						</motion.ul>
					</div>
				</motion.div>
			)}

			<div
				className={cn(
					"fixed w-screen h-screen backdrop-blur-md left-0 top-0 invisible opacity-0 transition-all duration-300 z-10",
					showBlur && "md:visible opacity-100",
				)}
			/>
		</header>
	);
}
