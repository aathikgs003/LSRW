import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
    Layers,
    Plus,
    Search,
    Building2,
    Users,
    CheckCircle2,
    Loader2,
    Edit2,
    Power,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const OrganizationManagement = () => {
    const [organizations, setOrganizations] = useState([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subdomain: '',
        license: 'Institutional',
        status: 'Active'
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchOrgs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/organizations');
            setOrganizations(res.data);
            setFilteredOrganizations(res.data);
        } catch (error) {
            console.error("Failed to fetch organisations:", error);
            setOrganizations([]);
            setFilteredOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrgs();
    }, []);

    useEffect(() => {
        const results = organizations.filter(org => 
            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (org.subdomain && org.subdomain.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredOrganizations(results);
    }, [searchTerm, organizations]);

    const handleOpenModal = (org = null) => {
        if (org) {
            setEditingOrg(org);
            setFormData({
                name: org.name,
                subdomain: org.subdomain || '',
                license: org.license || 'Enterprise',
                status: org.status || 'Active'
            });
        } else {
            setEditingOrg(null);
            setFormData({
                name: '',
                subdomain: '',
                license: 'Institutional',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingOrg(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Final validation check
        if (!formData.name.trim() || !formData.subdomain.trim()) {
            alert("All fields are required. Please fill in the Organization Name and Subdomain.");
            return;
        }

        setIsSaving(true);
        try {
            if (editingOrg) {
                await api.put(`/admin/organizations/${editingOrg.id}`, formData);
            } else {
                await api.post('/admin/organizations', formData);
            }
            await fetchOrgs();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save organization:", error);
            alert(error.response?.data?.error || "Failed to save organization");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this organization? This action cannot be undone.")) return;
        
        try {
            await api.delete(`/admin/organizations/${id}`);
            await fetchOrgs();
        } catch (error) {
            console.error("Failed to delete organization:", error);
            alert(error.response?.data?.error || "Failed to delete organization. Ensure it has no active students.");
        }
    };

    const toggleStatus = async (org) => {
        const newStatus = org.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.put(`/admin/organizations/${org.id}`, { ...org, status: newStatus });
            await fetchOrgs();
        } catch (error) {
            console.error("Failed to toggle status:", error);
            alert("Failed to update status");
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
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Institutional Network</h1>
                        <p className="text-gray-500 font-medium">Manage multi-tenant organizations and licenses</p>
                    </div>

                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
                    >
                        <Plus size={18} />
                        <span>Add Organization</span>
                    </button>
                </header>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <div className="relative w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-medium"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Organization</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Active Users</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">License</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-10 py-5 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrganizations.map((org) => (
                                <tr key={org.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 overflow-hidden">
                                                {org.logoUrl ? (
                                                    <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{org.name}</div>
                                                <div className="text-xs text-gray-400 font-medium truncate w-48">
                                                    {org.subdomain ? `${org.subdomain}.fluentpro.com` : `ID: ...${org.id.slice(-6)}`}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center space-x-2" title="Students">
                                                <Users size={16} className="text-gray-400" />
                                                <span className="font-bold text-gray-700">{org.students}</span>
                                            </div>
                                            <div className="flex items-center space-x-2" title="Staff">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                <span className="font-bold text-gray-700">{org.staff}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-xs">
                                            {org.license}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                                            org.status === 'Active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleOpenModal(org)}
                                                title="Edit Organization"
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                onClick={() => toggleStatus(org)}
                                                title={org.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                className={`p-2.5 bg-gray-50 rounded-xl transition-all ${
                                                    org.status === 'Active' 
                                                    ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' 
                                                    : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                <Power size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(org.id)}
                                                title="Delete Organization"
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrganizations.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center text-gray-400 font-medium">
                                        No organizations found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingOrg ? 'Edit Organization' : 'Add New Organization'}
                            </h2>
                            <p className="text-gray-500 font-medium">Configure network node details</p>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Organization Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Stanford University"
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Subdomain</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        value={formData.subdomain}
                                        onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        placeholder="stanford"
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-medium pr-32"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                                        .fluentpro.com
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">License Plan</label>
                                    <div className="w-full px-6 py-4 bg-gray-100/50 border-none rounded-2xl font-bold text-gray-500 flex items-center">
                                        Institutional
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Initial Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-100 transition font-bold text-gray-700"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <span>{editingOrg ? 'Update Node' : 'Initialize Node'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default OrganizationManagement;
