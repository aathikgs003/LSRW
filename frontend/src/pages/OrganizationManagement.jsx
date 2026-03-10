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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                // This assumes an endpoint exists or we use the dashboard data
                const res = await api.get('/admin/organizations');
                setOrganizations(res.data);
            } catch (error) {
                console.error("Failed to fetch organisations:", error);
                setOrganizations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrgs();
    }, []);

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

                    <button className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30">
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
                            {organizations.map((org) => (
                                <tr key={org.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{org.name}</div>
                                                <div className="text-xs text-gray-400 font-medium">ID: ORG-00{org.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <Users size={16} className="text-gray-400" />
                                                <span className="font-bold text-gray-700">{org.students}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                                <span className="font-bold text-gray-700">{org.staff}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-bold text-gray-600">
                                        Enterprise
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                            {org.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button
                                                title="Edit Organization"
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            <button
                                                title={org.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                            >
                                                <Power size={18} />
                                            </button>

                                            <button
                                                title="Delete Organization"
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
        </div>
    );
};

export default OrganizationManagement;
