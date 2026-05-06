import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Loader2 } from 'lucide-react';
import api from '../utils/api';

const TeacherMyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchAssignedStudents = async () => {
        try {
            const res = await api.get('/dashboard/teacher');
            const rawStudents = res.data.students || [];
            const mapped = rawStudents.map((s) => {
                const avg = s.progressSummary ?
                    Math.round((s.progressSummary.listeningAvg + s.progressSummary.speakingAvg + s.progressSummary.readingAvg + s.progressSummary.writingAvg) / 4)
                    : 0;
                return {
                    id: s.id,
                    name: `${s.firstName || 'Student'} ${s.lastName || ''}`.trim(),
                    email: s.email,
                    score: avg,
                    status: avg > 80 ? 'EXCELS' : avg > 60 ? 'STABLE' : 'NEEDS FOCUS'
                };
            });
            setStudents(mapped);
        } catch (error) {
            console.error('Failed to load assigned students:', error);
            setError('Unable to load assigned students.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedStudents();
    }, []);

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar role="TEACHER" />
            <main className="flex-1 p-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </main>
        </div>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar role="TEACHER" />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Students</h1>
                        <p className="text-gray-500 font-medium">Students assigned to you from your organization.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => navigate('/teacher/students')}
                            className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Assign More Students
                        </button>
                    </div>
                </header>

                <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email"
                            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition shadow-sm font-medium"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-black">
                        {error}
                    </div>
                )}

                <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
                    <table className="min-w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-gray-400">Student</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-gray-400">Email</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-gray-400">Proficiency</th>
                                <th className="px-6 py-4 font-black uppercase tracking-widest text-xs text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-gray-500 font-semibold">
                                        No assigned students yet.
                                    </td>
                                </tr>
                            ) : filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 font-black text-gray-900">{student.score}%</td>
                                    <td className="px-6 py-4 uppercase tracking-widest text-xs font-black text-gray-500">{student.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default TeacherMyStudents;
