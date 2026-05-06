const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, authorize } = require('../middleware/auth');

// Get all organizations (Super Admin / Admin level)
router.get('/organizations', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    console.log("GET /organizations hit");
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                users: {
                    select: { role: true }
                },
                subscriptions: {
                    orderBy: { startDate: 'desc' },
                    take: 1
                }
            }
        });

        // Map data to match frontend expectations
        const mappedOrgs = organizations.map(org => {
            const staffCount = org.users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN').length;
            const studentCount = org.users.filter(u => u.role === 'STUDENT').length;
            const latestSubscription = org.subscriptions[0];

            return {
                id: org.id,
                name: org.name,
                subdomain: org.subdomain,
                logoUrl: org.logoUrl,
                students: studentCount,
                staff: staffCount,
                status: latestSubscription ? (latestSubscription.status === 'ACTIVE' ? 'Active' : 'Inactive') : 'Active',
                license: latestSubscription ? latestSubscription.plan : 'Institutional'
            };
        });

        res.json(mappedOrgs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

// Create a new organization
router.post('/organizations', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { name, subdomain, logoUrl, license } = req.body;
    console.log("POST /organizations hit:", { name, subdomain });
    
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Organization name is required' });
    }

    try {
        const subdomainValue = subdomain || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        const newOrg = await prisma.organization.create({
            data: {
                name,
                subdomain: subdomainValue,
                logoUrl,
                subscriptions: {
                    create: {
                        plan: license || 'Institutional',
                        status: 'ACTIVE'
                    }
                }
            }
        });
        res.status(201).json(newOrg);
    } catch (error) {
        console.error("Create organization error:", error);
        res.status(500).json({ error: 'Failed to create organization. Subdomain might be taken.' });
    }
});

// Update an organization
router.put('/organizations/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    const { name, subdomain, logoUrl, license, status } = req.body;
    console.log(`PUT /organizations/${req.params.id} hit:`, { name, status });

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Organization name is required' });
    }
    
    try {
        const updatedOrg = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.update({
                where: { id: req.params.id },
                data: { name, subdomain, logoUrl }
            });

            if (license || status) {
                const latest = await tx.subscription.findFirst({
                    where: { organizationId: req.params.id },
                    orderBy: { startDate: 'desc' }
                });

                if (latest) {
                    await tx.subscription.update({
                        where: { id: latest.id },
                        data: {
                            plan: license || latest.plan,
                            status: status ? (status === 'Active' ? 'ACTIVE' : 'INACTIVE') : latest.status
                        }
                    });
                } else if (license || status) {
                    await tx.subscription.create({
                        data: {
                            organizationId: req.params.id,
                            plan: license || 'Institutional',
                            status: status === 'Active' ? 'ACTIVE' : 'INACTIVE'
                        }
                    });
                }
            }
            return org;
        });

        res.json(updatedOrg);
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: 'Failed to update organization' });
    }
});

// Delete an organization
router.delete('/organizations/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        await prisma.organization.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
        console.error("Delete organization error:", error);
        res.status(500).json({ error: 'Could not delete organization. It might have active users or tasks associated with it.' });
    }
});

// Get all users for administration
router.get('/users', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            // Admin panel shows global users across organizations
            include: { organization: true }
        });

        const mappedUsers = users.map(u => ({
            id: u.id,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
            email: u.email,
            role: u.role,
            status: u.status,
            organizationId: u.organizationId,
            organizationName: u.role === 'ADMIN' ? 'GLOBAL' : (u.organization?.name || 'N/A')
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
                status: 'ACTIVE',
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
        if (!['STUDENT', 'TEACHER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Only STUDENT or TEACHER are allowed.' });
        }

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
        if (role && !['STUDENT', 'TEACHER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Only STUDENT or TEACHER are allowed.' });
        }

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
