/**
 * Internationalization utilities
 * Uses @repo/i18n for locale detection and translations
 */
import {
	createTranslator,
	detectLocale,
	interpolate,
	type LocaleDetectionResult,
	type Translations,
} from "@repo/i18n";

export { detectLocale, interpolate };
export type { Translations, LocaleDetectionResult };

/**
 * Supported locales
 */
export const SUPPORTED_LOCALES = ["en", "es", "fr", "de", "ja", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Flat translation dictionary for the app
 */
export const translations: Record<SupportedLocale, Record<string, string>> = {
	en: {
		"common.save": "Save",
		"common.cancel": "Cancel",
		"common.delete": "Delete",
		"common.edit": "Edit",
		"common.loading": "Loading...",
		"common.error": "An error occurred",
		"common.success": "Success",
		"common.confirm": "Confirm",
		"nav.dashboard": "Dashboard",
		"nav.activity": "Activity",
		"nav.insights": "Insights",
		"nav.vault": "Vault",
		"nav.settings": "Settings",
		"auth.signIn": "Sign in",
		"auth.signUp": "Sign up",
		"auth.signOut": "Sign out",
		"auth.forgotPassword": "Forgot password?",
		"auth.resetPassword": "Reset password",
		"auth.email": "Email",
		"auth.password": "Password",
		"auth.name": "Name",
		"settings.general": "General",
		"settings.profile": "Profile",
		"settings.team": "Team",
		"settings.members": "Members",
		"settings.billing": "Billing",
		"settings.notifications": "Notifications",
		"settings.integrations": "Integrations",
		"settings.api": "API Keys",
		"billing.currentPlan": "Current Plan",
		"billing.upgrade": "Upgrade",
		"billing.downgrade": "Downgrade",
		"billing.cancel": "Cancel subscription",
		"billing.paymentMethod": "Payment Method",
		"billing.invoices": "Invoices",
	},
	es: {
		"common.save": "Guardar",
		"common.cancel": "Cancelar",
		"nav.dashboard": "Panel",
		"auth.signIn": "Iniciar sesión",
	},
	fr: {
		"common.save": "Enregistrer",
		"common.cancel": "Annuler",
		"nav.dashboard": "Tableau de bord",
		"auth.signIn": "Se connecter",
	},
	de: {
		"common.save": "Speichern",
		"common.cancel": "Abbrechen",
		"nav.dashboard": "Dashboard",
		"auth.signIn": "Anmelden",
	},
	ja: {
		"common.save": "保存",
		"common.cancel": "キャンセル",
		"nav.dashboard": "ダッシュボード",
		"auth.signIn": "ログイン",
	},
	zh: {
		"common.save": "保存",
		"common.cancel": "取消",
		"nav.dashboard": "仪表板",
		"auth.signIn": "登录",
	},
};

/**
 * Create translator for the app
 * Uses @repo/i18n createTranslator with proper options format
 */
export function createAppTranslator(_locale: SupportedLocale = "en") {
	return createTranslator({
		translations,
		defaultLocale: "en",
	});
}

/**
 * Translation hook context type
 */
export interface TranslationContext {
	locale: SupportedLocale;
	t: ReturnType<typeof createTranslator>;
	setLocale: (locale: SupportedLocale) => void;
}
