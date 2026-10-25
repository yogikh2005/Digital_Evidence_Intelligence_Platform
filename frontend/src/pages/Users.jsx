import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit2, Trash2, X, Shield, Mail, Key } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: 'INVESTIGATING_OFFICER' });
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Modal Dialog (Crisp White Theme) */}
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
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
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
                        <div style={{ color: '#0f172a' }}>{u.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>ID: #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">
                      {u.role ? u.role.replace('_', ' ') : 'USER'}
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
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="action-btn action-edit" title="Edit Permissions">
                        <Edit2 size={15} />
                      </button>
                      <button className="action-btn action-delete" title="Deactivate User">
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
