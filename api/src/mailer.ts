import nodemailer, { Transporter } from 'nodemailer';
import env from './env';
import logger from './logger';
import { getConfigFromEnv } from './utils/get-config-from-env';

let transporter: Transporter;

export default function getMailer(): Transporter {
	if (transporter) return transporter;

	if (env.EMAIL_TRANSPORT === 'sendmail') {
		transporter = nodemailer.createTransport({
			sendmail: true,
			newline: env.EMAIL_SENDMAIL_NEW_LINE || 'unix',
			path: env.EMAIL_SENDMAIL_PATH || '/usr/sbin/sendmail',
		});
	} else if (env.EMAIL_TRANSPORT.toLowerCase() === 'smtp') {
		let auth: boolean | { user?: string; pass?: string } = false;

		if (env.EMAIL_SMTP_USER || env.EMAIL_SMTP_PASSWORD) {
			auth = {
				user: env.EMAIL_SMTP_USER,
				pass: env.EMAIL_SMTP_PASSWORD,
			};
		}

		const tls: Record<string, unknown> = getConfigFromEnv('EMAIL_SMTP_TLS_');

		transporter = nodemailer.createTransport({
			pool: env.EMAIL_SMTP_POOL,
			host: env.EMAIL_SMTP_HOST,
			port: env.EMAIL_SMTP_PORT,
			secure: env.EMAIL_SMTP_SECURE,
			ignoreTLS: env.EMAIL_SMTP_IGNORE_TLS,
			auth,
			tls,
		} as Record<string, unknown>);
	} else if (env.EMAIL_TRANSPORT.toLowerCase() === 'mailgun') {
		const mg = require('nodemailer-mailgun-transport');
		transporter = nodemailer.createTransport(
			mg({
				auth: {
					api_key: env.EMAIL_MAILGUN_API_KEY,
					domain: env.EMAIL_MAILGUN_DOMAIN,
				},
				host: env.EMAIL_MAILGUN_HOST || 'https://api.mailgun.net',
			}) as any
		);
	} else {
		logger.warn('Illegal transport given for email. Check the EMAIL_TRANSPORT env var.');
	}

	return transporter;
}
