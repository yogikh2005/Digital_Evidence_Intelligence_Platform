import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, X, Shield, Mail, Key, UserCheck, AlertCircle } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: 'INVESTIGATING_OFFICER' });
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'INVESTIGATING_OFFICER',
    is_active: true,
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    api.get('/auth/users/').then(res => {
      setUsers(res.data);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/users/', newUser);
      setShowModal(false);
      setNewUser({ username: '', password: '', email: '', role: 'INVESTIGATING_OFFICER' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u);
    setEditFormData({
      username: u.username || '',
      email: u.email || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      role: u.role || 'INVESTIGATING_OFFICER',
      is_active: u.is_active !== false,
      password: ''
    });
    setError('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        username: editFormData.username,
        email: editFormData.email,
        first_name: editFormData.first_name,
        last_name: editFormData.last_name,
        role: editFormData.role,
        is_active: editFormData.is_active
      };
      if (editFormData.password.trim()) {
        payload.password = editFormData.password.trim();
      }
      await api.patch(`/auth/users/${editingUser.id}/`, payload);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.detail || 
        (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : 'Failed to update user.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (currentUser && currentUser.id === u.id) {
      alert("You cannot delete your own logged-in admin account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete or deactivate user "${u.username}"?`)) {
      return;
    }
    try {
      const res = await api.delete(`/auth/users/${u.id}/`);
      if (res.data?.detail) {
        alert(res.data.detail);
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Configure system users, role-based privileges and access status</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-dialog">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Create User Account</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Assign system permissions and access credentials</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {error && <div className="error-msg">{error}</div>}
              
              <form onSubmit={handleAddUser}>
                <div className="input-group">
                  <label>Username <span className="required">*</span></label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. officer_smith"
                    value={newUser.username} 
                    onChange={e => setNewUser({...newUser, username: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="e.g. smith@police.gov"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Initial Password <span className="required">* (min 8 characters)</span></label>
                  <input 
                    required 
                    type="password" 
                    minLength="8" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Assigned Role <span className="required">*</span></label>
                  <select 
                    className="form-control" 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="INVESTIGATING_OFFICER">Investigating Officer</option>
                    <option value="EVIDENCE_OFFICER">Evidence Officer</option>
                    <option value="FORENSIC_OFFICER">Forensic Officer</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }} 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}>
          <div className="modal-dialog">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit User: {editingUser.username}</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Update profile, role permissions, or status</p>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {error && <div className="error-msg">{error}</div>}
              
              <form onSubmit={handleUpdateUser}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="input-group">
                    <label>First Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="First Name"
                      value={editFormData.first_name} 
                      onChange={e => setEditFormData({...editFormData, first_name: e.target.value})} 
                    />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Last Name"
                      value={editFormData.last_name} 
                      onChange={e => setEditFormData({...editFormData, last_name: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Username <span className="required">*</span></label>
                  <input 
                    required 
                    type="text" 
                    className="form-control" 
                    value={editFormData.username} 
                    onChange={e => setEditFormData({...editFormData, username: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={editFormData.email} 
                    onChange={e => setEditFormData({...editFormData, email: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label>Assigned Role <span className="required">*</span></label>
                  <select 
                    className="form-control" 
                    value={editFormData.role} 
                    onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                  >
                    <option value="INVESTIGATING_OFFICER">Investigating Officer</option>
                    <option value="EVIDENCE_OFFICER">Evidence Officer</option>
                    <option value="FORENSIC_OFFICER">Forensic Officer</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Account Status</label>
                  <select 
                    className="form-control" 
                    value={editFormData.is_active ? 'true' : 'false'} 
                    onChange={e => setEditFormData({...editFormData, is_active: e.target.value === 'true'})}
                  >
                    <option value="true">Active</option>
                    <option value="false">Suspended / Deactivated</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Reset Password <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Leave blank to keep current password)</span></label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="New password (optional)"
                    value={editFormData.password} 
                    onChange={e => setEditFormData({...editFormData, password: e.target.value})} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }} 
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-input-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search users by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Administrator</option>
          <option value="INVESTIGATING_OFFICER">Investigating Officer</option>
          <option value="EVIDENCE_OFFICER">Evidence Officer</option>
          <option value="FORENSIC_OFFICER">Forensic Officer</option>
          <option value="SUPERVISOR">Supervisor</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Officer / User</th>
                <th>Access Role</th>
                <th>Official Email</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="officer-avatar">
                        {u.username ? u.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ color: '#0f172a' }}>
                          {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                          @{u.username} &bull; ID: #{u.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {u.role ? u.role.replace(/_/g, ' ') : 'USER'}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>
                    {u.email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No email registered</span>}
                  </td>
                  <td>
                    <span className={`status-pill ${u.is_active !== false ? 'status-closed' : 'status-review'}`}>
                      {u.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                      <button 
                        className="action-btn action-edit" 
                        title="Edit User Details & Permissions"
                        onClick={() => handleEditClick(u)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        className="action-btn action-delete" 
                        title={currentUser?.id === u.id ? "Cannot delete own account" : "Delete or Deactivate User"}
                        onClick={() => handleDeleteUser(u)}
                        style={{ 
                          cursor: currentUser?.id === u.id ? 'not-allowed' : 'pointer',
                          opacity: currentUser?.id === u.id ? 0.4 : 1 
                        }}
                        disabled={currentUser?.id === u.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No users found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
