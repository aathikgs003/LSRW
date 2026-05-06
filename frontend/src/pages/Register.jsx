import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, Building, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        organizationId: '',
        role: 'STUDENT'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/register', formData);
            const { token, user } = res.data;

            if (token) localStorage.setItem('token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('organizationId', user.organizationId || formData.organizationId || '');
            }

            if (user?.role === 'ADMIN') navigate('/admin/dashboard');
            else if (user?.role === 'TEACHER') navigate('/teacher/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Check your data and network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <Link to="/" className="absolute top-10 left-10 flex items-center text-gray-400 hover:text-primary-600 transition font-black text-xs uppercase tracking-widest">
                <ArrowLeft className="mr-2 h-4 w-4" /> Exit
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden relative"
            >
                <div className="md:flex">
                    {/* Left decorative panel */}
                    <div className="hidden md:flex md:w-1/2 items-center justify-center p-10 bg-gradient-to-br from-emerald-500 to-emerald-400">
                        <div className="w-full h-72 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white">
                            {/* Decorative placeholder — replace with an image in public/assets if desired */}
                            <div className="text-center">
                                <div className="text-2xl font-black">Welcome</div>
                                <div className="text-sm opacity-90 mt-2">Start managing your learners</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="w-full md:w-1/2 p-10">
                        <div className="text-left mb-6">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">Create Account</h1>
                            <p className="text-gray-400 font-medium text-sm">Access the NEC FluentPro ecosystem</p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-start space-x-3 text-sm font-black"
                                >
                                    <AlertCircle size={20} className="flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium"
                                            placeholder="Jane"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium"
                                            placeholder="Smith"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Organization ID / Subdomain</label>
                                <div className="relative group">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="organizationId"
                                        value={formData.organizationId}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium"
                                        placeholder="Org UUID or subdomain"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Type</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                                        >
                                            <option value="STUDENT">Student</option>
                                            <option value="TEACHER">Teacher</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Clg Mail</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium"
                                        placeholder="name@institution.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center py-3 bg-emerald-600 text-white rounded-xl font-black text-lg hover:bg-emerald-700 transition shadow-md disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <span className="flex items-center">Create Account <UserPlus className="ml-2" size={18} /></span>
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-500">
                                Already Registered? <Link to="/login" className="text-primary-600 font-black hover:underline ml-1">Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
