import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  DocumentIcon,
  GiftIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const closeAllDropdowns = () => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading user data...</p>
        </div>
      </div>
    );
  }

  const getNavigationItems = () => {
    if (!user || !user.role) return [];

    const baseNav = [
      { name: 'Overview', href: `/dashboard/${user.role}`, icon: HomeIcon },
    ];

    if (user.role === 'admin') {
      baseNav.push(
        { name: 'Users', href: '/dashboard/admin/users', icon: UserGroupIcon },
        { name: 'Pets', href: '/dashboard/admin/pets', icon: HeartIcon },
        { name: 'Adoptions', href: '/dashboard/admin/adoptions', icon: DocumentIcon },
        { name: 'Donations', href: '/dashboard/admin/donations', icon: GiftIcon },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Cog6ToothIcon }
      );
    } else if (user.role === 'shelter') {
      baseNav.push(
        { name: 'Add Pet', href: '/dashboard/shelter/add-pet', icon: PlusIcon },
        { name: 'My Pets', href: '/dashboard/shelter/pets', icon: HeartIcon },
        { name: 'Adoptions', href: '/dashboard/shelter/adoptions', icon: DocumentIcon },
        { name: 'Donations', href: '/dashboard/shelter/donations', icon: GiftIcon },
        { name: 'Analytics', href: '/dashboard/shelter/analytics', icon: ChartBarIcon },
        { name: 'Settings', href: '/dashboard/shelter/settings', icon: Cog6ToothIcon }
      );
    } else if (user.role === 'user') {
      baseNav.push(
        { name: 'My Applications', href: '/dashboard/user/applications', icon: DocumentIcon },
        { name: 'Favorites', href: '/favorites', icon: HeartIcon },
        { name: 'Settings', href: '/dashboard/user/settings', icon: Cog6ToothIcon }
      );
    }
    return baseNav;
  };

  const navigation = getNavigationItems();

  const isActive = (href) => {
    if (href === `/dashboard/${user.role}`) {
      return location.pathname === href || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin': return 'from-cyan-400 to-purple-400';
      case 'shelter': return 'from-emerald-400 to-teal-400';
      case 'user': return 'from-pink-400 to-rose-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRoleGradient = () => {
    switch (user.role) {
      case 'admin': return 'from-cyan-500 to-purple-500';
      case 'shelter': return 'from-emerald-500 to-teal-500';
      case 'user': return 'from-pink-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* User menu backdrop */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}

      {/* Side Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col w-full h-full bg-slate-800 border-r border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            <Link to="/" className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center`}>
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">PetAdopt</span>
                <p className="text-xs text-slate-400 capitalize">{user.role} Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center text-white font-semibold`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-[110]"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <span className="mr-2">🚪</span>
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-4">
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-3">
                Navigation
              </p>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-r ${getRoleGradient()}/20 text-white border-l-4 border-${user.role === 'admin' ? 'cyan' : user.role === 'shelter' ? 'emerald' : 'pink'}-400`
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? `text-${user.role === 'admin' ? 'cyan' : user.role === 'shelter' ? 'emerald' : 'pink'}-400` : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Back to Website */}
          <div className="p-4 border-t border-slate-700">
            <Link
              to="/"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className={`w-8 h-8 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center`}>
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">PetAdopt</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
