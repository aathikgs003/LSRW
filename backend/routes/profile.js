const express = require('express');
const multer = require('multer');
const { PassThrough } = require('stream');
const router = express.Router();
const prisma = require('../config/prisma');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const readable = new PassThrough();
        readable.end(buffer);
        readable.pipe(stream);
    });
};

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { organization: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            location: user.location,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverUrl,
            role: user.role,
            status: user.status,
            organization: user.organization,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
});

router.patch(
    '/me',
    authMiddleware,
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { firstName, lastName, email, bio, location } = req.body;
            const avatarFile = req.files?.avatar?.[0];
            const coverFile = req.files?.cover?.[0];

            if (email && email !== req.user.email) {
                const existingUser = await prisma.user.findFirst({
                    where: { email, id: { not: req.user.id } }
                });
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
            }

            const updateData = {
                firstName,
                lastName,
                email,
                bio,
                location,
            };

            if (avatarFile) {
                const uploadedAvatar = await uploadBufferToCloudinary(avatarFile.buffer, 'lsrw/profiles/avatars');
                updateData.avatarUrl = uploadedAvatar.secure_url;
            }

            if (coverFile) {
                const uploadedCover = await uploadBufferToCloudinary(coverFile.buffer, 'lsrw/profiles/covers');
                updateData.coverUrl = uploadedCover.secure_url;
            }

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: updateData,
                include: { organization: true }
            });

            res.json({
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                bio: updatedUser.bio,
                location: updatedUser.location,
                avatarUrl: updatedUser.avatarUrl,
                coverUrl: updatedUser.coverUrl,
                role: updatedUser.role,
                status: updatedUser.status,
                organization: updatedUser.organization,
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
);

module.exports = router;
