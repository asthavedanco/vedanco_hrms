// Mock Data for the Vedanco Group Business Suite
const verticals = [
    { id: 'it', name: 'IT', color: 'var(--color-it)' },
    { id: 'ai', name: 'AI Solutions', color: 'var(--color-ai)' },
    { id: 'logistics', name: 'Logistics', color: 'var(--color-logistics)' },
    { id: 'interior', name: 'Interior', color: 'var(--color-interior)' },
    { id: 'import', name: 'Import/Export', color: 'var(--color-import)' },
    { id: 'digital', name: 'Digital Mkt', color: 'var(--color-digital)' }
];

const team = [
    // ADMINS
    { id: 1, name: 'Nachiket Patel', role: 'admin', vertical: null, title: 'Managing Director', avatar: 'https://ui-avatars.com/api/?name=Nachiket+Patel&background=1E472C&color=fff', password: 'admin', gender: 'Male' },
    
    // EMPLOYEES
    { id: 2, name: 'Yug Ladani', role: 'employee', vertical: 'it', title: 'Operations Head', avatar: 'https://ui-avatars.com/api/?name=Yug+Ladani&background=1E472C&color=fff', password: 'yug@vedanco', gender: 'Male' },
    { id: 3, name: 'Happy', role: 'employee', vertical: 'it', title: 'System Administrator', avatar: 'https://ui-avatars.com/api/?name=Happy&background=1E472C&color=fff', password: 'happy@vedanco', gender: 'Male' },
    { id: 4, name: 'Astha', role: 'employee', vertical: 'ai', title: 'AI Specialist', avatar: 'https://ui-avatars.com/api/?name=Astha&background=1E472C&color=fff', password: 'astha@vedanco', gender: 'Female' },
    { id: 5, name: 'Ridhhi', role: 'employee', vertical: 'interior', title: 'Lead Designer', avatar: 'https://ui-avatars.com/api/?name=Ridhhi&background=1E472C&color=fff', password: 'ridhhi@vedanco', gender: 'Female' },
    { id: 6, name: 'Shahi', role: 'employee', vertical: 'it', title: 'Systems Engineer', avatar: 'https://ui-avatars.com/api/?name=Shahi&background=1E472C&color=fff', password: 'shahi@vedanco', gender: 'Male' },
    { id: 7, name: 'Khush', role: 'employee', vertical: 'logistics', title: 'Fleet Manager', avatar: 'https://ui-avatars.com/api/?name=Khush&background=1E472C&color=fff', password: 'khush@vedanco', gender: 'Male' },
    { id: 8, name: 'Nihar', role: 'employee', vertical: 'import', title: 'Customs Officer', avatar: 'https://ui-avatars.com/api/?name=Nihar&background=1E472C&color=fff', password: 'nihar@vedanco', gender: 'Male' },
    { id: 9, name: 'Vishal', role: 'employee', vertical: 'digital', title: 'Marketing Lead', avatar: 'https://ui-avatars.com/api/?name=Vishal&background=1E472C&color=fff', password: 'vishal@vedanco', gender: 'Male' }
];

const leads = [
    // Data dynamically populated
];

const tasks = [
    // Data dynamically populated
];

const timeLogs = [];

const projects = [
    { id: 301, name: "TechCorp System Upgrade", client: "TechCorp Inc.", vertical: "it", progress: 85, status: "On Track", assignees: [6,8] },
    { id: 302, name: "Predictive Demand Model", client: "DataWiz LLC", vertical: "ai", progress: 40, status: "At Risk", assignees: [4] },
    { id: 303, name: "Euro Route Plan", client: "Global Trade Co.", vertical: "logistics", progress: 65, status: "On Track", assignees: [7] },
    { id: 304, name: "Startup Hub HQ", client: "Startup Hub", vertical: "interior", progress: 20, status: "Off Track", assignees: [5] },
    { id: 305, name: "Asia Import Licensing", client: "Asian Traders Ltd.", vertical: "import", progress: 95, status: "On Track", assignees: [8] },
    { id: 306, name: "Q3 Marketing Campaigns", client: "RetailGiant", vertical: "digital", progress: 50, status: "On Track", assignees: [9] }
];

const liveTracking = {};
team.forEach(emp => {
    if (emp.role === 'employee') {
        let defaultStatus = 'work';
        let defaultSecs = 3600 + (emp.id * 500); // give them some initial fake time
        if (emp.id === 4) defaultStatus = 'leave';
        else if (emp.id === 5) defaultStatus = 'lunch';
        else if (emp.id === 7) defaultStatus = 'tea';
        else if (emp.id === 8) defaultStatus = 'offline';
        
        liveTracking[emp.id] = {
            status: defaultStatus,
            seconds: defaultStatus === 'leave' || defaultStatus === 'offline' ? 0 : defaultSecs,
            workSeconds: defaultStatus === 'work' ? defaultSecs : (defaultStatus === 'leave' || defaultStatus === 'offline' ? 0 : 3600),
            lunchSeconds: defaultStatus === 'lunch' ? defaultSecs : (defaultStatus === 'leave' || defaultStatus === 'offline' ? 0 : 300),
            teaSeconds: defaultStatus === 'tea' ? defaultSecs : (defaultStatus === 'leave' || defaultStatus === 'offline' ? 0 : 100)
        };
    }
});

const leaveRequests = [];

team.forEach(emp => {
    if(emp.role === 'employee') emp.leaveBalance = 1; // Monthly paid leave setup
});

const mockData = {
    verticals,
    team,
    leads,
    tasks,
    timeLogs,
    projects,
    leaveRequests,
    liveTracking,
    notifications: [],
    currentUser: null // Require login explicitly
};
