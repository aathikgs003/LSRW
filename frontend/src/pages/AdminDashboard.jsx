import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
    Users,
    BookOpen,
    CheckCircle2,
    TrendingUp,
    Globe,
    AlertTriangle,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { Loader2 } from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/admin');
                setStats(res.data);
            } catch (error) {
                console.error("Admin Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const navigateToCreate = () => {
        window.location.href = '/admin/tasks';
    };

    if (loading) return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar role="ADMIN" />
            <main className="flex-1 p-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </main>
        </div>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar role="ADMIN" />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Control</h1>
                        <p className="text-gray-500 font-medium">Global analytics and institutional oversight</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm">
                            <Globe size={18} />
                            <span>Instance: {stats.instanceName || 'N/A'}</span>
                        </button>
                        <button
                            onClick={navigateToCreate}
                            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
                        >
                            <Plus size={18} />
                            <span>Create New Task</span>
                        </button>
                    </div>
                </header>

                {/* Global Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Network Students', value: stats.totalStudents, icon: <Users />, color: 'primary' },
                        { label: 'Active Educators', value: stats.totalTeachers, icon: <AlertTriangle />, color: 'emerald' },
                        { label: 'Curated Tasks', value: stats.totalTasks, icon: <BookOpen />, color: 'amber' },
                        { label: 'Total Assessments', value: stats.totalAttempts, icon: <CheckCircle2 />, color: 'rose' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
                                {React.cloneElement(stat.icon, { size: 28 })}
                            </div>
                            <div>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{stat.value.toLocaleString()}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-gray-900 flex items-center space-x-3">
                                <TrendingUp className="text-primary-500" />
                                <span>Platform Growth</span>
                            </h3>
                            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-xs uppercase text-gray-500">
                                <option>Last 6 Months</option>
                                <option>Yearly</option>
                            </select>
                        </div>
                        <div>
                            <ResponsiveContainer width="100%" aspect={2.5}>
                                <AreaChart data={stats.growthData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontWeight: 'bold', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-black text-gray-900 mb-8">Skill Proficiency</h3>
                        <div className="space-y-8">
                            {stats.skillStats.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="font-black text-gray-700 text-sm uppercase tracking-wider">{skill.name}</span>
                                        <span className="text-xl font-black text-primary-600">{skill.score}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.score}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-primary-500 rounded-full shadow-sm"
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-primary-50 rounded-3xl border border-primary-100 italic text-sm text-primary-700 font-medium">
                            "{stats.insightMessage || 'Platform-wide insight is currently unavailable due to limited completed assessments.'}"
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
