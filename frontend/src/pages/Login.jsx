import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('organizationId');
        navigate('/register', { replace: true });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
                    else if (user.role === 'TEACHER') navigate('/teacher/dashboard', { replace: true });
                    else navigate('/dashboard', { replace: true });
                } catch (e) {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('organizationId', user.organizationId);

            // Redirect based on role
            if (user.role === 'ADMIN') navigate('/admin/dashboard');
            else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
            else navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <Link to="/" className="absolute top-10 left-10 flex items-center text-gray-400 hover:text-primary-600 transition font-black text-xs uppercase tracking-widest">
                <ArrowLeft className="mr-2 h-4 w-4" /> Exit Portal
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden relative"
            >
                <div className="md:flex">
                    {/* Left: Image */}
                    <div className="hidden md:flex md:w-1/2 items-center justify-center p-10 bg-gradient-to-br from-primary-600 to-indigo-400">
                        <div className="w-full h-72 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-white">
                            <div className="text-center">
                                <div className="text-2xl font-black">Welcome Back</div>
                                <div className="text-sm opacity-90 mt-2">Sign in to continue</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="w-full md:w-1/2 p-10">
                        <div className="text-left mb-6">
                            <div className="text-3xl font-black gradient-text tracking-tighter mb-1">NEC FluentPro</div>
                            <p className="text-gray-400 font-medium text-sm">Intelligence Assessment Portal</p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-start space-x-3 text-sm font-bold"
                                >
                                    <AlertCircle size={18} className="flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Username</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium text-gray-700"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium text-gray-700"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center py-3 bg-primary-600 text-white rounded-xl font-black text-lg hover:bg-primary-700 transition shadow-md disabled:opacity-60"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <span className="flex items-center">Login <LogIn className="ml-2" size={18} /></span>
                                )}
                            </button>

                            <div className="text-center text-sm text-gray-500">
                                Continue without account{' '}
                                <button onClick={handleSignOut} className="text-primary-600 font-black hover:underline ml-2">Sign Up</button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
