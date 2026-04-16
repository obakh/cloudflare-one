# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

## Reporting a Vulnerability

We take the security of our monorepo seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do

**Report security vulnerabilities by emailing:** mbkaj@gmai.com

Include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We will keep you informed about the progress of fixing the vulnerability
- **Timeline**: We aim to address critical vulnerabilities within 7 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Contributors

1. **Never commit secrets**
   - Use `.dev.vars` for local development (gitignored)
   - Use Cloudflare secrets for production
   - Never hardcode API keys, tokens, or passwords

2. **Dependency security**
   - Keep dependencies up to date
   - Review Dependabot PRs promptly
   - Run `pnpm audit` regularly

3. **Code review**
   - All code must be reviewed before merging
   - Pay special attention to authentication and authorization logic
   - Validate all user inputs

4. **Sensitive data**
   - Never log sensitive information
   - Use encryption for sensitive data at rest
   - Use HTTPS for all external communications

### Security Features in This Monorepo

#### Authentication & Authorization
- Better Auth with session management
- CSRF protection enabled
- Secure cookie settings (httpOnly, secure, sameSite)

#### Rate Limiting
- Cloudflare Rate Limiting API integration
- Tiered rate limiting by user type
- Protection against brute force attacks

#### Security Headers
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Permissions Policy

#### Input Validation
- Zod schema validation
- SQL injection prevention via Drizzle ORM
- XSS prevention via React's built-in escaping

#### Cloudflare Security
- Turnstile CAPTCHA integration
- DDoS protection
- WAF (Web Application Firewall)
- Bot management

#### Monitoring
- Sentry error tracking
- Cloudflare Analytics
- Security event logging

## Security Checklist for New Features

When adding new features, ensure:

- [ ] All user inputs are validated
- [ ] Authentication is required where appropriate
- [ ] Authorization checks are in place
- [ ] Sensitive data is encrypted
- [ ] Rate limiting is applied to API endpoints
- [ ] Security headers are set
- [ ] No secrets are committed
- [ ] Dependencies are up to date
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't include sensitive data

## Known Security Considerations

### Cloudflare Workers Environment

- Workers run in a V8 isolate (not Node.js)
- No filesystem access
- Limited to 128MB memory
- 50ms CPU time limit (can be extended)
- Secrets stored in Cloudflare dashboard

### Database Security

- PostgreSQL via Cloudflare Hyperdrive
- Connection pooling and caching
- Prepared statements via Drizzle ORM
- Row-level security should be implemented in PostgreSQL

### Third-Party Services

We integrate with:
- Cloudflare (infrastructure)
- Sentry (error tracking)
- Better Auth (authentication)
- Resend (email)

Ensure API keys for these services are:
- Stored as Cloudflare secrets
- Rotated regularly
- Have minimal required permissions

## Security Updates

We monitor security advisories from:
- GitHub Security Advisories
- npm Security Advisories
- Cloudflare Security Bulletins
- Dependabot alerts

## Compliance

This project follows:
- OWASP Top 10 security practices
- Cloudflare security best practices
- GDPR considerations for user data

## Additional Resources

- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Better Auth Security](https://www.better-auth.com/docs/concepts/security)
- [Drizzle ORM Security](https://orm.drizzle.team/docs/security)

## Contact

For security concerns, contact: mbkaj@gmai.com

For general questions, open a GitHub issue.
