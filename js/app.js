import { mockData } from './data.js';

// Central Persistence Engine
window.saveCRMState = function() {
    localStorage.setItem('vedanco_crm_leads', JSON.stringify(mockData.leads));
    localStorage.setItem('vedanco_crm_tasks', JSON.stringify(mockData.tasks));
    localStorage.setItem('vedanco_crm_projects', JSON.stringify(mockData.projects));
    localStorage.setItem('vedanco_crm_time_logs', JSON.stringify(mockData.timeLogs));
    localStorage.setItem('vedanco_crm_leave_requests', JSON.stringify(mockData.leaveRequests));
    localStorage.setItem('vedanco_team_data', JSON.stringify(mockData.team));
};

function loadCRMState() {
    try {
        const savedLeads = localStorage.getItem('vedanco_crm_leads');
        if (savedLeads) {
            mockData.leads.length = 0;
            mockData.leads.push(...JSON.parse(savedLeads));
        } else {
            // Default initial leads
            mockData.leads.length = 0;
            mockData.leads.push(
                { id: 101, title: 'Server Upgrade Migration', client: 'TechCorp', vertical: 'it', stage: 'new' },
                { id: 102, title: 'Deep AI Marketing Model', client: 'DataWiz LLC', vertical: 'ai', stage: 'contacted' },
                { id: 103, title: 'Interstate Cargo Delivery Plan', client: 'Global Logistics', vertical: 'logistics', stage: 'negotiating' },
                { id: 104, title: 'Office Space Fitout Design', client: 'HQ Designs', vertical: 'interior', stage: 'closed' }
            );
        }
        
        const savedTasks = localStorage.getItem('vedanco_crm_tasks');
        if (savedTasks) {
            mockData.tasks.length = 0;
            mockData.tasks.push(...JSON.parse(savedTasks));
        } else {
            // Default initial tasks
            mockData.tasks.length = 0;
            mockData.tasks.push(
                { id: 201, title: 'Database Migration Phase 1', assignees: [2, 3], stage: 'todo', vertical: 'it' },
                { id: 202, title: 'AI Model Training Pipeline', assignees: [4], stage: 'in-progress', vertical: 'ai' },
                { id: 203, title: 'Design Office Layout Plan', assignees: [5], stage: 'review', vertical: 'interior' },
                { id: 204, title: 'Optimize Logistics Route', assignees: [7], stage: 'done', vertical: 'logistics' }
            );
        }
        
        const savedProjects = localStorage.getItem('vedanco_crm_projects');
        if (savedProjects) {
            mockData.projects.length = 0;
            mockData.projects.push(...JSON.parse(savedProjects));
        }
        
        const savedTimeLogs = localStorage.getItem('vedanco_crm_time_logs');
        if (savedTimeLogs) {
            mockData.timeLogs.length = 0;
            mockData.timeLogs.push(...JSON.parse(savedTimeLogs));
        }
        
        const savedLeaveRequests = localStorage.getItem('vedanco_crm_leave_requests');
        if (savedLeaveRequests) {
            mockData.leaveRequests.length = 0;
            mockData.leaveRequests.push(...JSON.parse(savedLeaveRequests));
        }
    } catch (e) {
        console.error('Failed to load CRM local state', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load persisted CRM data
    loadCRMState();

    // Load persisted team data if available
    const savedTeamData = localStorage.getItem('vedanco_team_data');
    if (savedTeamData) {
        try {
            const parsedTeam = JSON.parse(savedTeamData);
            parsedTeam.forEach(savedEmp => {
                const existing = mockData.team.find(e => e.id === savedEmp.id);
                if (existing) {
                    Object.assign(existing, savedEmp);
                }
            });
        } catch (e) {
            console.error('Failed to parse saved team data', e);
        }
    }

    // Initialize defaults for missing fields (email, phone, etc.)
    mockData.team.forEach(emp => {
        if (!emp.email) {
            emp.email = emp.name.toLowerCase().replace(/\s+/g, '.') + '.vedanco@gmail.com';
        }
        if (!emp.phone) {
            emp.phone = '+91 98765 ' + String(10000 + Math.floor(Math.random() * 90000)).slice(-5);
        }
    });

    // Load logged-in and tracking states
    const loggedInIds = JSON.parse(localStorage.getItem('vedanco_logged_in_ids') || '[]');
    const startedTrackingIds = JSON.parse(localStorage.getItem('vedanco_started_tracking_ids') || '[]');
    mockData.team.forEach(emp => {
        if (loggedInIds.includes(emp.id)) {
            emp.loggedIn = true;
        }
        if (startedTrackingIds.includes(emp.id)) {
            emp.startedTracking = true;
        }
    });

    initLoginSystem();
    initNavigation();
    initCRMModal();
    initTaskModal();
    initSettingsModal();
    initNotificationsSystem();
    initPasswordToggles();
    // Do not render AllModules until User authenticates!
});

// Authentication System
function initLoginSystem() {
    const loginEmail = document.getElementById('login-email');
    const loginBtn = document.getElementById('login-btn');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const logoutBtn = document.getElementById('user-profile-toggle');

    if(!loginEmail || !loginBtn || !loginScreen) return;

    function performLogin(emp) {
        mockData.currentUser = emp;
        if (emp.role === 'employee') {
            emp.loggedIn = true;
            let loggedInIds = JSON.parse(localStorage.getItem('vedanco_logged_in_ids') || '[]');
            if (!loggedInIds.includes(emp.id)) {
                loggedInIds.push(emp.id);
                localStorage.setItem('vedanco_logged_in_ids', JSON.stringify(loggedInIds));
            }
        }
        document.getElementById('login-password').value = '';
        
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';

        document.getElementById('current-user-name').textContent = mockData.currentUser.name;
        document.getElementById('current-user-role').textContent = mockData.currentUser.title;
        document.getElementById('current-user-avatar').src = mockData.currentUser.avatar;
        document.getElementById('view-pill').textContent = emp.role === 'admin' ? 'Admin Mode' : 'Employee View';
        document.getElementById('view-pill').style.background = emp.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        document.getElementById('view-pill').style.color = emp.role === 'admin' ? 'var(--color-ai)' : 'var(--color-success)';

        enforceAccessControl();
        renderAllModules();
        document.getElementById('nav-dashboard').click();
        updateNotificationsUI();
    }

    const savedSession = localStorage.getItem('vedanco_session');
    if (savedSession) {
        const empAuto = mockData.team.find(e => e.id === parseInt(savedSession));
        if (empAuto) performLogin(empAuto);
    }

    loginBtn.addEventListener('click', () => {
        const emailVal = loginEmail.value.trim().toLowerCase();
        const enteredPassword = document.getElementById('login-password').value;
        const emp = mockData.team.find(e => 
            (e.email && e.email.toLowerCase() === emailVal) || 
            (e.name && e.name.toLowerCase().split(' ')[0] === emailVal) ||
            (e.role === 'admin' && (emailVal === 'admin' || emailVal === 'admin@vedanco.com'))
        );
        if (!emp || enteredPassword !== emp.password) {
            showToast('Access Denied', 'Invalid username, email, or password! Please try again.', 'ph-shield-warning');
            return;
        }
        localStorage.setItem('vedanco_session', emp.id);
        performLogin(emp);
        showToast('Welcome Back', `Successfully entered workspace as ${emp.name}!`, 'ph-check-circle');
    });

    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loginBtn.click();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('vedanco_session');
        mockData.currentUser = null;
        appContainer.style.display = 'none';
        loginScreen.style.display = 'flex';
        if(window.timerInterval) {
            clearInterval(window.timerInterval);
            window.timerInterval = null;
            localStorage.setItem('vedanco_timer_run', 'false');
        }
    });
}

// App Router / Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active-view'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-view');
        });
    });
}

function enforceAccessControl() {
    if(!mockData.currentUser) return;
    const isAdmin = mockData.currentUser.role === 'admin';
    const crmNav = document.getElementById('nav-crm');
    
    if (crmNav) crmNav.style.display = 'flex';
    
    const addProjectBtn = document.getElementById('open-add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.style.display = isAdmin ? 'flex' : 'none';
    }
    
    const addTaskBtn = document.getElementById('open-add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.style.display = isAdmin ? 'flex' : 'none';
    }
}

function renderAllModules() {
    renderDashboard();
    renderHR();
    renderTasks();
    renderProjects();
    renderTimeTracking();
    renderCRM();
    renderLeaveModule();
}

// Format Name & Tag
function getVerticalTag(verticalId) {
    if(!verticalId) return '';
    const v = mockData.verticals.find(val => val.id === verticalId);
    if (!v) return `<span class="tag">Generic</span>`;
    return `<span class="tag tag-${v.id}">${v.name}</span>`;
}

// Render Dashboard
function renderDashboard() {
    const isAdmin = mockData.currentUser.role === 'admin';
    const statsGrid = document.getElementById('dashboard-stats-grid');
    const tableTitle = document.getElementById('dashboard-table-title');
    const table = document.getElementById('dashboard-table');

    if (isAdmin) {
        statsGrid.innerHTML = `
            <div class="stat-card"><h3>Total Leads</h3><p class="stat-value" id="stat-leads">${mockData.leads.length}</p><span class="trend neutral"><i class="ph ph-minus"></i> Real-time</span></div>
            <div class="stat-card"><h3>Active Projects</h3><p class="stat-value">${mockData.projects ? mockData.projects.length : 0}</p><span class="trend neutral"><i class="ph ph-minus"></i> Stable</span></div>
            <div class="stat-card"><h3>Team Utilization</h3><p class="stat-value">Active</p><span class="trend up"><i class="ph ph-trend-up"></i> Optimal</span></div>
            <div class="stat-card"><h3>Tasks Closed</h3><p class="stat-value">${mockData.tasks.filter(t=>t.stage === 'done').length}</p><span class="trend neutral"><i class="ph ph-minus"></i> Wait</span></div>
        `;
        tableTitle.textContent = "Team Directory (" + mockData.team.length + ")";
        table.innerHTML = `
            <thead><tr><th>Employee</th><th>Service Vertical</th><th>Role</th></tr></thead>
            <tbody id="dash-tbody-admin"></tbody>
        `;
        const tbody = document.getElementById('dash-tbody-admin');
        const grouped = {};
        mockData.team.forEach(emp => {
            let domain = emp.vertical ? mockData.verticals.find(v=>v.id===emp.vertical)?.name || 'General' : 'Administration';
            if(!grouped[domain]) grouped[domain] = [];
            grouped[domain].push(emp);
        });

        for(let domain in grouped) {
             tbody.innerHTML += `<tr><td colspan="3" style="background:var(--bg-page); font-weight:600; color:var(--text-muted); font-size:0.85rem; text-transform:uppercase;">${domain} Domain</td></tr>`;
             grouped[domain].forEach(emp => {
                 const vtag = emp.vertical ? getVerticalTag(emp.vertical) : '-';
                 tbody.innerHTML += `<tr><td><div class="employee-cell"><img src="${emp.avatar}" class="team-avatar">${emp.name}</div></td><td>${vtag}</td><td><span class="status-badge paid">${emp.role.toUpperCase()}</span> ${emp.title}</td></tr>`;
             });
        }
    } else {
        // Employee Dashboard
        const myTasks = mockData.tasks.filter(t => t.assignees.includes(mockData.currentUser.id));
        const doneTasksCount = myTasks.filter(t => t.stage === 'done').length;

        // Calculate my logged hours
        let myHours = 0;
        mockData.timeLogs.forEach(log => {
            if(log.empId === mockData.currentUser.id) myHours += log.hours;
        });

        statsGrid.innerHTML = `
            <div class="stat-card"><h3>My Tasks Done</h3><p class="stat-value">${doneTasksCount}</p><span class="trend neutral"><i class="ph ph-minus"></i> Real-time</span></div>
            <div class="stat-card"><h3>My Projects</h3><p class="stat-value">${mockData.projects ? mockData.projects.filter(p=>p.assignees.includes(mockData.currentUser.id)).length : 0}</p><span class="trend neutral"><i class="ph ph-minus"></i> Active</span></div>
            <div class="stat-card"><h3>Hours Logged</h3><p class="stat-value">${myHours.toFixed(1)}h</p><span class="trend up"><i class="ph ph-trend-up"></i> On Track</span></div>
            <div class="stat-card"><h3>Leave Balance</h3><p class="stat-value">14 Days</p><span class="trend neutral"><i class="ph ph-minus"></i> Remaining</span></div>
        `;
        tableTitle.textContent = "My Upcoming Deadlines";
        table.innerHTML = `
            <thead><tr><th>Task</th><th>Project</th><th>Due Date</th></tr></thead>
            <tbody>
                <tr><td>Submit Weekly Report</td><td>Internal</td><td><span class="status-badge pending">Tomorrow</span></td></tr>
                <tr><td>Client Sync Update</td><td>Active Client</td><td><span class="status-badge paid">Next Week</span></td></tr>
            </tbody>
        `;
    }

    // Activity feed
    const acts = document.getElementById('dashboard-activity-list');
    acts.innerHTML = `
        <div class="activity-item"><div class="activity-dot it"></div><div class="activity-details"><p><strong>System</strong> routine background backup completed.</p><span class="activity-time">5 mins ago</span></div></div>
        <div class="activity-item"><div class="activity-dot ${isAdmin ? 'ai' : mockData.currentUser.vertical || 'it'}"></div><div class="activity-details"><p><strong>${isAdmin ? 'Charlie Davis' : mockData.currentUser.name}</strong> updated project status.</p><span class="activity-time">1 hour ago</span></div></div>
    `;
}

window.hrCurrentFilter = 'all'; // Default

function renderHR() {
    const container = document.getElementById('hr-content-container');
    const isAdmin = mockData.currentUser.role === 'admin';
    if (!container) return;

    if (isAdmin) {
        let historyHtml = `<thead><tr><th>Employee</th><th>Time In</th><th>Time Out</th><th>Status</th><th>Action</th></tr></thead><tbody>`;
        const presentEmployees = mockData.team.filter(e => e.role === 'employee' && e.loggedIn);
        
        if (presentEmployees.length === 0) {
            historyHtml += `<tr><td colspan="5" class="text-center text-muted" style="padding: 1.5rem 0;">No employee attendance clocked today.</td></tr>`;
        } else {
            presentEmployees.forEach((emp, i) => {
                const timeIn = `0${8 + (i%2)}:${10 + i} AM`;
                const timeOut = (i % 3 === 0 ? `<span class="text-muted">Working...</span>` : `0${5 + (i%2)}:${10 + i} PM`);
                
                // Check if employee is currently active on Leave status
                const live = mockData.liveTracking[emp.id];
                const isOnLeave = (live && live.status === 'leave') || i === 4;
                const status = isOnLeave ? '<span class="status-badge unpaid">On Leave</span>' : '<span class="status-badge paid">Present</span>';
                
                historyHtml += `<tr>
                    <td><div class="employee-cell"><img src="${emp.avatar}" class="team-avatar">${emp.name}</div></td>
                    <td>${isOnLeave ? '--:-- --' : timeIn}</td><td>${isOnLeave ? '--:-- --' : timeOut}</td><td>${status}</td>
                    <td><button class="action-btn" onclick="alert('Viewing History')" title="View History"><i class="ph ph-clock-counter-clockwise"></i></button></td>
                </tr>`;
            });
        }
        historyHtml += `</tbody>`;

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>Attendance & History Log</h2>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        ${historyHtml}
                    </table>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card" style="padding: 2.5rem; text-align: center; max-width: 600px; margin: 0 auto;">
                <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.1); color: var(--color-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                    <i class="ph ph-shield-check" style="font-size: 3rem;"></i>
                </div>
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Daily Shift Attendance Clocked</h2>
                <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem;">You are marked present today. IP verified and shift active.</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; text-align: left; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                    <div><span style="color: var(--text-muted); font-size: 0.85rem; display: block;">CLOCK IN TIME</span><strong>09:15 AM</strong></div>
                    <div><span style="color: var(--text-muted); font-size: 0.85rem; display: block;">CLOCK OUT TIME</span><strong style="color: var(--text-muted); font-weight: 500;">--:-- --</strong></div>
                    <div><span style="color: var(--text-muted); font-size: 0.85rem; display: block;">ATTENDANCE STATUS</span><span class="status-badge paid" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">Present</span></div>
                    <div><span style="color: var(--text-muted); font-size: 0.85rem; display: block;">VERIFIED IP</span><strong style="font-family: monospace;">192.168.1.144</strong></div>
                </div>
            </div>
        `;
    }
}



// CRM View 
function renderCRM() {
    const board = document.getElementById('crm-kanban-board');
    if(!board) return;

    const stages = [
        { id: 'new', label: 'New', count: 0 },
        { id: 'contacted', label: 'Contacted', count: 0 },
        { id: 'negotiating', label: 'Negotiating', count: 0 },
        { id: 'closed', label: 'Closed Deal', count: 0 },
    ];

    let html = '';
    
    stages.forEach(stage => {
        const stageLeads = mockData.leads.filter(l => l.stage === stage.id);
        stage.count = stageLeads.length;
        
        let cardsHtml = '';
        stageLeads.forEach(lead => {
            const statusClass = lead.stage === 'closed' ? 'paid' : (lead.stage === 'new' ? '' : 'pending');
            const statusLabel = lead.stage === 'closed' ? 'Won' : (lead.stage === 'new' ? 'New Lead' : 'Active');
            
            let actionBtn = lead.stage !== 'closed' ? `<button class="action-btn" onclick="advanceLead(${lead.id})" title="Advance Lead"><i class="ph ph-arrow-right"></i></button>` : '';

            cardsHtml += `
                <div class="kanban-card">
                    <div class="kanban-card-header">
                        <h4 style="margin: 0; padding-right: 0.5rem; flex:1;">${lead.title}</h4>
                        ${getVerticalTag(lead.vertical)}
                    </div>
                    <p class="kanban-client">${lead.client}</p>
                    <div class="kanban-meta">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                        ${actionBtn}
                    </div>
                </div>
            `;
        });

        html += `
            <div class="kanban-column">
                <div class="kanban-header">
                    <h3>${stage.label}</h3>
                    <span class="badge">${stage.count}</span>
                </div>
                <div class="kanban-cards">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });

    board.innerHTML = html;
}

window.advanceLead = function(id) {
    const stages = ['new', 'contacted', 'negotiating', 'closed'];
    const lead = mockData.leads.find(l => l.id === id);
    if(lead) {
        const currIdx = stages.indexOf(lead.stage);
        if (currIdx < stages.length - 1) {
            lead.stage = stages[currIdx + 1];
            renderCRM();
            
            // Sync completely real-time without refresh across all dashboards
            if(document.getElementById('dashboard').classList.contains('active-view')) {
                renderDashboard();
            }
        }
    }
}

function initCRMModal() {
    const modal = document.getElementById('add-lead-modal');
    const btnOpen = document.getElementById('open-add-lead-btn');
    const btnClose = document.getElementById('close-lead-btn');
    const btnSubmit = document.getElementById('submit-lead-btn');
    
    if(!modal) return;
    if(btnOpen) btnOpen.addEventListener('click', () => modal.classList.add('show'));
    if(btnClose) btnClose.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });
    
    if(btnSubmit) btnSubmit.addEventListener('click', () => { 
        const title = document.getElementById('form-lead-title').value;
        const vertical = document.getElementById('form-lead-vertical').value;
        const client = document.getElementById('form-lead-client').value;

        if(!title || !client) return alert('Please enter Title and Client Name');

        mockData.leads.push({
            id: Date.now(),
            title: title,
            vertical: vertical,
            client: client,
            stage: 'new'
        });

        renderCRM(); // Re-render live
        
        // Reset form
        document.getElementById('form-lead-title').value = '';
        document.getElementById('form-lead-client').value = '';

        modal.classList.remove('show'); 
    });
}

function initTaskModal() {
    const modal = document.getElementById('add-task-modal');
    const btnOpen = document.getElementById('open-add-task-btn');
    const btnClose = document.getElementById('close-task-btn');
    const btnSubmit = document.getElementById('submit-task-btn');
    
    if(!modal) return;
    if(btnOpen) btnOpen.addEventListener('click', () => modal.classList.add('show'));
    if(btnClose) btnClose.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });
    
    if(btnSubmit) btnSubmit.addEventListener('click', () => { 
        const title = document.getElementById('form-task-title').value;
        if(!title) return alert('Please enter a Task Title');

        mockData.tasks.push({
            id: Date.now(),
            title: title,
            assignees: [mockData.currentUser.id],
            stage: 'todo',
            vertical: mockData.currentUser.vertical || 'it'
        });

        renderTasks();
        if (document.getElementById('dashboard').classList.contains('active-view')) {
            renderDashboard();
        }
        
        document.getElementById('form-task-title').value = '';
        modal.classList.remove('show'); 
    });
}

// Render Tasks View
function renderTasks() {
    const container = document.getElementById('tasks-content');
    const isAdmin = mockData.currentUser.role === 'admin';
    if (!container) return;

    if (isAdmin) {
        // Build global Team Kanban
        const buildCol = (stage, title) => {
            const tasks = mockData.tasks.filter(t => t.stage === stage);
            let html = `<div class="task-col"><h4>${title}</h4>`;
            tasks.forEach(t => {
                const assigneeName = t.assignees[0] === 'admin' ? 'Admin' : (mockData.team.find(e => e.id === t.assignees[0])?.name || 'Unassigned');
                html += `<div class="task-item" style="flex-direction: column; align-items: flex-start;">
                    <strong style="margin-bottom: 0.5rem; display: block;">${t.title}</strong>
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="ph ph-user"></i> ${assigneeName}</span>
                        ${getVerticalTag(t.vertical)}
                    </div>
                </div>`;
            });
            return html + `</div>`;
        };

        container.style.display = 'block';
        container.innerHTML = `
            <div class="card" style="width: 100%;">
                <div class="card-header">
                    <h2>Global Team Tasks Kanban</h2>
                </div>
                <div class="task-kanban">
                    ${buildCol('todo', 'To Do')}
                    ${buildCol('in-progress', 'In Progress')}
                    ${buildCol('review', 'Review')}
                    ${buildCol('done', 'Done')}
                </div>
            </div>
        `;
        document.getElementById('tasks-subtitle').textContent = "Team-wide task dashboard across all verticals.";
    } else {
        // Employee detailed personal task view
        const myTasks = mockData.tasks.filter(t => t.assignees.includes(mockData.currentUser.id));
        const todos = myTasks.filter(t => t.stage !== 'done');
        const done = myTasks.filter(t => t.stage === 'done');
        
        container.style.display = 'grid';
        container.innerHTML = `
            <div class="split-main card">
                <div class="card-header">
                    <h2>My Action Items</h2>
                </div>
                <div class="checklist" id="emp-task-list">
                    ${todos.length === 0 ? '<p style="color: var(--text-muted);">You have no pending tasks! Grab a coffee ☕</p>' : ''}
                    ${todos.map(t => `
                        <label class="check-item" style="padding: 0.75rem; background: var(--bg-page); border-radius: 0.5rem; border: 1px solid var(--border-color);">
                            <input type="checkbox" onchange="markTaskDone(${t.id})"> 
                            <span style="flex:1;">${t.title}</span> 
                            <span class="badge status-badge pending" style="margin-left:auto; text-transform: uppercase;">${t.stage}</span>
                        </label>
                    `).join('')}
                    ${done.length > 0 ? '<br><h3 style="font-size: 1rem; color: var(--text-muted);">Completed</h3><hr style="opacity:0.2; margin: 0.5rem 0;">' : ''}
                    ${done.map(t => `
                        <label class="check-item" style="padding: 0.5rem; opacity: 0.6;">
                            <input type="checkbox" checked disabled> 
                            <del>${t.title}</del>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="split-sidebar card">
                <div class="card-header"><h2>Task Insights</h2></div>
                <div class="text-center" style="padding: 2rem 0;">
                    <div class="timer-display" style="font-size: 3rem; margin: 0; color: var(--color-success);">${done.length}</div>
                    <p style="color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">Tasks Done</p>
                </div>
            </div>
        `;
        document.getElementById('tasks-subtitle').textContent = "Manage your individualized task list.";
    }
}

// Global scope attach for DOM access
window.markTaskDone = function(taskId) {
    const t = mockData.tasks.find(t => t.id === taskId);
    if (t) {
        t.stage = 'done';
        renderTasks(); // Re-render this specific module
        // We also want dashboard to update!
        if(document.getElementById('dashboard').classList.contains('active-view')) {
            renderDashboard();
        }
    }
}

// Render Projects View
function renderProjects() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    
    const isAdmin = mockData.currentUser.role === 'admin';
    const allProjects = mockData.projects || [];

    const visibleProjects = isAdmin ? allProjects : allProjects.filter(p => p.assignees.includes(mockData.currentUser.id));

    grid.innerHTML = '';
    
    if (visibleProjects.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No active projects assigned to you.</p>`;
        return;
    }

    visibleProjects.forEach(p => {
        const teamSpan = p.assignees.map(id => {
            const emp = mockData.team.find(e => e.id === id);
            return emp ? `<img src="${emp.avatar}" class="team-avatar" title="${emp.name}">` : '';
        }).join('');
        
        const badgeColor = p.status === 'On Track' ? 'paid' : (p.status === 'At Risk' ? 'pending' : 'unpaid');
        
        let actHtml = '';
        if (p.progress < 100) {
            actHtml = `<button class="action-btn" onclick="increaseProjectProgress(${p.id})" title="Update Project Progress"><i class="ph ph-trend-up"></i></button>`;
        } else {
            p.status = 'Completed';
        }

        grid.innerHTML += `
            <div class="project-card">
                <div class="project-header">
                    <div>
                        <h3>${p.name}</h3>
                        <div class="project-client">${p.client}</div>
                    </div>
                    ${getVerticalTag(p.vertical)}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${p.progress}%; background: ${p.status === 'Off Track' ? 'var(--color-danger)' : (p.vertical === 'it' ? 'var(--color-it)' : 'var(--color-'+p.vertical+')')}"></div>
                </div>
                <div style="font-size:0.8rem; margin-top:-1rem; margin-bottom:1rem; text-align:right;">${p.progress}%</div>
                <div class="project-footer">
                    <div class="avatar-group">${teamSpan}</div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span class="status-badge ${badgeColor}">${p.status}</span>
                        ${actHtml}
                    </div>
                </div>
            </div>
        `;
    });
}

window.increaseProjectProgress = function(pid) {
    const p = mockData.projects.find(x => x.id === pid);
    if(p && p.progress < 100) {
        p.progress += 5;
        if(p.progress > 100) p.progress = 100;
        
        // Ensure status dynamic flip
        if(p.progress >= 100) p.status = 'Completed';
        else p.status = 'On Track';
        
        // Auto update UI without refresh
        renderProjects();
    }
}

// Time Tracking Logic 
function renderTimeTracking() {
    const container = document.getElementById('time-content-container');
    const isAdmin = mockData.currentUser.role === 'admin';
    if(!container) return;

    if (isAdmin) {
        container.innerHTML = `
            <div class="split-main card" style="width: 100%;">
                <div class="card-header">
                    <h2>Live Team Activity Dashboard</h2>
                </div>
                <div class="table-responsive">
                    <table class="data-table" id="time-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Login Time</th>
                                <th>Working Hours</th>
                                <th>Lunch Break</th>
                                <th>Tea Break</th>
                                <th>Attendance Status</th>
                                <th>Live Tracking Updates</th>
                            </tr>
                        </thead>
                        <tbody id="admin-live-tracking-body"></tbody>
                    </table>
                </div>
            </div>
        `;
        updateAdminLiveTimers();
    } else {
        // EMPLOYEE Time Input
        let myHours = 0;
        mockData.timeLogs.forEach(log => {
            if(log.empId === mockData.currentUser.id) myHours += log.hours;
        });

        let logsHtml = '';
        const myLogs = mockData.timeLogs.filter(log => log.empId === mockData.currentUser.id);
        if (myLogs.length === 0) {
            logsHtml = `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No hours logged today.</p>`;
        } else {
            logsHtml = `
                <div class="table-responsive">
                    <table class="data-table" style="margin-top: 1rem; width: 100%;">
                        <thead>
                            <tr>
                                <th>Time/Date</th>
                                <th>Work Hours</th>
                                <th>Lunch Break</th>
                                <th>Tea Break</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myLogs.map(log => {
                                const dateObj = new Date(log.date);
                                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                return `
                                    <tr>
                                        <td>${timeStr}</td>
                                        <td><span style="font-weight: 600; color: var(--color-it);">${log.hours.toFixed(2)}h</span></td>
                                        <td>${log.lunchHours ? (log.lunchHours * 60).toFixed(0) + ' mins' : '0 mins'}</td>
                                        <td>${log.teaHours ? (log.teaHours * 60).toFixed(0) + ' mins' : '0 mins'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="dashboard-split" style="gap: 1.5rem; display: flex; flex-direction: row; flex-wrap: wrap;">
                <!-- Left Sidebar: Controls & Visual Shift Summary -->
                <div class="split-sidebar card text-center tracking-widget" style="flex: 1; min-width: 280px; max-width: 320px; display: flex; flex-direction: column; gap: 1.5rem;">
                    <h2>Shift Status</h2>
                    <div id="shift-status-badge" class="status-badge pending" style="font-size: 1rem; padding: 0.5rem 1rem; align-self: center; background: rgba(107, 114, 128, 0.1); color: var(--text-muted);">Paused</div>
                    
                    <!-- Shift Progress Circle or bar -->
                    <div class="shift-progress-container" style="margin: 0.5rem 0;">
                        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Total Shift Elapsed</div>
                        <div class="timer-display" id="total-shift-display" style="font-size: 2.5rem; margin: 0.5rem 0; color: var(--color-ai);">00:00:00</div>
                        <div class="progress-bar" style="height: 10px; margin: 0.5rem 0;">
                            <div id="total-shift-fill" class="progress-fill" style="width: 0%; background: var(--color-ai);"></div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Shift Goal: 9.00 Hours</div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: auto;">
                        <button class="action-btn" id="btn-pause-all" style="background: var(--text-muted); color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; cursor: pointer; transition: var(--transition);">
                            <i class="ph ph-pause"></i> Pause Active Timer
                        </button>
                        <button class="action-btn" id="btn-reset-all" style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; cursor: pointer; background: transparent; transition: var(--transition);">
                            <i class="ph ph-arrow-counter-clockwise"></i> Reset Today's Timers
                        </button>
                        <button class="primary-btn" id="btn-save-shift" style="background-color: var(--color-success); padding: 0.75rem; font-weight: 600; width: 100%;">
                            <i class="ph ph-floppy-disk"></i> Log Shift Record
                        </button>
                    </div>
                </div>
                
                <!-- Right Side: Three Timer Cards -->
                <div class="split-main" style="flex: 2; min-width: 320px; display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <!-- Timer 1: Regular Work -->
                    <div class="card timer-card" id="card-work" style="position: relative; overflow: hidden; transition: var(--transition); border-left: 5px solid var(--color-it);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div>
                                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--color-it); display: flex; align-items: center; gap: 0.5rem;"><i class="ph ph-briefcase"></i> Regular Work</h3>
                                <p style="font-size: 0.8rem; color: var(--text-muted);">Target: 8.00 Hours</p>
                            </div>
                            <button class="primary-btn" id="btn-toggle-work" style="background-color: var(--color-it); padding: 0.5rem 1rem; font-size: 0.9rem;">Start Work</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <div class="timer-display" id="display-work" style="font-size: 3.5rem; margin: 0; font-family: monospace; font-weight: 700; letter-spacing: -1px;">00:00:00</div>
                            <div id="status-work" style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">Inactive</div>
                        </div>
                        <div class="progress-bar" style="height: 6px; margin-top: 1rem;">
                            <div id="fill-work" class="progress-fill" style="width: 0%; background: var(--color-it);"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                        <!-- Timer 2: Lunch Break -->
                        <div class="card timer-card" id="card-lunch" style="position: relative; overflow: hidden; transition: var(--transition); border-left: 5px solid var(--color-success);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div>
                                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--color-success); display: flex; align-items: center; gap: 0.4rem;"><i class="ph ph-fork-knife"></i> Lunch Break</h3>
                                    <p style="font-size: 0.8rem; color: var(--text-muted);">Limit: 45 Mins</p>
                                </div>
                                <button class="primary-btn" id="btn-toggle-lunch" style="background-color: var(--color-success); padding: 0.4rem 0.8rem; font-size: 0.85rem;">Lunch Break</button>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                <div class="timer-display" id="display-lunch" style="font-size: 2.2rem; margin: 0; font-family: monospace; font-weight: 700; letter-spacing: -1px;">00:00</div>
                                <div id="status-lunch" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Inactive</div>
                            </div>
                            <div class="progress-bar" style="height: 6px; margin-top: 1rem;">
                                <div id="fill-lunch" class="progress-fill" style="width: 0%; background: var(--color-success);"></div>
                            </div>
                        </div>

                        <!-- Timer 3: Tea Break -->
                        <div class="card timer-card" id="card-tea" style="position: relative; overflow: hidden; transition: var(--transition); border-left: 5px solid var(--color-logistics);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <div>
                                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--color-logistics); display: flex; align-items: center; gap: 0.4rem;"><i class="ph ph-coffee"></i> Tea Break</h3>
                                    <p style="font-size: 0.8rem; color: var(--text-muted);">Limit: 15 Mins</p>
                                </div>
                                <button class="primary-btn" id="btn-toggle-tea" style="background-color: var(--color-logistics); padding: 0.4rem 0.8rem; font-size: 0.85rem;">Tea Break</button>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                <div class="timer-display" id="display-tea" style="font-size: 2.2rem; margin: 0; font-family: monospace; font-weight: 700; letter-spacing: -1px;">00:00</div>
                                <div id="status-tea" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Inactive</div>
                            </div>
                            <div class="progress-bar" style="height: 6px; margin-top: 1rem;">
                                <div id="fill-tea" class="progress-fill" style="width: 0%; background: var(--color-logistics);"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Shift Log list -->
                    <div class="card">
                        <div class="card-header">
                            <h2>My Hours Database</h2>
                        </div>
                        <div style="padding: 1rem; text-align: center; border-bottom: 1px solid var(--border-color);">
                            <span style="font-size: 4rem; color: var(--color-it); font-weight: 800; line-height: 1;">${myHours.toFixed(2)}h</span><br>
                            <span style="color: var(--text-muted); font-size: 1.1rem; font-weight: 500;">Total Hours Logged Today</span>
                        </div>
                        <div style="margin-top: 1.5rem;">
                            <h3 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-muted); text-transform: uppercase;">Logged Shifts History</h3>
                            ${logsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        initEmployeeStopwatch();
    }
}

window.updateAdminLiveTimers = function() {
    const tbody = document.getElementById('admin-live-tracking-body');
    if (!tbody) return;
    
    let html = '';
    const activeEmployees = mockData.team.filter(e => e.role === 'employee' && e.startedTracking);
    
    if (activeEmployees.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 1.5rem 0;">No active time tracking records started yet.</td></tr>`;
        return;
    }

    activeEmployees.forEach(emp => {
        const live = mockData.liveTracking[emp.id];
        if (!live) return;
        
        const h = Math.floor((live.seconds || 0) / 3600).toString().padStart(2, '0');
        const m = Math.floor(((live.seconds || 0) % 3600) / 60).toString().padStart(2, '0');
        const s = ((live.seconds || 0) % 60).toString().padStart(2, '0');
        const timeStr = (live.status === 'leave' || live.status === 'offline') ? '--:--:--' : `${h}:${m}:${s}`;
        
        let activityStr = 'Offline';
        let badge = '<span class="status-badge">Offline</span>';
        
        if (live.status === 'work') {
            activityStr = 'Working';
            badge = '<span class="status-badge paid">Present</span>';
        } else if (live.status === 'lunch') {
            activityStr = 'Lunch Break';
            badge = '<span class="status-badge pending">On Lunch</span>';
        } else if (live.status === 'tea') {
            activityStr = 'Tea Break';
            badge = '<span class="status-badge pending">On Tea</span>';
        } else if (live.status === 'leave') {
            activityStr = 'On Leave';
            badge = '<span class="status-badge unpaid">Absent</span>';
        } else if (live.status === 'paused') {
            activityStr = 'Paused';
            badge = '<span class="status-badge" style="background: rgba(107, 114, 128, 0.1); color: var(--text-muted);">Paused</span>';
        }

        const formatHMS = (secs) => {
            const sh = Math.floor(secs / 3600).toString().padStart(2, '0');
            const sm = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
            const ss = (secs % 60).toString().padStart(2, '0');
            return `${sh}:${sm}:${ss}`;
        };
        const formatMS = (secs) => {
            const sm = Math.floor(secs / 60).toString().padStart(2, '0');
            const ss = (secs % 60).toString().padStart(2, '0');
            return `${sm}:${ss}`;
        };

        const loginTime = live.loginTime || '09:15 AM';
        const workStr = formatHMS(live.workSeconds || 0);
        const lunchStr = `${formatMS(live.lunchSeconds || 0)} / 45m`;
        const teaStr = `${formatMS(live.teaSeconds || 0)} / 15m`;

        let liveUpdateStr = '';
        if (live.status === 'work') {
            liveUpdateStr = `<span style="font-weight: 600; color: var(--color-success);"><i class="ph ph-activity pulse-icon"></i> Work: ${timeStr}</span>`;
        } else if (live.status === 'lunch') {
            liveUpdateStr = `<span style="font-weight: 600; color: var(--color-logistics);"><i class="ph ph-coffee pulse-icon"></i> Lunch: ${timeStr}</span>`;
        } else if (live.status === 'tea') {
            liveUpdateStr = `<span style="font-weight: 600; color: var(--color-warning);"><i class="ph ph-timer pulse-icon"></i> Tea: ${timeStr}</span>`;
        } else if (live.status === 'paused') {
            liveUpdateStr = `<span style="font-weight: 600; color: var(--text-muted);"><i class="ph ph-pause"></i> Paused</span>`;
        } else {
            liveUpdateStr = `<span style="font-weight: 600; color: var(--text-muted);"><i class="ph ph-x-circle"></i> Inactive</span>`;
        }

        html += `<tr>
            <td><div class="employee-cell"><img src="${emp.avatar}" class="team-avatar">${emp.name}</div></td>
            <td style="font-family: monospace; font-size: 0.95rem;">${loginTime}</td>
            <td style="font-family: monospace; font-size: 0.95rem; font-weight: 600; color: var(--color-it);">${workStr}</td>
            <td style="font-family: monospace; font-size: 0.95rem;">${lunchStr}</td>
            <td style="font-family: monospace; font-size: 0.95rem;">${teaStr}</td>
            <td>${badge}</td>
            <td style="font-size: 0.95rem;">${liveUpdateStr}</td>
        </tr>`;
    });
    tbody.innerHTML = html;
};

// Global Live Timer Tick for Admin Dashboard
setInterval(() => {
    for (let id in mockData.liveTracking) {
        const tracker = mockData.liveTracking[id];
        
        // If it's the current user, the stopwatch updates it, so don't tick here
        if (mockData.currentUser && parseInt(id) === mockData.currentUser.id) {
            continue;
        }

        // Only update simulated timers if the employee has started tracking
        const empId = parseInt(id);
        const emp = mockData.team.find(e => e.id === empId);
        if (!emp || !emp.startedTracking) {
            continue;
        }

        if (tracker.status === 'work') {
            tracker.workSeconds = (tracker.workSeconds || 0) + 1;
            tracker.seconds = tracker.workSeconds;
        } else if (tracker.status === 'lunch') {
            tracker.lunchSeconds = (tracker.lunchSeconds || 0) + 1;
            tracker.seconds = tracker.lunchSeconds;
        } else if (tracker.status === 'tea') {
            tracker.teaSeconds = (tracker.teaSeconds || 0) + 1;
            tracker.seconds = tracker.teaSeconds;
        }
    }
    if (mockData.currentUser && mockData.currentUser.role === 'admin') {
        const view = document.getElementById('time');
        if (view && view.classList.contains('active-view')) {
            updateAdminLiveTimers();
        }
    }
}, 1000);

let workSeconds = parseInt(localStorage.getItem('vedanco_timer_work_sec')) || 0;
let lunchSeconds = parseInt(localStorage.getItem('vedanco_timer_lunch_sec')) || 0;
let teaSeconds = parseInt(localStorage.getItem('vedanco_timer_tea_sec')) || 0;
let activeTimer = localStorage.getItem('vedanco_timer_active') || 'paused';

function initEmployeeStopwatch() {
    const displayWork = document.getElementById('display-work');
    const displayLunch = document.getElementById('display-lunch');
    const displayTea = document.getElementById('display-tea');
    const displayTotal = document.getElementById('total-shift-display');

    const cardWork = document.getElementById('card-work');
    const cardLunch = document.getElementById('card-lunch');
    const cardTea = document.getElementById('card-tea');

    const btnToggleWork = document.getElementById('btn-toggle-work');
    const btnToggleLunch = document.getElementById('btn-toggle-lunch');
    const btnToggleTea = document.getElementById('btn-toggle-tea');

    const btnPauseAll = document.getElementById('btn-pause-all');
    const btnResetAll = document.getElementById('btn-reset-all');
    const btnSaveShift = document.getElementById('btn-save-shift');

    const statusWork = document.getElementById('status-work');
    const statusLunch = document.getElementById('status-lunch');
    const statusTea = document.getElementById('status-tea');
    const shiftStatusBadge = document.getElementById('shift-status-badge');

    const fillWork = document.getElementById('fill-work');
    const fillLunch = document.getElementById('fill-lunch');
    const fillTea = document.getElementById('fill-tea');
    const fillTotal = document.getElementById('total-shift-fill');

    if (!displayWork) return;

    function formatHMS(secs) {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function formatMS(secs) {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateDisplay() {
        // Displays
        if (displayWork) displayWork.textContent = formatHMS(workSeconds);
        if (displayLunch) displayLunch.textContent = formatMS(lunchSeconds);
        if (displayTea) displayTea.textContent = formatMS(teaSeconds);
        
        const totalSecs = workSeconds + lunchSeconds + teaSeconds;
        if (displayTotal) displayTotal.textContent = formatHMS(totalSecs);

        // Fills
        if (fillWork) fillWork.style.width = `${Math.min(100, (workSeconds / 28800) * 100)}%`;
        if (fillLunch) fillLunch.style.width = `${Math.min(100, (lunchSeconds / 2700) * 100)}%`;
        if (fillTea) fillTea.style.width = `${Math.min(100, (teaSeconds / 900) * 100)}%`;
        if (fillTotal) fillTotal.style.width = `${Math.min(100, (totalSecs / 32400) * 100)}%`;

        // Local Storage
        localStorage.setItem('vedanco_timer_work_sec', workSeconds);
        localStorage.setItem('vedanco_timer_lunch_sec', lunchSeconds);
        localStorage.setItem('vedanco_timer_tea_sec', teaSeconds);
        localStorage.setItem('vedanco_timer_active', activeTimer);

        // Sync with mockData.liveTracking
        if (mockData.currentUser && mockData.liveTracking[mockData.currentUser.id]) {
            const live = mockData.liveTracking[mockData.currentUser.id];
            live.status = activeTimer;
            live.workSeconds = workSeconds;
            live.lunchSeconds = lunchSeconds;
            live.teaSeconds = teaSeconds;
            live.seconds = activeTimer === 'work' ? workSeconds : (activeTimer === 'lunch' ? lunchSeconds : (activeTimer === 'tea' ? teaSeconds : 0));

            if (activeTimer !== 'paused' || workSeconds > 0 || lunchSeconds > 0 || teaSeconds > 0) {
                if (!mockData.currentUser.startedTracking) {
                    mockData.currentUser.startedTracking = true;
                    let startedTrackingIds = JSON.parse(localStorage.getItem('vedanco_started_tracking_ids') || '[]');
                    if (!startedTrackingIds.includes(mockData.currentUser.id)) {
                        startedTrackingIds.push(mockData.currentUser.id);
                        localStorage.setItem('vedanco_started_tracking_ids', JSON.stringify(startedTrackingIds));
                    }
                }
            }
        }

        // Card active states
        cardWork?.classList.remove('active-timer-card');
        cardLunch?.classList.remove('active-timer-card');
        cardTea?.classList.remove('active-timer-card');

        if (statusWork) statusWork.textContent = 'Inactive';
        if (statusLunch) statusLunch.textContent = 'Inactive';
        if (statusTea) statusTea.textContent = 'Inactive';

        if (btnToggleWork) btnToggleWork.innerHTML = '<i class="ph ph-play"></i> Start Work';
        if (btnToggleLunch) btnToggleLunch.innerHTML = '<i class="ph ph-fork-knife"></i> Lunch Break';
        if (btnToggleTea) btnToggleTea.innerHTML = '<i class="ph ph-coffee"></i> Tea Break';

        if (activeTimer === 'work') {
            cardWork?.classList.add('active-timer-card');
            if (statusWork) statusWork.textContent = 'Running';
            if (btnToggleWork) btnToggleWork.innerHTML = '<i class="ph ph-pause"></i> Pause Work';
            if (shiftStatusBadge) {
                shiftStatusBadge.textContent = 'Working';
                shiftStatusBadge.style.background = 'rgba(59, 130, 246, 0.1)';
                shiftStatusBadge.style.color = 'var(--color-it)';
            }
        } else if (activeTimer === 'lunch') {
            cardLunch?.classList.add('active-timer-card');
            if (statusLunch) statusLunch.textContent = 'Active';
            if (btnToggleLunch) btnToggleLunch.innerHTML = '<i class="ph ph-pause"></i> Pause Lunch';
            if (shiftStatusBadge) {
                shiftStatusBadge.textContent = 'Lunch Break';
                shiftStatusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
                shiftStatusBadge.style.color = 'var(--color-success)';
            }
        } else if (activeTimer === 'tea') {
            cardTea?.classList.add('active-timer-card');
            if (statusTea) statusTea.textContent = 'Active';
            if (btnToggleTea) btnToggleTea.innerHTML = '<i class="ph ph-pause"></i> Pause Tea';
            if (shiftStatusBadge) {
                shiftStatusBadge.textContent = 'Tea Break';
                shiftStatusBadge.style.background = 'rgba(245, 158, 11, 0.1)';
                shiftStatusBadge.style.color = 'var(--color-logistics)';
            }
        } else {
            if (shiftStatusBadge) {
                shiftStatusBadge.textContent = 'Paused';
                shiftStatusBadge.style.background = 'rgba(107, 114, 128, 0.1)';
                shiftStatusBadge.style.color = 'var(--text-muted)';
            }
        }
    }

    function startTicking() {
        if (!window.timerInterval) {
            window.timerInterval = setInterval(() => {
                if (activeTimer === 'work') {
                    workSeconds++;
                } else if (activeTimer === 'lunch') {
                    lunchSeconds++;
                    // Enforce limit: 45 minutes (2700 seconds)
                    if (lunchSeconds >= 2700) {
                        activeTimer = 'paused';
                        pauseTicking();
                        alert("Lunch break limit of 45 minutes reached! The break timer has paused.");
                    }
                } else if (activeTimer === 'tea') {
                    teaSeconds++;
                    // Enforce limit: 15 minutes (900 seconds)
                    if (teaSeconds >= 900) {
                        activeTimer = 'paused';
                        pauseTicking();
                        alert("Tea break limit of 15 minutes reached! The break timer has paused.");
                    }
                }
                updateDisplay();
            }, 1000);
        }
    }

    function pauseTicking() {
        if (window.timerInterval) {
            clearInterval(window.timerInterval);
            window.timerInterval = null;
        }
        localStorage.setItem('vedanco_timer_run', 'false');
    }

    // Restore state from previous view/load
    updateDisplay();
    
    // Auto-resume if active timer was ticking previously
    const timerRunning = localStorage.getItem('vedanco_timer_run') === 'true';
    if (timerRunning && activeTimer !== 'paused') {
        startTicking();
    }

    // Button event listeners
    btnToggleWork?.addEventListener('click', () => {
        if (activeTimer === 'work') {
            activeTimer = 'paused';
            pauseTicking();
        } else {
            activeTimer = 'work';
            localStorage.setItem('vedanco_timer_run', 'true');
            startTicking();
        }
        updateDisplay();
    });

    btnToggleLunch?.addEventListener('click', () => {
        if (activeTimer === 'lunch') {
            activeTimer = 'paused';
            pauseTicking();
        } else {
            activeTimer = 'lunch';
            localStorage.setItem('vedanco_timer_run', 'true');
            startTicking();
        }
        updateDisplay();
    });

    btnToggleTea?.addEventListener('click', () => {
        if (activeTimer === 'tea') {
            activeTimer = 'paused';
            pauseTicking();
        } else {
            activeTimer = 'tea';
            localStorage.setItem('vedanco_timer_run', 'true');
            startTicking();
        }
        updateDisplay();
    });

    btnPauseAll?.addEventListener('click', () => {
        activeTimer = 'paused';
        pauseTicking();
        updateDisplay();
    });

    btnResetAll?.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all active timers for today? This cannot be undone.")) {
            activeTimer = 'paused';
            pauseTicking();
            workSeconds = 0;
            lunchSeconds = 0;
            teaSeconds = 0;
            updateDisplay();
        }
    });

    btnSaveShift?.addEventListener('click', () => {
        pauseTicking();
        
        const hoursCalculated = workSeconds / 3600;
        const lunchHours = lunchSeconds / 3600;
        const teaHours = teaSeconds / 3600;
        
        if (workSeconds > 0 || lunchSeconds > 0 || teaSeconds > 0) {
            mockData.timeLogs.push({
                empId: mockData.currentUser.id,
                date: new Date().toISOString(),
                hours: hoursCalculated,
                lunchHours: lunchHours,
                teaHours: teaHours
            });
            alert(`Shift successfully logged to your record!\n- Productive Work: ${hoursCalculated.toFixed(2)}h\n- Lunch Break: ${(lunchHours * 60).toFixed(0)}m\n- Tea Break: ${(teaHours * 60).toFixed(0)}m`);
        } else {
            alert('Timers are exactly 0. Nothing logged.');
            return;
        }

        // Reset all timers on save
        activeTimer = 'paused';
        workSeconds = 0;
        lunchSeconds = 0;
        teaSeconds = 0;
        updateDisplay();
        
        renderTimeTracking(); // Refresh UI to update history list and total hours
        renderDashboard(); // Fix global stats silently
    });
}

// Leave Module Calendar State
let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();
let selectedLeaveStart = null;
let selectedLeaveEnd = null;

function renderLeaveModule() {
    const container = document.getElementById('leave-content-container');
    if (!container) return;

    const isAdmin = mockData.currentUser.role === 'admin';
    if (isAdmin) {
        renderAdminLeave(container);
    } else {
        renderEmployeeLeave(container);
    }
}

function generateCalendarHtml(year, month) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    let html = `
        <div class="calendar-widget" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <button class="action-btn" id="cal-prev-month" style="padding: 0.4rem; border-radius: 0.5rem; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-page); color: var(--text-main);"><i class="ph ph-caret-left"></i></button>
                <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: var(--text-main);">${months[month]} ${year}</h3>
                <button class="action-btn" id="cal-next-month" style="padding: 0.4rem; border-radius: 0.5rem; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-page); color: var(--text-main);"><i class="ph ph-caret-right"></i></button>
            </div>
            <div class="calendar-weekdays" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem;">
                <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
            </div>
            <div class="calendar-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center;">
    `;

    for (let i = startDay - 1; i >= 0; i--) {
        const d = prevTotalDays - i;
        html += `<div style="padding: 0.6rem 0; font-size: 0.9rem; color: rgba(156, 163, 175, 0.3); cursor: not-allowed;">${d}</div>`;
    }

    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
        const currentDayDate = new Date(year, month, d);
        
        let isSelected = false;
        
        if (selectedLeaveStart) {
            if (currentDayDate.getDate() === selectedLeaveStart.getDate() &&
                currentDayDate.getMonth() === selectedLeaveStart.getMonth() &&
                currentDayDate.getFullYear() === selectedLeaveStart.getFullYear()) {
                isSelected = true;
            }
        }

        let style = `padding: 0.6rem 0; font-size: 0.9rem; font-weight: 600; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; position: relative; display: flex; align-items: center; justify-content: center;`;
        
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
        if (isToday && !isSelected) {
            style += `border: 1.5px solid var(--color-it); color: var(--color-it);`;
        }

        if (isSelected) {
            style += `background-color: var(--color-success) !important; color: white !important; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);`;
        } else {
            style += `color: var(--text-main);`;
        }

        html += `<div class="cal-day-cell" data-date="${year}-${month + 1}-${d}" style="${style}">${d}</div>`;
    }

    const totalRendered = startDay + totalDays;
    const remaining = 42 - totalRendered;
    for (let i = 1; i <= remaining; i++) {
        html += `<div style="padding: 0.6rem 0; font-size: 0.9rem; color: rgba(156, 163, 175, 0.3); cursor: not-allowed;">${i}</div>`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

function handleCalendarDayClick(dateStr) {
    const clickedDate = new Date(dateStr);
    
    // Automatic single-day leave logic
    if (selectedLeaveStart && 
        selectedLeaveStart.getDate() === clickedDate.getDate() &&
        selectedLeaveStart.getMonth() === clickedDate.getMonth() &&
        selectedLeaveStart.getFullYear() === clickedDate.getFullYear()) {
        selectedLeaveStart = null;
    } else {
        selectedLeaveStart = clickedDate;
    }
    selectedLeaveEnd = null;
    
    const container = document.getElementById('leave-content-container');
    if (container) {
        renderEmployeeLeave(container);
    }
}

function renderEmployeeLeave(container) {
    const myLeaves = mockData.leaveRequests.filter(req => req.empId === mockData.currentUser.id);
    let leaveHtml = '';
    myLeaves.forEach(req => {
        const badge = req.status === 'pending' ? 'pending' : (req.status === 'approved' ? 'paid' : 'unpaid');
        leaveHtml += `<tr>
            <td>${req.date}</td>
            <td>${req.reason}</td>
            <td><span class="status-badge ${badge}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
        </tr>`;
    });

    const leaveBalance = mockData.currentUser.leaveBalance || 0;

    let dateSelectionText = '<span style="color: var(--text-muted); font-style: italic;">Select a date on calendar</span>';
    
    const formatDateNice = (d) => {
        return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (selectedLeaveStart) {
        dateSelectionText = `<strong style="color: var(--color-success);">${formatDateNice(selectedLeaveStart)}</strong> (1 day leave)`;
    }

    container.innerHTML = `
        <div class="dashboard-split" style="gap: 1.5rem; display: flex; flex-wrap: wrap;">
            <!-- Left Side: Leaves Balance & Calendar Selector -->
            <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="card text-center" style="padding: 1.5rem; display: flex; justify-content: space-around; align-items: center;">
                    <div>
                        <h3 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem;">Paid Leaves Left</h3>
                        <div style="font-size: 3rem; font-weight: 800; color: var(--color-success); line-height: 1;">${leaveBalance}</div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Allocated: 1 / month</span>
                    </div>
                    <div style="height: 50px; width: 1px; background: var(--border-color);"></div>
                    <div style="text-align: left;">
                        <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem;">Quick Instructions:</h4>
                        <ol style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                            <li>Click a date on the calendar.</li>
                            <li>Provide a reason and submit.</li>
                            <li>(Automatically logs as a 1-day leave)</li>
                        </ol>
                    </div>
                </div>
                
                ${generateCalendarHtml(calCurrentYear, calCurrentMonth)}
            </div>
            
            <!-- Right Side: Request Details Form & Request Log -->
            <div style="flex: 1.2; min-width: 320px; display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="card" style="padding: 1.5rem;">
                    <div class="card-header" style="margin-bottom: 1rem;">
                        <h2>New Leave Request Form</h2>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-page); border: 1px solid var(--border-color); border-radius: 0.5rem; font-size: 0.95rem;">
                        <strong>Selection:</strong> ${dateSelectionText}
                    </div>
                    <div class="form-group" style="margin-bottom: 1.25rem;">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: var(--text-main);">Reason for Leave <span style="color: var(--color-danger);">*</span></label>
                        <textarea class="form-control" id="form-leave-calendar-reason" placeholder="Please provide the compulsory reason for this leave request..." required style="min-height: 80px; padding: 0.75rem; font-family: inherit; font-size: 0.95rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: var(--bg-page); color: var(--text-main); width: 100%; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="action-btn" id="btn-reset-leave-selection" style="border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; transition: var(--transition); background: var(--bg-page); color: var(--text-main);">Reset Selection</button>
                        <button class="primary-btn" id="btn-submit-leave-app" style="background-color: var(--color-it); font-weight: 600; flex: 1; border-radius: 0.5rem; cursor: pointer;">Submit Leave Application</button>
                    </div>
                </div>
                
                <div class="card" style="padding: 1.5rem;">
                    <div class="card-header" style="margin-bottom: 1rem;">
                        <h2>My Leave Applications Log</h2>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead><tr><th>Date</th><th>Reason</th><th>Status</th></tr></thead>
                            <tbody>${leaveHtml || '<tr><td colspan="3" class="text-center text-muted" style="padding: 1rem 0;">No past leave applications found.</td></tr>'}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.cal-day-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const dateStr = cell.getAttribute('data-date');
            handleCalendarDayClick(dateStr);
        });
    });

    const prevMonthBtn = document.getElementById('cal-prev-month');
    const nextMonthBtn = document.getElementById('cal-next-month');
    
    prevMonthBtn?.addEventListener('click', () => {
        calCurrentMonth--;
        if (calCurrentMonth < 0) {
            calCurrentMonth = 11;
            calCurrentYear--;
        }
        renderEmployeeLeave(container);
    });

    nextMonthBtn?.addEventListener('click', () => {
        calCurrentMonth++;
        if (calCurrentMonth > 11) {
            calCurrentMonth = 0;
            calCurrentYear++;
        }
        renderEmployeeLeave(container);
    });

    const resetBtn = document.getElementById('btn-reset-leave-selection');
    resetBtn?.addEventListener('click', () => {
        selectedLeaveStart = null;
        renderEmployeeLeave(container);
    });

    const submitBtn = document.getElementById('btn-submit-leave-app');
    submitBtn?.addEventListener('click', () => {
        const reason = document.getElementById('form-leave-calendar-reason').value;
        if (!selectedLeaveStart) {
            return alert('Please select a date on the calendar first.');
        }
        if (!reason.trim()) {
            return alert('The leave application reason is compulsory. Please enter the reason.');
        }

        const formatDateShort = (d) => {
            return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
        };

        const displayDate = `${formatDateShort(selectedLeaveStart)}`;

        mockData.leaveRequests.push({
            id: Date.now(),
            empId: mockData.currentUser.id,
            date: displayDate,
            reason: reason,
            status: 'pending'
        });

        // Notify Admin of new leave application
        addNotification(
            'admin', 
            null, 
            'New Leave Request', 
            `Leave request submitted by ${mockData.currentUser.name} for ${displayDate}: "${reason}"`, 
            'ph-calendar-plus'
        );

        selectedLeaveStart = null;
        
        alert('Your leave application was sent successfully. The administrator will review it shortly.');
        renderLeaveModule();
    });
}

function renderAdminLeave(container) {
    let pendingHtml = '';
    let historyRequestsHtml = '';

    mockData.leaveRequests.forEach(req => {
        const emp = mockData.team.find(e => e.id === req.empId);
        if (!emp) return;
        
        if (req.status === 'pending') {
            pendingHtml += `<tr>
                <td><div class="employee-cell"><img src="${emp.avatar}" class="team-avatar">${emp.name}</div></td>
                <td>${req.date}</td>
                <td>${req.reason}</td>
                <td><span class="status-badge pending">Pending</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="primary-btn btn-approve-leave" data-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-success); cursor: pointer;"><i class="ph ph-check"></i> Approve</button>
                        <button class="action-btn btn-reject-leave" data-id="${req.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; border: 1px solid var(--color-danger); color: var(--color-danger); display: flex; align-items: center; gap: 0.25rem; cursor: pointer;"><i class="ph ph-x"></i> Reject</button>
                    </div>
                </td>
            </tr>`;
        } else {
            const statusBadge = req.status === 'approved' ? '<span class="status-badge paid">Approved</span>' : '<span class="status-badge unpaid">Rejected</span>';
            historyRequestsHtml += `<tr>
                <td><div class="employee-cell"><img src="${emp.avatar}" class="team-avatar">${emp.name}</div></td>
                <td>${req.date}</td>
                <td>${req.reason}</td>
                <td>${statusBadge}</td>
            </tr>`;
        }
    });

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            <div class="card">
                <div class="card-header" style="margin-bottom: 1rem;">
                    <h2>Pending Leave Applications</h2>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Employee</th><th>Date</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>${pendingHtml || '<tr><td colspan="5" class="text-center text-muted" style="padding: 1.5rem 0;">No pending leave applications.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header" style="margin-bottom: 1rem;">
                    <h2>Leave Application History Log</h2>
                </div>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead><tr><th>Employee</th><th>Date</th><th>Reason</th><th>Status</th></tr></thead>
                        <tbody>${historyRequestsHtml || '<tr><td colspan="4" class="text-center text-muted" style="padding: 1.5rem 0;">No processed leave history logs.</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.btn-approve-leave').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const req = mockData.leaveRequests.find(r => r.id === id);
            if (req) {
                req.status = 'approved';
                const emp = mockData.team.find(e => e.id === req.empId);
                if (emp && emp.leaveBalance > 0) emp.leaveBalance--;
                
                // Notify Employee of Approval
                addNotification(
                    'employee', 
                    req.empId, 
                    'Leave Request Approved', 
                    `Your leave request for ${req.date} has been Approved by the Admin.`, 
                    'ph-calendar-check'
                );

                renderLeaveModule();
                renderHR();
            }
        });
    });

    container.querySelectorAll('.btn-reject-leave').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const req = mockData.leaveRequests.find(r => r.id === id);
            if (req) {
                req.status = 'rejected';
                
                // Notify Employee of Rejection
                addNotification(
                    'employee', 
                    req.empId, 
                    'Leave Request Rejected', 
                    `Your leave request for ${req.date} has been Rejected by the Admin.`, 
                    'ph-calendar-x'
                );

                renderLeaveModule();
                renderHR();
            }
        });
    });
}

// Real-Time Notification & Dropdown System Helper functions
const savedNotifs = localStorage.getItem('vedanco_notifications');
if (savedNotifs) {
    mockData.notifications = JSON.parse(savedNotifs);
}

function addNotification(recipientRole, recipientId, title, message, iconClass = 'ph-info') {
    const notification = {
        id: Date.now() + Math.random(),
        recipientRole,
        recipientId,
        title,
        message,
        iconClass,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
    };
    
    mockData.notifications.unshift(notification);
    localStorage.setItem('vedanco_notifications', JSON.stringify(mockData.notifications));

    const currentUser = mockData.currentUser;
    if (currentUser) {
        const isAdmin = currentUser.role === 'admin';
        const isRecipient = (recipientRole === 'admin' && isAdmin) || 
                            (recipientRole === 'employee' && currentUser.id === recipientId);
        
        if (isRecipient) {
            showToast(title, message, iconClass);
            updateNotificationsUI();
        }
    }
}

window.showToast = function showToast(title, message, iconClass = 'ph-info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-card';
    toast.innerHTML = `
        <i class="ph ${iconClass}" style="font-size: 1.5rem; color: var(--color-it);"></i>
        <div>
            <strong style="display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.15rem;">${title}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.3;">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function updateNotificationsUI() {
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notifications-list');
    const unreadCountText = document.getElementById('unread-count-text');
    
    if (!badge || !list) return;
    
    const currentUser = mockData.currentUser;
    if (!currentUser) return;

    const isAdmin = currentUser.role === 'admin';
    const myNotifications = mockData.notifications.filter(n => {
        if (isAdmin) {
            return n.recipientRole === 'admin';
        } else {
            return n.recipientRole === 'employee' && n.recipientId === currentUser.id;
        }
    });

    const unreadCount = myNotifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
        unreadCountText.textContent = `${unreadCount} unread`;
    } else {
        badge.style.display = 'none';
        unreadCountText.textContent = `0 unread`;
    }

    if (myNotifications.length === 0) {
        list.innerHTML = `
            <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                No notifications yet.
            </div>
        `;
        return;
    }

    list.innerHTML = myNotifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notification-item-icon">
                <i class="ph ${n.iconClass}"></i>
            </div>
            <div class="notification-item-content">
                <strong style="font-weight: 600; color: var(--text-main);">${n.title}</strong>
                <span style="color: var(--text-muted);">${n.message}</span>
                <span class="notification-item-time">${n.time}</span>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseFloat(item.getAttribute('data-id'));
            const n = mockData.notifications.find(notif => notif.id === id);
            if (n) {
                n.read = true;
                localStorage.setItem('vedanco_notifications', JSON.stringify(mockData.notifications));
                updateNotificationsUI();
            }
        });
    });
}

function initNotificationsSystem() {
    const bellBtn = document.getElementById('header-bell-btn');
    const dropdown = document.getElementById('notifications-dropdown');
    const clearBtn = document.getElementById('btn-clear-notifications');

    if (bellBtn && dropdown) {
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== bellBtn) {
                dropdown.classList.remove('show');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const currentUser = mockData.currentUser;
            if (!currentUser) return;
            const isAdmin = currentUser.role === 'admin';
            
            mockData.notifications = mockData.notifications.filter(n => {
                if (isAdmin) {
                    return n.recipientRole !== 'admin';
                } else {
                    return !(n.recipientRole === 'employee' && n.recipientId === currentUser.id);
                }
            });
            localStorage.setItem('vedanco_notifications', JSON.stringify(mockData.notifications));
            updateNotificationsUI();
        });
    }
}

function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const btnOpen = document.getElementById('header-settings-btn');
    const btnClose = document.getElementById('close-settings-btn');

    if (!modal) return;

    // Tabs functionality
    const tabButtons = modal.querySelectorAll('.settings-tab-btn');
    const tabPanels = modal.querySelectorAll('.settings-tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // Populate data when modal opens
    function populateSettingsForm() {
        const user = mockData.currentUser;
        if (!user) return;

        // Reset tabs to profile
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        tabButtons[0].classList.add('active');
        tabPanels[0].classList.add('active');

        // Profile tab fields
        document.getElementById('settings-profile-name').value = user.name || '';
        document.getElementById('settings-profile-phone').value = user.phone || '';
        document.getElementById('settings-profile-title').value = user.title || '';

        // Photo tab fields
        document.getElementById('settings-photo-preview').src = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
        document.getElementById('settings-photo-url').value = user.avatar && !user.avatar.startsWith('data:') ? user.avatar : '';
        document.getElementById('settings-photo-file').value = ''; // Reset file input

        // Email tab fields
        document.getElementById('settings-email-input').value = user.email || '';

        // Password tab fields
        document.getElementById('settings-pwd-current').value = '';
        document.getElementById('settings-pwd-new').value = '';
        document.getElementById('settings-pwd-confirm').value = '';
    }

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            populateSettingsForm();
            modal.classList.add('show');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => modal.classList.remove('show'));
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    // Submits and Updates
    function updateUserData(updates) {
        const user = mockData.currentUser;
        if (!user) return;

        Object.assign(user, updates);

        // Sync with team array
        const teamMember = mockData.team.find(t => t.id === user.id);
        if (teamMember) {
            Object.assign(teamMember, updates);
        }

        // Persist
        localStorage.setItem('vedanco_team_data', JSON.stringify(mockData.team));

        // Update sidebar
        const sideName = document.getElementById('current-user-name');
        const sideRole = document.getElementById('current-user-role');
        const sideAvatar = document.getElementById('current-user-avatar');

        if (sideName) sideName.textContent = user.name;
        if (sideRole) sideRole.textContent = user.title;
        if (sideAvatar) sideAvatar.src = user.avatar;

        renderAllModules();
    }

    // Form Profile
    const formProfile = document.getElementById('settings-form-profile');
    if (formProfile) {
        formProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('settings-profile-name').value;
            const phone = document.getElementById('settings-profile-phone').value;
            const title = document.getElementById('settings-profile-title').value;

            updateUserData({ name, phone, title });
            showToast('Profile information saved successfully!', 'success');
            modal.classList.remove('show');
        });
    }

    // Email Settings Form
    const formEmail = document.getElementById('settings-form-email');
    if (formEmail) {
        formEmail.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('settings-email-input').value;

            updateUserData({ email });
            showToast('Email settings updated successfully!', 'success');
            modal.classList.remove('show');
        });
    }

    // Change Password Form
    const formPassword = document.getElementById('settings-form-password');
    if (formPassword) {
        formPassword.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = mockData.currentUser;
            if (!user) return;

            const currentPwd = document.getElementById('settings-pwd-current').value;
            const newPwd = document.getElementById('settings-pwd-new').value;
            const confirmPwd = document.getElementById('settings-pwd-confirm').value;

            if (currentPwd !== user.password) {
                return showToast('Incorrect current password!', 'error');
            }
            if (newPwd !== confirmPwd) {
                return showToast('New passwords do not match!', 'error');
            }

            updateUserData({ password: newPwd });
            showToast('Password updated successfully!', 'success');
            modal.classList.remove('show');
        });
    }

    // Handle Profile Photo Upload / File selection
    const photoFileInput = document.getElementById('settings-photo-file');
    const photoPreview = document.getElementById('settings-photo-preview');
    let base64PhotoData = null;

    if (photoFileInput && photoPreview) {
        photoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                base64PhotoData = event.target.result;
                photoPreview.src = base64PhotoData;
            };
            reader.readAsDataURL(file);
        });
    }

    // Photo tab save button
    const photoSaveBtn = document.getElementById('settings-photo-save');
    if (photoSaveBtn) {
        photoSaveBtn.addEventListener('click', () => {
            const urlInputVal = document.getElementById('settings-photo-url').value.trim();
            let newAvatar = mockData.currentUser.avatar;

            // Priority: if a new file is uploaded, use base64PhotoData. Otherwise, check URL input.
            if (base64PhotoData) {
                newAvatar = base64PhotoData;
            } else if (urlInputVal) {
                newAvatar = urlInputVal;
            } else {
                return showToast('Please select a file or enter an image URL!', 'error');
            }

            updateUserData({ avatar: newAvatar });
            base64PhotoData = null; // Clear cached file
            showToast('Profile photo updated successfully!', 'success');
            modal.classList.remove('show');
        });
    }
}

function initPasswordToggles() {
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<i class="ph ph-eye-slash"></i>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<i class="ph ph-eye"></i>';
            }
        });
    });
}


