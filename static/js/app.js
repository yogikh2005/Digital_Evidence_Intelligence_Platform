const API_BASE = '/api';

// State
let token = localStorage.getItem('deip_token');
let userRole = localStorage.getItem('deip_role');
let username = localStorage.getItem('deip_username');

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const casesList = document.getElementById('cases-list');
const evidenceList = document.getElementById('evidence-list');

// Init
function init() {
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Navigation
function showLogin() {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
}

function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-role-badge').textContent = userRole.replace('_', ' ');
    
    fetchCases();
    fetchEvidence();
}

// Auth
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const btn = loginForm.querySelector('button');
    btn.textContent = 'Authenticating...';
    btn.disabled = true;

    try {
        const formData = new FormData(loginForm);
        const res = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (res.ok) {
            token = data.access;
            userRole = data.role;
            username = data.username;
            localStorage.setItem('deip_token', token);
            localStorage.setItem('deip_role', userRole);
            localStorage.setItem('deip_username', username);
            showDashboard();
        } else {
            loginError.textContent = data.detail || 'Invalid credentials.';
        }
    } catch (err) {
        loginError.textContent = 'Connection error.';
    } finally {
        btn.textContent = 'Access System';
        btn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.clear();
    showLogin();
});

// API Calls
async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (res.status === 401) { logoutBtn.click(); throw new Error('Unauthorized'); }
    return res.json();
}

async function fetchCases() {
    casesList.innerHTML = '<div class="loader"></div>';
    try {
        const cases = await apiGet('/cases/');
        if (cases.length === 0) {
            casesList.innerHTML = '<p style="color:var(--text-muted);text-align:center;margin-top:2rem;">No active cases found.</p>';
            return;
        }
        
        casesList.innerHTML = cases.map(c => `
            <div class="data-card">
                <div class="data-card-header">
                    <span class="data-card-title">${c.case_number}: ${c.title}</span>
                    <span class="status-pill status-${c.status.toLowerCase()}">${c.status}</span>
                </div>
                <div class="data-card-body">
                    ${c.description || 'No description provided.'}
                </div>
            </div>
        `).join('');
    } catch (err) {
        casesList.innerHTML = '<p class="error-msg">Failed to load cases.</p>';
    }
}

async function fetchEvidence() {
    evidenceList.innerHTML = '<div class="loader"></div>';
    try {
        const evidence = await apiGet('/evidence/');
        if (evidence.length === 0) {
            evidenceList.innerHTML = '<p style="color:var(--text-muted);text-align:center;margin-top:2rem;">No evidence records found.</p>';
            return;
        }
        
        evidenceList.innerHTML = evidence.map(e => `
            <div class="data-card">
                <div class="data-card-header">
                    <span class="data-card-title">${e.original_filename}</span>
                    <span class="status-pill">${e.status}</span>
                </div>
                <div class="data-card-body">
                    Type: ${e.evidence_type} | Size: ${(e.file_size / 1024 / 1024).toFixed(2)} MB<br>
                    <span style="font-family:monospace;font-size:0.7rem;color:var(--primary)">SHA256: ${e.sha256_hash.substring(0,16)}...</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        evidenceList.innerHTML = '<p class="error-msg">Failed to load evidence.</p>';
    }
}

init();
