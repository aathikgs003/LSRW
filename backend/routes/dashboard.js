const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, authorize } = require('../middleware/auth');

// Admin Dashboard Stats
router.get('/admin', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        // Keep Admin dashboard global so it aligns with OrganizationManagement totals.
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalTeachers = await prisma.user.count({ where: { role: { in: ['TEACHER', 'ADMIN'] } } });
        const totalTasks = await prisma.task.count();
        const totalAttempts = await prisma.attempt.count();

        // Skill-wise performance aggregated from attempts
        const attempts = await prisma.attempt.findMany({
            where: { status: 'COMPLETED' },
            include: { task: true }
        });

        const skillAverages = {
            LISTENING: { sum: 0, count: 0 },
            SPEAKING: { sum: 0, count: 0 },
            READING: { sum: 0, count: 0 },
            WRITING: { sum: 0, count: 0 }
        };

        attempts.forEach(att => {
            if (att.task && att.score !== null) {
                skillAverages[att.task.type].sum += att.score;
                skillAverages[att.task.type].count += 1;
            }
        });

        const skillStats = Object.keys(skillAverages).map(type => ({
            name: type.charAt(0) + type.slice(1).toLowerCase(),
            score: skillAverages[type].count > 0
                ? Math.round(skillAverages[type].sum / skillAverages[type].count)
                : 0
        }));

        // Dynamic insight based on current weakest skill.
        const weakestSkill = [...skillStats].sort((a, b) => a.score - b.score)[0];
        const insightMessage = weakestSkill
            ? `Platform-wide, ${weakestSkill.name} remains the most challenging module for users this quarter.`
            : 'Platform-wide insight is currently unavailable due to limited completed assessments.';

        // Growth data (simplified: count users signed up by month in current year)
        const currentYear = new Date().getFullYear();
        const users = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                createdAt: { gte: new Date(`${currentYear}-01-01`) }
            },
            select: { createdAt: true }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthMap = months.reduce((acc, m) => ({ ...acc, [m]: 0 }), {});

        users.forEach(u => {
            const m = months[u.createdAt.getMonth()];
            growthMap[m] += 1;
        });

        // Cumulative growth
        let cumulative = 0;
        const growthData = months.map(m => {
            cumulative += growthMap[m];
            return { month: m, users: cumulative };
        }).slice(0, new Date().getMonth() + 1);

        res.json({
            totalStudents,
            totalTeachers,
            totalTasks,
            totalAttempts,
            skillStats,
            growthData,
            instanceName: 'GLOBAL',
            insightMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
    }
});

// Teacher Dashboard Stats
router.get('/teacher', authMiddleware, authorize(['TEACHER']), async (req, res) => {
    try {
        const teacherId = req.user.id;

        const orgStudents = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                organizationId: req.user.organizationId
            },
            include: {
                progressSummary: true,
                attempts: {
                    take: 5,
                    orderBy: { submittedAt: 'desc' },
                    include: { task: true }
                }
            }
        });

        const assignedStudents = orgStudents.filter(student => student.teacherId === teacherId);
        const availableStudents = orgStudents.filter(student => !student.teacherId);

        const tasksAssigned = await prisma.task.count({
            where: { organizationId: req.user.organizationId }
        });

        const pendingReports = assignedStudents.filter(s => {
            const avgScore = s.progressSummary ?
                (s.progressSummary.listeningAvg + s.progressSummary.speakingAvg + s.progressSummary.readingAvg + s.progressSummary.writingAvg) / 4 : 0;
            return avgScore < 50 && s.attempts.length > 0;
        }).length;

        res.json({
            studentCount: assignedStudents.length,
            students: assignedStudents,
            availableStudents,
            totalOrgStudents: orgStudents.length,
            tasksAssigned,
            pendingReports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch teacher dashboard stats' });
    }
});

router.post('/teacher/students/assign', authMiddleware, authorize(['TEACHER']), async (req, res) => {
    try {
        const { studentIds } = req.body;
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ error: 'No students selected for assignment.' });
        }

        const uniqueStudentIds = [...new Set(studentIds)];
        const eligibleStudents = await prisma.user.findMany({
            where: {
                id: { in: uniqueStudentIds },
                role: 'STUDENT',
                organizationId: req.user.organizationId,
                teacherId: null
            }
        });

        if (eligibleStudents.length === 0) {
            return res.status(400).json({ error: 'No eligible students found to assign.' });
        }

        const result = await prisma.user.updateMany({
            where: {
                id: { in: eligibleStudents.map((student) => student.id) },
                role: 'STUDENT',
                organizationId: req.user.organizationId,
                teacherId: null
            },
            data: {
                teacherId: req.user.id
            }
        });

        res.json({
            assignedCount: result.count,
            assignedIds: eligibleStudents.map((student) => student.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to assign students.' });
    }
});

// Student Dashboard Stats
router.get('/student', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                organization: true,
                progressSummary: true,
                _count: {
                    select: { attempts: true }
                }
            }
        });

        const stats = [
            {
                label: 'Skill Average',
                value: user.progressSummary ? `${Math.round((user.progressSummary.listeningAvg + user.progressSummary.speakingAvg + user.progressSummary.readingAvg + user.progressSummary.writingAvg) / 4)}%` : '0%',
                trend: '+0%'
            },
            {
                label: 'Completed',
                value: user._count.attempts.toLocaleString(),
                trend: 'Recent'
            },
            {
                label: 'Global Rank',
                value: '# --', // Complex calculation, placeholder
                trend: 'Top 100%'
            },
            {
                label: 'Daily Streak',
                value: '0 Days', // Placeholder
                trend: 'New'
            },
        ];

        const assignedTasks = await prisma.attempt.findMany({
            where: {
                userId: userId,
                status: 'ASSIGNED'
            },
            include: {
                task: true
            }
        });

        res.json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                plan: user.organization.name
            },
            stats,
            assignedTasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student dashboard stats' });
    }
});

module.exports = router;
