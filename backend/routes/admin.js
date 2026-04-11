const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, authorize } = require('../middleware/auth');

// Get all organizations (Super Admin / Admin level)
router.get('/organizations', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        // In a real multi-tenant app, only Super Admins might see ALL orgs.
        // For this context, we return the list of organizations.
        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        // Map data to match frontend expectations
        const mappedOrgs = organizations.map(org => ({
            id: org.id,
            name: org.name,
            students: org._count.users, // Simplified: total users in org
            staff: 1, // Placeholder for staff count logic
            status: "Active"
        }));

        res.json(mappedOrgs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

// Get all users for administration
router.get('/users', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { organizationId: req.user.organizationId },
            include: { organization: true }
        });

        const mappedUsers = users.map(u => ({
            id: u.id,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
            email: u.email,
            role: u.role,
            status: u.status
        }));

        res.json(mappedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Invite a new user
router.post('/users/invite', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { email, firstName, lastName, role } = req.body;
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                role: role || 'STUDENT',
                organizationId: req.user.organizationId,
                status: 'INVITED',
                password: 'placeholder-password' // In a real app, send an invite link
            }
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Invite error:", error);
        res.status(500).json({ error: 'Failed to invite user' });
    }
});

// Update user role
router.patch('/users/:id/role', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { role } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Update user status
router.patch('/users/:id/status', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { status } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete user
router.delete('/users/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user details (name and email)
router.put('/users/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { firstName, lastName, email, role } = req.body;
    try {
        // Validate email uniqueness if email is changed
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: { email, id: { not: req.params.id } }
            });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already strictly in use' });
            }
        }
        
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { 
                firstName, 
                lastName, 
                email,
                role
            }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: 'Failed to update user details' });
    }
});
router.delete('/users/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
