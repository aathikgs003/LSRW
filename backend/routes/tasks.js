const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, authorize } = require('../middleware/auth');

// Get all tasks for the current organization
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { organizationId: req.user.organizationId },
            include: { questions: true }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create a new task (Admin and Teacher)
router.post('/', authMiddleware, authorize(['ADMIN', 'TEACHER']), async (req, res) => {
    const { title, description, type, difficulty, timeLimit, audioUrl, passage, instructions, questions } = req.body;

    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                type,
                difficulty,
                timeLimit,
                audioUrl,
                passage,
                instructions,
                organizationId: req.user.organizationId,
                createdByRole: req.user.role,
                createdById: req.user.id,
                questions: {
                    create: (questions || []).map(q => ({
                        type: q.type,
                        questionText: q.questionText || q.text,
                        options: q.options || q.opts,
                        correctAnswer: q.correctAnswer,
                        time: q.time
                    }))
                }
            },
            include: { questions: true }
        });
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await prisma.task.findFirst({
            where: {
                id: req.params.id,
                organizationId: req.user.organizationId
            },
            include: { questions: true }
        });

        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

// Update a task
router.put('/:id', authMiddleware, authorize(['ADMIN', 'TEACHER']), async (req, res) => {
    const { title, description, type, difficulty, timeLimit, audioUrl, passage, instructions, questions } = req.body;
    try {
        const existingTask = await prisma.task.findFirst({
            where: { id: req.params.id, organizationId: req.user.organizationId }
        });

        if (!existingTask) return res.status(404).json({ error: 'Task not found' });

        const isOwner = (req.user.role === 'ADMIN' && existingTask.createdByRole === 'ADMIN') ||
            (req.user.role === 'TEACHER' && existingTask.createdById === req.user.id);

        if (!isOwner) return res.status(403).json({ error: 'Unauthorized to modify this task' });

        const task = await prisma.task.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                type,
                difficulty,
                timeLimit,
                audioUrl,
                passage,
                instructions,
                questions: {
                    deleteMany: {},
                    create: (questions || []).map(q => ({
                        type: q.type,
                        questionText: q.questionText || q.text,
                        options: q.options || q.opts,
                        correctAnswer: q.correctAnswer,
                        time: q.time
                    }))
                }
            },
            include: { questions: true }
        });
        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete a task
router.delete('/:id', authMiddleware, authorize(['ADMIN', 'TEACHER']), async (req, res) => {
    try {
        const existingTask = await prisma.task.findFirst({
            where: { id: req.params.id, organizationId: req.user.organizationId }
        });

        if (!existingTask) return res.status(404).json({ error: 'Task not found' });

        const isOwner = (req.user.role === 'ADMIN' && existingTask.createdByRole === 'ADMIN') ||
            (req.user.role === 'TEACHER' && existingTask.createdById === req.user.id);

        if (!isOwner) return res.status(403).json({ error: 'Unauthorized to delete this task' });

        await prisma.task.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;
