import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  HeartIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  GiftIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDonationsSidebarOpen, setIsDonationsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    closeAllDropdowns();
  };

  const closeAllDropdowns = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsDonationsSidebarOpen(false);
  };

  // Close all dropdowns when location changes
  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname]);

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Navigation items based on user role
  const getNavigation = () => {
    const baseNav = [
      { name: 'Home', href: '/', icon: HomeIcon },
      { name: 'Find Pets', href: '/pets', icon: HeartIcon },
    ];

    // Add role-specific navigation
    if (user?.role === 'shelter') {
      baseNav.push({ name: 'Add Pet', href: '/shelter/add-pet', icon: GiftIcon });
    } else if (user?.role === 'user' || !user) {
      // Regular users and non-logged in users can donate pets
      baseNav.push({ name: 'Donate Pet', href: '/donate', icon: GiftIcon });
    }

    return baseNav;
  };

  const navigation = getNavigation();

  // Fetch donations stats for admin sidebar
  const { data: stats, isLoading: statsLoading } = useQuery(
    'navbar-donations-stats',
    async () => {
      const response = await axios.get('/donations/stats/overview');
      return response.data;
    },
    {
      enabled: !!user && user.role === 'admin',
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleGradient = () => {
    if (!user) return 'from-blue-500 to-purple-500';
    switch (user.role) {
      case 'admin': return 'from-cyan-500 to-purple-500';
      case 'shelter': return 'from-emerald-500 to-teal-500';
      case 'user': return 'from-pink-500 to-rose-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className={`w-8 h-8 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center shadow-lg`}>
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">PetAdopt</span>
                {user && (
                  <p className="text-xs text-slate-400 capitalize">{user.role} Portal</p>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? `text-white bg-gradient-to-r ${getRoleGradient()}/20 border border-slate-600/50`
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Admin Donations Sidebar Toggle */}
            {user?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setIsDonationsSidebarOpen(!isDonationsSidebarOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <GiftIcon className="w-4 h-4 text-slate-400" />
                  <span>Donations</span>
                  {stats?.pending > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {stats.pending}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${getRoleGradient()} rounded-lg flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-white">{user.name}</span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-700 backdrop-blur-xl rounded-lg shadow-xl border border-slate-600 py-1"
                    >
                      <div className="px-4 py-2 border-b border-slate-600">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                      >
                        <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                      >
                        <HeartIcon className="w-4 h-4 mr-2" />
                        My Favorites
                      </Link>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${getRoleGradient()} rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Admin Donations Sidebar Dropdown */}
      <AnimatePresence>
        {isDonationsSidebarOpen && user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-4 top-16 mt-2 w-80 bg-slate-700 backdrop-blur-xl rounded-lg shadow-xl border border-slate-600 z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <GiftIcon className="w-5 h-5 mr-2 text-pink-400" />
                  Donations Summary
                </h3>
                <button
                  onClick={() => setIsDonationsSidebarOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Total Donated */}
                <div className="bg-pink-500/20 p-3 rounded-lg border-l-4 border-pink-400 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-pink-300">Total Donated</p>
                    <p className="text-xl font-bold text-white">
                      {statsLoading ? (
                        <div className="w-12 h-5 bg-pink-400/30 rounded animate-pulse"></div>
                      ) : (
                        stats?.total || 0
                      )}
                    </p>
                  </div>
                  <ChartBarIcon className="w-5 h-5 text-pink-400 flex-shrink-0" />
                </div>

                {/* Pending Review */}
                <div className="bg-amber-500/20 p-3 rounded-lg border-l-4 border-amber-400 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-300">Pending Review</p>
                    <p className="text-xl font-bold text-white">
                      {statsLoading ? (
                        <div className="w-12 h-5 bg-amber-400/30 rounded animate-pulse"></div>
                      ) : (
                        stats?.pending || 0
                      )}
                    </p>
                  </div>
                  <ClockIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                </div>
                
                {/* Accepted YTD */}
                <div className="bg-emerald-500/20 p-3 rounded-lg border-l-4 border-emerald-400 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-emerald-300">Accepted YTD</p>
                    <p className="text-xl font-bold text-white">
                      {statsLoading ? (
                        <div className="w-12 h-5 bg-emerald-400/30 rounded animate-pulse"></div>
                      ) : (
                        stats?.accepted || 0
                      )}
                    </p>
                  </div>
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                </div>
              </div>
              
              <Link
                to="/dashboard/admin/donations"
                onClick={() => setIsDonationsSidebarOpen(false)}
                className="mt-4 w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg 
                           bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all text-white shadow-lg"
              >
                Manage All Donations <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-800 border-t border-slate-700"
          >
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? `text-white bg-gradient-to-r ${getRoleGradient()}/20 border border-slate-600/50`
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {!user && (
                <div className="pt-2 border-t border-slate-700 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-sm font-medium text-white bg-gradient-to-r ${getRoleGradient()} hover:shadow-lg rounded-lg text-center transition-all duration-200`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu and dropdowns */}
      {(isMobileMenuOpen || isUserMenuOpen || isDonationsSidebarOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25"
          onClick={closeAllDropdowns}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeAllDropdowns();
            }
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
