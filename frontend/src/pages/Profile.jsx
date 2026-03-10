import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
    User,
    Mail,
    Shield,
    Building2,
    Calendar,
    Edit2,
    Camera,
    MapPin,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) return null;

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar role={user.role} />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Identity Hub</h1>
                    <p className="text-gray-500 font-medium">Manage your personal presence across the LSRW ecosystem</p>
                </header>

                <div className="max-w-5xl mx-auto">
                    {/* Profile Banner/Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative"
                    >
                        <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
                            <button className="absolute bottom-6 right-10 flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/30 transition border border-white/30">
                                <Camera size={18} />
                                <span>Change Cover</span>
                            </button>
                        </div>

                        <div className="px-12 pb-12 relative">
                            <div className="flex justify-between items-end -mt-16 mb-10">
                                <div className="relative group">
                                    <div className="w-40 h-40 bg-white p-2 rounded-[2.5rem] shadow-2xl">
                                        <div className="w-full h-full bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-300 font-black text-5xl border-4 border-white overflow-hidden">
                                            <User size={64} className="text-gray-300" />
                                        </div>
                                    </div>
                                    <button className="absolute bottom-2 right-2 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:scale-110 transition cursor-pointer border-4 border-white">
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <button className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-black transition shadow-lg mb-4">
                                    <Edit2 size={18} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.firstName} {user.lastName}</h2>
                                        <div className="flex items-center space-x-4 mt-2 text-gray-500 font-medium">
                                            <div className="flex items-center space-x-1.5">
                                                <Shield size={16} className="text-primary-500" />
                                                <span className="text-primary-600 font-black text-xs uppercase tracking-widest">{user.role}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                            <div className="flex items-center space-x-1.5">
                                                <MapPin size={16} />
                                                <span>London, UK</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                <Mail size={12} />
                                                <span>Direct Contact</span>
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{user.email}</div>
                                        </div>
                                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                <Building2 size={12} />
                                                <span>Organization</span>
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">Institutional Access</div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Biography</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                            LSRW Specialist currently analyzing platform metrics for language proficiency growth. Dedicated to bridging the gap between automated assessment and human-centric feedback.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                        <h3 className="text-lg font-black text-gray-900">System Permissions</h3>
                                        <ul className="space-y-4">
                                            {[
                                                { label: "Internal Audit", active: true },
                                                { label: "Data Export", active: user.role === 'ADMIN' },
                                                { label: "User Control", active: user.role === 'ADMIN' },
                                                { label: "Asset Management", active: user.role !== 'STUDENT' },
                                            ].map((perm, i) => (
                                                <li key={i} className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-500">{perm.label}</span>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${perm.active ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-gray-200'}`}></div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-xl space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="text-[10px] font-black text-primary-400 uppercase tracking-widest flex items-center space-x-2">
                                            <Globe size={12} />
                                            <span>Network Status</span>
                                        </div>
                                        <div className="text-2xl font-black">Standard Presence</div>
                                        <p className="text-gray-400 text-xs font-medium">Your account is fully synchronized with the global education cloud.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
