import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import {
    Users,
    UserPlus,
    Search,
    ShieldCheck,
    Mail,
    MoreVertical,
    Loader2,
    X,
    Trash2,
    CheckCircle,
    UserCircle,
    Power,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [organizationFilter, setOrganizationFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteData, setInviteData] = useState({ email: '', firstName: '', lastName: '', role: 'STUDENT' });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ id: '', email: '', firstName: '', lastName: '', role: 'STUDENT' });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("User fetch error:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const organizations = useMemo(() => {
        const map = new Map();
        users.forEach((u) => {
            if (u.organizationId && !map.has(u.organizationId)) {
                map.set(u.organizationId, u.organizationName || 'N/A');
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (organizationFilter === 'ALL' || u.organizationId === organizationFilter || u.role === 'ADMIN') &&
            (roleFilter === 'ALL' || u.role === roleFilter)
        );
    }, [users, searchQuery, organizationFilter, roleFilter]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users/invite', inviteData);
            setShowInviteModal(false);
            setInviteData({ email: '', firstName: '', lastName: '', role: 'STUDENT' });
            fetchUsers();
            alert('User invited successfully!');
        } catch (error) {
            console.error("Invite error:", error);
            alert(error.response?.data?.error || 'Failed to invite user');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${editData.id}`, editData);
            setShowEditModal(false);
            fetchUsers();
            alert('User updated successfully!');
        } catch (error) {
            console.error("Update error:", error);
            alert(error.response?.data?.error || 'Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.patch(`/admin/users/${id}/status`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert('Failed to update status');
        }
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
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Access Control</h1>
                        <p className="text-gray-500 font-medium">Global user roles and security permissions</p>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); setShowInviteModal(true); }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition shadow-lg"
                    >
                        <UserPlus size={18} />
                        <span>Invite User</span>
                    </button>
                </header>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center gap-6">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Filter by email or name..."
                                    className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-medium"
                                />
                            </div>

                            <select
                                value={organizationFilter}
                                onChange={(e) => setOrganizationFilter(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold text-xs uppercase tracking-widest text-gray-600"
                            >
                                <option value="ALL">All Organizations</option>
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold text-xs uppercase tracking-widest text-gray-600"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="STUDENT">Student</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium whitespace-nowrap">
                            <Users size={16} />
                            <span>{filteredUsers.length} total users</span>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Global Role</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-black">
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{u.name}</div>
                                                <div className="flex items-center space-x-2 text-xs text-gray-400 font-medium">
                                                    <Mail size={12} />
                                                    <span>{u.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-2">
                                            <ShieldCheck size={16} className={u.role === 'ADMIN' ? 'text-primary-500' : 'text-gray-400'} />
                                            <span className={`font-black text-xs uppercase tracking-widest ${u.role === 'ADMIN' ? 'text-primary-600' : 'text-gray-600'}`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${u.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : u.status === 'INVITED'
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            {u.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => {
                                                        setEditData({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role });
                                                        setShowEditModal(true);
                                                    }}
                                                    title="Edit Details"
                                                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleToggleStatus(u.id, u.status)}
                                                title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                            >
                                                <Power size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                title="Delete User"
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowInviteModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="p-3 bg-gray-900 text-white rounded-2xl">
                                    <UserCircle size={24} />
                                </div>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 mb-2">Invite New User</h2>
                            <p className="text-gray-500 font-medium mb-8">Send an invitation to join your organization.</p>

                            <form onSubmit={handleInvite} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={inviteData.firstName}
                                            onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                            placeholder="Alex"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={inviteData.lastName}
                                            onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                            placeholder="Learner"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteData.email}
                                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold"
                                        placeholder="alex@fluentpro.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Global Role</label>
                                    <select
                                        value={inviteData.role}
                                        onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold appearance-none"
                                    >
                                        <option value="STUDENT">STUDENT</option>
                                        <option value="TEACHER">TEACHER</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg hover:bg-black transition shadow-xl mt-4"
                                >
                                    Send Invitation
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="p-3 bg-indigo-900 text-white rounded-2xl">
                                    <Edit2 size={24} />
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 mb-2">Edit User Details</h2>
                            <p className="text-gray-500 font-medium mb-8">Update the profile and system access levels.</p>

                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.firstName}
                                            onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.lastName}
                                            onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Global Role</label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-100 transition font-bold appearance-none"
                                    >
                                        <option value="STUDENT">STUDENT</option>
                                        <option value="TEACHER">TEACHER</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition shadow-xl mt-4 border-none"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
