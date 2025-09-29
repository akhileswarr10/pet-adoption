import React, { useState } from 'react';
import { PawPrint, Calendar, User, Dog, Cat, CheckCircle, Clock, ClipboardList, Menu, X, Rocket, Settings } from 'lucide-react';

// =================================================================
// 1. STYLES DEFINITION (Separation of CSS logic)
//    All Tailwind classes are defined here, mimicking a separate CSS file/module.
// =================================================================

const styles = {
    // --- Layout & General ---
    mainContainer: "min-h-screen bg-gray-50 flex",
    mainContent: "flex-1 lg:ml-64 p-4 sm:p-6 transition-all duration-300",
    headerSection: "mb-6 pt-10 lg:pt-0",
    headerTitle: "text-3xl font-extrabold text-gray-900",
    headerSubtitle: "text-gray-500",
    gridMetrics: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
    gridPanels: "grid grid-cols-1 lg:grid-cols-3 gap-6",
    panelCard: "bg-white rounded-xl shadow-lg p-6",
    panelTitle: "text-xl font-bold text-gray-900 mb-4 border-b pb-2",
    viewAllButton: "mt-4 w-full text-indigo-600 font-medium py-2 rounded-lg hover:bg-indigo-50 transition duration-150",

    // --- Sidebar ---
    sidebarBase: "w-64 bg-white border-r border-gray-200 shadow-xl fixed left-0 top-0 bottom-0 z-30",
    sidebarHeader: "flex items-center justify-between p-2 rounded-lg bg-indigo-600 text-white",
    sidebarNavLinkBase: "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out",
    sidebarNavLinkActive: "bg-indigo-500 text-white shadow-md",
    sidebarNavLinkInactive: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    sidebarFooter: "p-3 bg-gray-100 rounded-lg",
    
    // --- Card Elements ---
    metricCardBase: "bg-white p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl hover:scale-[1.02]",
    metricIconWrapper: "p-3 inline-flex rounded-full", // Color and BG added dynamically
    metricValue: "mt-4 text-3xl font-extrabold text-gray-900",
    metricTitle: "mt-1 text-sm font-medium text-gray-500",

    // --- Pet List Elements ---
    petItemBase: "flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0",
    petImage: "w-12 h-12 object-cover rounded-full ring-2 ring-indigo-300",
    petName: "text-base font-semibold text-gray-900",
    petDetails: "text-sm text-gray-500",
    petAgeBadge: "text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full",

    // --- Application Elements ---
    appRowBase: "flex items-center space-x-4 py-3 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer",
    appUserIcon: "text-gray-400",
    appDetailText: "text-sm font-medium text-gray-800",
    appPetName: "font-bold text-indigo-600",
    appDate: "text-xs text-gray-400 mt-0.5",
    appStatusBadge: "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold", // Dynamic color added below
};


// =================================================================
// 2. MOCK DATA (Application Data)
// =================================================================

const mockMetrics = [
    { icon: PawPrint, title: "Total Pets Available", value: 42, color: "text-blue-500", bg: "bg-blue-100" },
    { icon: ClipboardList, title: "Pending Applications", value: 15, color: "text-orange-500", bg: "bg-orange-100" },
    { icon: Rocket, title: "Adoptions This Month", value: 7, color: "text-emerald-500", bg: "bg-emerald-100" },
    { icon: Calendar, title: "Shelter Events", value: 3, color: "text-purple-500", bg: "bg-purple-100" },
];

const mockPets = [
    { id: 1, name: "Luna", species: "Dog", breed: "Beagle Mix", age: 2, imageUrl: "https://placehold.co/100x100/1e40af/ffffff?text=D1" },
    { id: 2, name: "Mittens", species: "Cat", breed: "Tabby", age: 5, imageUrl: "https://placehold.co/100x100/f59e0b/ffffff?text=C1" },
    { id: 3, name: "Rocky", species: "Dog", breed: "German Shepherd", age: 8, imageUrl: "https://placehold.co/100x100/dc2626/ffffff?text=D2" },
    { id: 4, name: "Shadow", species: "Cat", breed: "Siamese", age: 1, imageUrl: "https://placehold.co/100x100/10b981/ffffff?text=C2" },
];

const mockApplications = [
    { id: 101, applicant: "Jane Doe", petName: "Luna", status: "Approved", date: "2024-09-28" },
    { id: 102, applicant: "John Smith", petName: "Mittens", status: "Review", date: "2024-09-27" },
    { id: 103, applicant: "Alex Chan", petName: "Rocky", status: "Rejected", date: "2024-09-26" },
];

// =================================================================
// 3. COMPONENTS (Application Logic and Structure)
// =================================================================

const MetricCard = ({ icon: Icon, title, value, color, bg }) => (
    <div className={styles.metricCardBase}>
        <div className={`${styles.metricIconWrapper} ${bg} ${color}`}>
            <Icon size={24} strokeWidth={2.5} />
        </div>
        <h3 className={styles.metricValue}>{value}</h3>
        <p className={styles.metricTitle}>{title}</p>
    </div>
);

const PetListItem = ({ name, species, breed, age, imageUrl }) => (
    <div className={styles.petItemBase}>
        <img
            src={imageUrl}
            alt={name}
            className={styles.petImage}
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/e0e7ff/3f3f46?text=Pet"; }}
        />
        <div className="flex-grow">
            <p className={styles.petName}>{name}</p>
            <p className={styles.petDetails}>{breed} ({species})</p>
        </div>
        <span className={styles.petAgeBadge}>{age} yrs</span>
    </div>
);

const ApplicationRow = ({ applicant, petName, status, date }) => {
    let statusClasses;
    let StatusIcon;

    switch (status) {
        case 'Approved':
            statusClasses = 'text-green-600 bg-green-100';
            StatusIcon = CheckCircle;
            break;
        case 'Review':
            statusClasses = 'text-yellow-600 bg-yellow-100';
            StatusIcon = Clock;
            break;
        case 'Rejected':
        default:
            statusClasses = 'text-red-600 bg-red-100';
            StatusIcon = X;
            break;
    }

    return (
        <div className={styles.appRowBase}>
            <User size={18} className={styles.appUserIcon} />
            <div className="flex-grow">
                <p className={styles.appDetailText}>
                    {applicant} applying for <span className={styles.appPetName}>{petName}</span>
                </p>
                <p className={styles.appDate}>Applied on {date}</p>
            </div>
            <div className={`${styles.appStatusBadge} ${statusClasses}`}>
                <StatusIcon size={14} />
                <span>{status}</span>
            </div>
        </div>
    );
};

const Sidebar = ({ setIsSidebarOpen }) => {
    const navMap = [
        { name: 'Dashboard', icon: ClipboardList, active: true },
        { name: 'Pets', icon: Dog, active: false },
        { name: 'Applications', icon: User, active: false },
        { name: 'Users', icon: Cat, active: false },
        { name: 'Settings', icon: Settings, active: false },
    ];

    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <div className="flex items-center">
                    <PawPrint className="mr-2" />
                    <span className="text-xl font-bold">PetDash</span>
                </div>
                {/* Mobile close button */}
                <button className="lg:hidden p-1 rounded-full hover:bg-indigo-700" onClick={() => setIsSidebarOpen(false)}>
                    <X size={20} />
                </button>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex-grow space-y-2">
                {navMap.map((item) => (
                    <a
                        key={item.name}
                        href="#"
                        className={`${styles.sidebarNavLinkBase} ${item.active ? styles.sidebarNavLinkActive : styles.sidebarNavLinkInactive}`}
                    >
                        <item.icon size={18} className="mr-3" />
                        {item.name}
                    </a>
                ))}
            </nav>
            
            {/* Footer / User Info */}
            <div className={styles.sidebarFooter}>
                <p className="text-sm font-bold text-gray-800">Shelter Admin</p>
                <p className="text-xs text-gray-500">pet.admin@shelter.org</p>
            </div>
        </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---

const App = () => {
    // Application State Management
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.mainContainer}>
            
            {/* 1. Desktop Sidebar */}
            <aside className={`hidden lg:block ${styles.sidebarBase}`}>
                <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
            </aside>

            {/* 2. Mobile Sidebar Toggle Button */}
            <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* 3. Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* 4. Mobile Sidebar Drawer */}
            <aside
                className={`fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-2xl transition-transform duration-300 transform lg:hidden 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
            >
                <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
            </aside>

            {/* 5. Main Content Area */}
            <main className={styles.mainContent}>
                
                {/* Header */}
                <header className={styles.headerSection}>
                    <h1 className={styles.headerTitle}>Shelter Dashboard</h1>
                    <p className={styles.headerSubtitle}>Welcome back! Here's an overview of your pet adoption system.</p>
                </header>

                {/* Metric Cards Grid */}
                <section className={styles.gridMetrics}>
                    {mockMetrics.map((metric, index) => (
                        <MetricCard key={index} {...metric} />
                    ))}
                </section>

                <div className={styles.gridPanels}>
                    
                    {/* Recent Applications Panel */}
                    <section className={`lg:col-span-2 ${styles.panelCard}`}>
                        <h2 className={styles.panelTitle}>Recent Adoption Applications</h2>
                        <div className="divide-y divide-gray-100">
                            {mockApplications.map(app => (
                                <ApplicationRow key={app.id} {...app} />
                            ))}
                        </div>
                        <button className={styles.viewAllButton}>
                            View All Applications
                        </button>
                    </section>
                    
                    {/* Available Pets Panel */}
                    <section className={`lg:col-span-1 ${styles.panelCard}`}>
                        <h2 className={styles.panelTitle}>Currently Available Pets</h2>
                        <div className="divide-y divide-gray-100">
                            {mockPets.map(pet => (
                                <PetListItem key={pet.id} {...pet} />
                            ))}
                        </div>
                        <button className={styles.viewAllButton}>
                            Manage Pet Listings
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default App;