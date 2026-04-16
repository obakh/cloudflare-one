"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	Icons,
	Input,
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	Spinner,
} from "@repo/ui";
import { GithubIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/sign-in";

export async function loader(_args: Route.LoaderArgs) {
	// Check if user is already logged in
	// const session = await authClient.getSession();
	// if (session.data) throw redirect("/");
	return {};
}

export function meta() {
	return [{ title: "Sign In" }];
}

// OTP Email form schema
const otpFormSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});

export default function SignIn() {
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get("return_to");
	const [isGoogleLoading, setGoogleLoading] = useState(false);
	const [isGithubLoading, setGithubLoading] = useState(false);
	const [isAppleLoading, setAppleLoading] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [otpEmail, setOtpEmail] = useState("");
	const [isOtpLoading, setOtpLoading] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	const form = useForm<z.infer<typeof otpFormSchema>>({
		resolver: zodResolver(otpFormSchema),
		defaultValues: {
			email: "",
		},
	});

	// OAuth Sign In handlers
	const handleGoogleSignIn = async () => {
		setGoogleLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: returnTo || "/",
			});
		} catch (error) {
			console.error("Google sign in error:", error);
		} finally {
			setTimeout(() => setGoogleLoading(false), 2000);
		}
	};

	const handleGithubSignIn = async () => {
		setGithubLoading(true);
		try {
			await authClient.signIn.social({
				provider: "github",
				callbackURL: returnTo || "/",
			});
		} catch (error) {
			console.error("GitHub sign in error:", error);
		} finally {
			setTimeout(() => setGithubLoading(false), 2000);
		}
	};

	const handleAppleSignIn = async () => {
		setAppleLoading(true);
		try {
			await authClient.signIn.social({
				provider: "apple",
				callbackURL: returnTo || "/",
			});
		} catch (error) {
			console.error("Apple sign in error:", error);
		} finally {
			setTimeout(() => setAppleLoading(false), 2000);
		}
	};

	// OTP handlers
	const handleOtpSubmit = async (values: z.infer<typeof otpFormSchema>) => {
		setOtpLoading(true);
		setOtpEmail(values.email);
		try {
			// Send OTP email
			// await authClient.signIn.emailOtp({ email: values.email });
			setOtpSent(true);
		} catch (error) {
			console.error("OTP send error:", error);
		} finally {
			setOtpLoading(false);
		}
	};

	const handleOtpVerify = async (otp: string) => {
		if (!otpEmail) return;
		setIsVerifying(true);
		try {
			// Verify OTP
			// await authClient.signIn.emailOtp.verify({ email: otpEmail, otp });
			// Redirect on success
			window.location.href = returnTo || "/";
		} catch (error) {
			console.error("OTP verify error:", error);
			setIsVerifying(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex">
			{/* Left Side - Background */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden m-2">
				{/* Placeholder background */}
				<div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />

				{/* Logo */}
				<div className="absolute top-0 left-0 right-0 z-20">
					<div className="p-4">
						<Link to="/" className="text-foreground">
							<span className="font-semibold text-lg">Logo</span>
						</Link>
					</div>
				</div>

				{/* Content overlay */}
				<div className="relative z-10 flex flex-col justify-center items-center p-8 text-center h-full w-full">
					<div className="max-w-lg space-y-6">
						<div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
							<p className="text-foreground/80 text-lg italic">
								"Testimonial quote placeholder - what users say about your product."
							</p>
							<p className="text-muted-foreground text-sm mt-4">— User Name, Company</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 pb-2">
				<div className="w-full max-w-md flex flex-col h-full">
					<div className="space-y-8 flex-1 flex flex-col justify-center">
						{/* Header */}
						<div className="text-center space-y-2">
							<h1 className="text-lg mb-4 font-serif">Welcome</h1>
							<p className="font-sans text-sm text-[#878787]">Sign in or create an account</p>
						</div>

						{/* Primary Sign In - Google */}
						<div className="space-y-3 flex flex-col items-center justify-center w-full">
							<Button
								type="button"
								onClick={handleGoogleSignIn}
								disabled={isGoogleLoading}
								className="w-full bg-[#0e0e0e] dark:bg-white/90 border border-[#0e0e0e] dark:border-white text-white dark:text-[#0e0e0e] font-sans font-medium text-sm h-[40px] px-6 hover:bg-[#1a1a1a] dark:hover:bg-white transition-colors disabled:opacity-50"
							>
								{isGoogleLoading ? (
									<Spinner size={16} />
								) : (
									<div className="flex items-center justify-center gap-2">
										<Icons.Google size={16} />
										<span>Continue with Google</span>
									</div>
								)}
							</Button>
						</div>

						{/* Divider */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-background font-sans text-[#878787]">or</span>
							</div>
						</div>

						{/* More Options Accordion */}
						<Accordion type="single" collapsible className="w-full">
							<AccordionItem value="more-options" className="border-none">
								<AccordionTrigger className="flex items-center justify-center w-full font-normal p-0 hover:no-underline">
									<span className="text-sm text-[#878787]">More options</span>
								</AccordionTrigger>
								<AccordionContent className="pt-4">
									<div className="space-y-3">
										{/* Apple Sign In */}
										<Button
											type="button"
											onClick={handleAppleSignIn}
											disabled={isAppleLoading}
											variant="outline"
											className="w-full h-[40px] font-sans text-sm"
										>
											{isAppleLoading ? (
												<Spinner size={16} />
											) : (
												<div className="flex items-center justify-center gap-2">
													<Icons.Apple size={16} />
													<span>Continue with Apple</span>
												</div>
											)}
										</Button>

										{/* GitHub Sign In */}
										<Button
											type="button"
											onClick={handleGithubSignIn}
											disabled={isGithubLoading}
											variant="outline"
											className="w-full h-[40px] font-sans text-sm"
										>
											{isGithubLoading ? (
												<Spinner size={16} />
											) : (
												<div className="flex items-center justify-center gap-2">
													<GithubIcon size={16} />
													<span>Continue with Github</span>
												</div>
											)}
										</Button>

										{/* Email OTP */}
										<div className="border-t border-border pt-4 mt-4">
											{otpSent ? (
												<div className="flex flex-col space-y-4 items-center">
													<div className="h-[62px] w-full flex items-center justify-center">
														{isVerifying ? (
															<div className="flex items-center justify-center h-full bg-background/95 border border-input w-full">
																<div className="flex items-center space-x-2 bg-background px-4 py-2 rounded-md">
																	<Spinner size={16} />
																	<span className="text-sm text-foreground font-medium">
																		Verifying...
																	</span>
																</div>
															</div>
														) : (
															<InputOTP
																maxLength={6}
																onComplete={handleOtpVerify}
																render={({ slots }) => (
																	<InputOTPGroup>
																		{slots.map((slot, index) => (
																			<InputOTPSlot
																				key={index.toString()}
																				{...slot}
																				className="w-[50px] h-[50px]"
																			/>
																		))}
																	</InputOTPGroup>
																)}
															/>
														)}
													</div>
													<div className="flex space-x-2">
														<span className="text-sm text-[#878787]">
															Didn't receive the email?
														</span>
														<button
															onClick={() => setOtpSent(false)}
															type="button"
															className="text-sm text-primary underline font-medium"
															disabled={isVerifying}
														>
															Resend code
														</button>
													</div>
												</div>
											) : (
												<Form {...form}>
													<form onSubmit={form.handleSubmit(handleOtpSubmit)} className="w-full">
														<div className="flex flex-col space-y-3">
															<FormField
																control={form.control}
																name="email"
																render={({ field }) => (
																	<FormItem>
																		<FormControl>
																			<Input
																				placeholder="Enter email address"
																				{...field}
																				autoCapitalize="off"
																				autoCorrect="off"
																				spellCheck="false"
																			/>
																		</FormControl>
																	</FormItem>
																)}
															/>
															<Button
																type="submit"
																disabled={isOtpLoading}
																className="w-full h-[40px]"
															>
																{isOtpLoading ? <Spinner size={16} /> : "Continue"}
															</Button>
														</div>
													</form>
												</Form>
											)}
										</div>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>

					{/* Terms and Privacy Policy - Bottom aligned */}
					<div className="text-center mt-auto pt-8">
						<p className="font-sans text-xs text-[#878787]">
							By signing in you agree to our{" "}
							<Link
								to="/terms"
								className="text-[#878787] hover:text-foreground transition-colors underline"
							>
								Terms of service
							</Link>{" "}
							&{" "}
							<Link
								to="/privacy"
								className="text-[#878787] hover:text-foreground transition-colors underline"
							>
								Privacy policy
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
