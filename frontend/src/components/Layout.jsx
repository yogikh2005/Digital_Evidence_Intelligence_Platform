import React, { useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  BarChart2, 
  Users, 
  LogOut, 
  Bell, 
  Search,
  Shield, 
  Settings, 
  Activity, 
  Server
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="layout-container">
      {/* Sidebar (Crisp White Theme) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="shield-logo">
            <Shield size={22} color="#ffffff" strokeWidth={2.4} />
          </div>
          <div className="sidebar-header-text">
            <h2>DEIP <span className="badge-enterprise">v1.0</span></h2>
            <p>Digital Evidence & Forensics</p>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <div className="sidebar-section-label">Core Platform</div>
          <NavLink to="/" end className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/cases" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <FolderOpen size={19} />
            <span>Cases</span>
          </NavLink>

          <NavLink to="/evidence" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <FileText size={19} />
            <span>Evidence</span>
          </NavLink>

          <NavLink to="/reports" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <BarChart2 size={19} />
            <span>Reports</span>
          </NavLink>

          {user.role === 'ADMIN' && (
            <>
              <div className="sidebar-section-label">System Administration</div>
              <NavLink to="/users" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
                <Users size={19} />
                <span>User Management</span>
              </NavLink>

              <NavLink to="/audit" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
                <Activity size={19} />
                <span>Audit Logs</span>
              </NavLink>

              <NavLink to="/health" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
                <Server size={19} />
                <span>System Health</span>
              </NavLink>

              <NavLink to="/settings" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
                <Settings size={19} />
                <span>System Config</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status-pill">
            <span className="status-dot-pulse"></span>
            <span>Chain-of-Custody: Guarded</span>
          </div>
          <button onClick={logout} className="btn-sidebar-logout" title="Sign out of DEIP">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">Digital Evidence Intelligence Platform</div>
            <div className="topbar-search">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search cases, evidence, custody hashes..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/evidence');
                  }
                }}
              />
              <span className="search-shortcut">⌘K</span>
            </div>
          </div>
          
          <div className="topbar-right">
            <div className="system-node-badge">
              <span className="status-dot-pulse"></span>
              <span>US-EAST-01 (Operational)</span>
            </div>

            <div className="bell-icon" title="Notifications">
              <Bell size={18} />
              <span className="bell-badge">3</span>
            </div>

            <div className="user-profile">
              <span style={{fontSize: '0.88rem', fontWeight: 600, color: '#0f172a'}}>
                {user.username}
              </span>
              <span className="user-role-badge">
                {user.role ? user.role.replace('_', ' ') : 'OFFICER'}
              </span>
              <div className="avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
