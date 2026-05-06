const { PrismaClient } = require('@prisma/client');

// Build DATABASE_URL from structured env vars when not provided directly.
// This lets .env keep DB fields separate (host, user, password, etc.).
if (!process.env.DATABASE_URL) {
	const host = process.env.DB_HOST || 'localhost';
	const port = process.env.DB_PORT || '3306';
	const name = process.env.DB_NAME || '';
	const user = encodeURIComponent(process.env.DB_USER || '');
	const password = encodeURIComponent(process.env.DB_PASSWORD || '');

	if (name && user) {
		process.env.DATABASE_URL = `mysql://${user}:${password}@${host}:${port}/${name}`;
	}
}

const prisma = new PrismaClient();

module.exports = prisma;
