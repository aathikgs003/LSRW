import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
    Mail,
    Shield,
    Building2,
    Edit2,
    Camera,
    MapPin,
    Globe,
    Loader2,
    X,
    Upload,
    FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const emptyForm = {
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const initials = useMemo(() => {
        if (!profile) return 'U';
        const first = profile.firstName?.[0] || '';
        const last = profile.lastName?.[0] || '';
        return `${first}${last}`.trim() || profile.email?.[0]?.toUpperCase() || 'U';
    }, [profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile/me');
                setProfile(res.data);
                setForm({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    bio: res.data.bio || '',
                    location: res.data.location || '',
                });
                setAvatarPreview(res.data.avatarUrl || '');
                setCoverPreview(res.data.coverUrl || '');

                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
            } catch (err) {
                console.error('Profile load error:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const openEditor = () => {
        setError('');
        setIsEditOpen(true);
    };

    const closeEditor = () => {
        setIsEditOpen(false);
        setAvatarFile(null);
        setCoverFile(null);
    };

    const onAvatarPick = (file) => {
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const onCoverPick = (file) => {
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const fd = new FormData();
            fd.append('firstName', form.firstName);
            fd.append('lastName', form.lastName);
            fd.append('email', form.email);
            fd.append('bio', form.bio);
            fd.append('location', form.location);
            if (avatarFile) fd.append('avatar', avatarFile);
            if (coverFile) fd.append('cover', coverFile);

            const res = await api.patch('/profile/me', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfile(res.data);
            setForm({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                email: res.data.email || '',
                bio: res.data.bio || '',
                location: res.data.location || '',
            });
            setAvatarPreview(res.data.avatarUrl || '');
            setCoverPreview(res.data.coverUrl || '');

            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));

            closeEditor();
        } catch (err) {
            console.error('Profile save error:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar role="STUDENT" />
                <main className="flex-1 p-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary-500" size={48} />
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar role="STUDENT" />
                <main className="flex-1 p-10 flex items-center justify-center text-gray-500 font-medium">
                    {error || 'Profile unavailable.'}
                </main>
            </div>
        );
    }

    const avatarBox = avatarPreview ? (
        <img src={avatarPreview} alt="Profile avatar" className="w-full h-full object-cover" />
    ) : (
        <div className="w-full h-full bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 font-black text-5xl border-4 border-white overflow-hidden">
            {initials}
        </div>
    );

    const coverStyle = coverPreview
        ? { backgroundImage: `url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(90deg, #0284c7 0%, #4f46e5 100%)' };

    const showOrganizationCard = profile.role !== 'ADMIN';

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar role={profile.role} />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Identity Hub</h1>
                    <p className="text-gray-500 font-medium">Manage your personal presence across the LSRW ecosystem</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-medium">
                        {error}
                    </div>
                )}

                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative"
                    >
                        <div className="h-56 relative" style={coverStyle}>
                            <button
                                onClick={openEditor}
                                className="absolute bottom-6 right-10 flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/30 transition border border-white/30"
                            >
                                <Camera size={18} />
                                <span>Change Cover</span>
                            </button>
                        </div>

                        <div className="px-12 pb-12 relative">
                            <div className="flex justify-between items-end -mt-16 mb-10">
                                <div className="relative group">
                                    <div className="w-40 h-40 bg-white p-2 rounded-[2.5rem] shadow-2xl">
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden border-4 border-white relative">
                                            {avatarBox}
                                        </div>
                                    </div>
                                    <button
                                        onClick={openEditor}
                                        className="absolute bottom-2 right-2 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:scale-110 transition cursor-pointer border-4 border-white"
                                    >
                                        <Camera size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={openEditor}
                                    className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold hover:bg-black transition shadow-lg mb-4"
                                >
                                    <Edit2 size={18} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                            {profile.firstName} {profile.lastName}
                                        </h2>
                                        <div className="flex items-center space-x-4 mt-2 text-gray-500 font-medium">
                                            <div className="flex items-center space-x-1.5">
                                                <Shield size={16} className="text-primary-500" />
                                                <span className="text-primary-600 font-black text-xs uppercase tracking-widest">{profile.role}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                            <div className="flex items-center space-x-1.5">
                                                <MapPin size={16} />
                                                <span>{profile.location || 'Add your location'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid ${showOrganizationCard ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
                                        <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                <Mail size={12} />
                                                <span>Direct Contact</span>
                                            </div>
                                            <div className="text-lg font-bold text-gray-900">{profile.email}</div>
                                        </div>
                                        {showOrganizationCard && (
                                            <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                    <Building2 size={12} />
                                                    <span>Organization</span>
                                                </div>
                                                <div className="text-lg font-bold text-gray-900">{profile.organization?.name || 'Institutional Access'}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Biography</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                            {profile.bio || 'Add a short biography to describe your role, goals, or responsibilities in the platform.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                        <h3 className="text-lg font-black text-gray-900">System Permissions</h3>
                                        <ul className="space-y-4">
                                            {[
                                                { label: 'Internal Audit', active: true },
                                                { label: 'Data Export', active: profile.role === 'ADMIN' },
                                                { label: 'User Control', active: profile.role === 'ADMIN' },
                                                { label: 'Asset Management', active: profile.role !== 'STUDENT' },
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
                                        <div className="text-2xl font-black">{profile.status === 'ACTIVE' ? 'Standard Presence' : profile.status}</div>
                                        <p className="text-gray-400 text-xs font-medium">Your account is fully synchronized with the global education cloud.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isEditOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">Edit Profile</h2>
                                        <p className="text-gray-500 font-medium">Update your details and profile media</p>
                                    </div>
                                    <button onClick={closeEditor} className="p-3 rounded-full hover:bg-gray-100 text-gray-400 transition">
                                        <X size={22} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="p-8 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">First Name</label>
                                            <input
                                                value={form.firstName}
                                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                                            <input
                                                value={form.lastName}
                                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</label>
                                            <input
                                                value={form.location}
                                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                                placeholder="London, UK"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bio</label>
                                            <input
                                                value={form.bio}
                                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                                placeholder="Tell people a little about yourself"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                <Upload size={14} />
                                                <span>Avatar</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => avatarInputRef.current?.click()}
                                                className="w-full py-4 bg-white rounded-2xl border border-dashed border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                Choose Profile Image
                                            </button>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => onAvatarPick(e.target.files?.[0])}
                                            />
                                            <p className="text-xs text-gray-400">Uploaded to Cloudinary</p>
                                        </div>

                                        <div className="space-y-3 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                                                <FileText size={14} />
                                                <span>Cover</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => coverInputRef.current?.click()}
                                                className="w-full py-4 bg-white rounded-2xl border border-dashed border-gray-200 font-bold text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                Choose Cover Image
                                            </button>
                                            <input
                                                ref={coverInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => onCoverPick(e.target.files?.[0])}
                                            />
                                            <p className="text-xs text-gray-400">Uploaded to Cloudinary</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeEditor}
                                            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 flex items-center space-x-2 disabled:opacity-60"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={20} /> : <span>Save Changes</span>}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Profile;