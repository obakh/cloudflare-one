/**
 * React Email Templates
 *
 * Reusable email templates built with React Email components.
 *
 * @see https://react.email/docs/introduction
 */

import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Base email layout
 */
interface BaseLayoutProps {
	preview?: string;
	children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
	return (
		<Html>
			<Head />
			{preview && <Preview>{preview}</Preview>}
			<Body style={styles.body}>
				<Container style={styles.container}>{children}</Container>
			</Body>
		</Html>
	);
}

/**
 * Welcome email template
 */
interface WelcomeEmailProps {
	name: string;
	appName: string;
	dashboardUrl?: string;
}

export function WelcomeEmail({ name, appName, dashboardUrl }: WelcomeEmailProps) {
	return (
		<BaseLayout preview={`Welcome to ${appName}!`}>
			<Heading style={styles.heading}>Welcome to {appName}!</Heading>
			<Text style={styles.text}>Hi {name},</Text>
			<Text style={styles.text}>Thanks for signing up. We're excited to have you on board.</Text>
			{dashboardUrl && (
				<Section style={styles.buttonSection}>
					<Button style={styles.button} href={dashboardUrl}>
						Go to Dashboard
					</Button>
				</Section>
			)}
			<Text style={styles.text}>
				Best regards,
				<br />
				The {appName} Team
			</Text>
		</BaseLayout>
	);
}

/**
 * Password reset email template
 */
interface PasswordResetEmailProps {
	resetUrl: string;
	expiresIn?: string;
	appName?: string;
}

export function PasswordResetEmail({
	resetUrl,
	expiresIn = "1 hour",
	appName = "Our App",
}: PasswordResetEmailProps) {
	return (
		<BaseLayout preview="Reset your password">
			<Heading style={styles.heading}>Reset Your Password</Heading>
			<Text style={styles.text}>
				You requested a password reset. Click the button below to set a new password:
			</Text>
			<Section style={styles.buttonSection}>
				<Button style={styles.button} href={resetUrl}>
					Reset Password
				</Button>
			</Section>
			<Text style={styles.mutedText}>
				This link expires in {expiresIn}. If you didn't request this, you can safely ignore this
				email.
			</Text>
			<Text style={styles.text}>
				Best regards,
				<br />
				The {appName} Team
			</Text>
		</BaseLayout>
	);
}

/**
 * Email verification template
 */
interface VerifyEmailProps {
	verifyUrl: string;
	appName?: string;
}

export function VerifyEmail({ verifyUrl, appName = "Our App" }: VerifyEmailProps) {
	return (
		<BaseLayout preview="Verify your email address">
			<Heading style={styles.heading}>Verify Your Email</Heading>
			<Text style={styles.text}>
				Please verify your email address by clicking the button below:
			</Text>
			<Section style={styles.buttonSection}>
				<Button style={styles.button} href={verifyUrl}>
					Verify Email
				</Button>
			</Section>
			<Text style={styles.mutedText}>
				If you didn't create an account, you can safely ignore this email.
			</Text>
			<Text style={styles.text}>
				Best regards,
				<br />
				The {appName} Team
			</Text>
		</BaseLayout>
	);
}

/**
 * Magic link login template
 */
interface MagicLinkEmailProps {
	loginUrl: string;
	expiresIn?: string;
	appName?: string;
}

export function MagicLinkEmail({
	loginUrl,
	expiresIn = "15 minutes",
	appName = "Our App",
}: MagicLinkEmailProps) {
	return (
		<BaseLayout preview="Your login link">
			<Heading style={styles.heading}>Sign In to {appName}</Heading>
			<Text style={styles.text}>Click the button below to sign in:</Text>
			<Section style={styles.buttonSection}>
				<Button style={styles.button} href={loginUrl}>
					Sign In
				</Button>
			</Section>
			<Text style={styles.mutedText}>
				This link expires in {expiresIn}. If you didn't request this, you can safely ignore this
				email.
			</Text>
		</BaseLayout>
	);
}

/**
 * Notification email template
 */
interface NotificationEmailProps {
	title: string;
	message: string;
	actionUrl?: string;
	actionText?: string;
	appName?: string;
}

export function NotificationEmail({
	title,
	message,
	actionUrl,
	actionText = "View Details",
	appName = "Our App",
}: NotificationEmailProps) {
	return (
		<BaseLayout preview={title}>
			<Heading style={styles.heading}>{title}</Heading>
			<Text style={styles.text}>{message}</Text>
			{actionUrl && (
				<Section style={styles.buttonSection}>
					<Button style={styles.button} href={actionUrl}>
						{actionText}
					</Button>
				</Section>
			)}
			<Text style={styles.mutedText}>— The {appName} Team</Text>
		</BaseLayout>
	);
}

/**
 * Shared styles
 */
const styles = {
	body: {
		backgroundColor: "#f6f9fc",
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
	},
	container: {
		backgroundColor: "#ffffff",
		margin: "0 auto",
		padding: "40px 20px",
		maxWidth: "600px",
		borderRadius: "8px",
	},
	heading: {
		color: "#1a1a1a",
		fontSize: "24px",
		fontWeight: "600" as const,
		lineHeight: "1.3",
		margin: "0 0 20px",
	},
	text: {
		color: "#4a4a4a",
		fontSize: "16px",
		lineHeight: "1.6",
		margin: "0 0 16px",
	},
	mutedText: {
		color: "#8898aa",
		fontSize: "14px",
		lineHeight: "1.6",
		margin: "16px 0",
	},
	buttonSection: {
		textAlign: "center" as const,
		margin: "32px 0",
	},
	button: {
		backgroundColor: "#0070f3",
		borderRadius: "6px",
		color: "#ffffff",
		fontSize: "16px",
		fontWeight: "600" as const,
		textDecoration: "none",
		textAlign: "center" as const,
		padding: "12px 24px",
	},
	link: {
		color: "#0070f3",
		textDecoration: "underline",
	},
} as const;
