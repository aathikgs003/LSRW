const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Register User
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName, role, organizationId } = req.body;

    try {
        // Enforce organization check: ensure organizationId exists and matches an existing Organization
        const orgId = organizationId || req.organization?.id;
        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID is required.' });
        }

        let org = await prisma.organization.findUnique({ where: { id: orgId } });
        if (!org) {
            org = await prisma.organization.findUnique({ where: { subdomain: orgId.toLowerCase() } });
        }

        if (!org) {
            return res.status(400).json({ error: 'Invalid organization ID. Please use the Organization ID or registered organization name provided by your administrator.' });
        }

        const resolvedOrgId = org.id;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'STUDENT',
                organizationId: resolvedOrgId
            },
            include: { organization: true }
        });

        const token = jwt.sign(
            { id: user.id, role: user.role, organizationId: user.organizationId },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio,
                location: user.location,
                avatarUrl: user.avatarUrl,
                coverUrl: user.coverUrl,
                role: user.role,
                organization: user.organization
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { organization: true }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, organizationId: user.organizationId },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio,
                location: user.location,
                avatarUrl: user.avatarUrl,
                coverUrl: user.coverUrl,
                role: user.role,
                organization: user.organization
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
