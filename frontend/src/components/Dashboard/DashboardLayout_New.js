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
        // { name: 'Favorites', href: '/dashboard/user/favorites', icon: HeartIcon },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700/50">
            <Link to="/" className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${getRoleGradient()} rounded-xl flex items-center justify-center shadow-lg`}>
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className={`text-xl font-bold bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
                  PetAdopt
                </span>
                <p className="text-xs text-gray-400 capitalize">{user.role} Portal</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col flex-1">
            <div className="flex-1 px-4 py-6">
              {/* User Profile */}
              <div className="mb-8 relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-3 px-3 py-3 rounded-xl hover:bg-gray-800/50 transition-colors w-full border border-transparent hover:border-gray-700/50"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${getRoleGradient()} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-lg font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize flex items-center">
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      {user?.role}
                    </p>
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
                      className="absolute top-full left-3 right-3 mt-2 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 py-2 z-[110]"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <span className="mr-3">🚪</span>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-4">
                  Navigation
                </p>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        active
                          ? `bg-gradient-to-r ${getRoleGradient()}/20 text-white border border-gray-600/50 shadow-lg`
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                      <span>{item.name}</span>
                      {active && (
                        <div className={`ml-auto w-2 h-2 bg-gradient-to-r ${getRoleGradient()} rounded-full`}></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Back to Website */}
            <div className="p-4 border-t border-gray-700/50">
              <Link
                to="/"
                className="flex items-center space-x-3 px-3 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Back to Website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div className={`w-8 h-8 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center`}>
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-lg font-bold bg-gradient-to-r ${getRoleColor()} bg-clip-text text-transparent`}>
                PetAdopt
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
