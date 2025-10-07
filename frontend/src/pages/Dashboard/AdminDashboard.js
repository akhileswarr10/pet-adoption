import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useRealTimeNotifications from '../../hooks/useRealTimeNotifications';
import { getPetMainImage } from '../../utils/imageUtils';
import {
  HeartIcon,
  GiftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  BeakerIcon,
  ShieldCheckIcon,
  SunIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

// Animation variants for futuristic effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  }
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  
  // Debug user info (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('👤 Current user:', {
      name: user?.name,
      role: user?.role,
      isAuthenticated: !!user
    });
  }
  
  // Enable real-time notifications for new requests
  useRealTimeNotifications();

  // Fetch statistics with real-time updates
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(
    'admin-stats',
    async () => {
      console.log('🔄 Fetching admin stats...');
      try {
        const [usersRes, petsRes, adoptionsRes, donationsRes] = await Promise.all([
          axios.get('/users/stats/overview'),
          axios.get('/pets/stats/overview'),
          axios.get('/adoptions/stats/overview'),
          axios.get('/donations/stats/overview')
        ]);
        
        const result = {
          users: usersRes.data,
          pets: petsRes.data,
          adoptions: adoptionsRes.data,
          donations: donationsRes.data
        };
        
        console.log('📊 Admin stats received:', result);
        return result;
      } catch (error) {
        console.error('❌ Admin stats error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    },
    {
      enabled: !!user && user.role === 'admin',
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      staleTime: 0
    }
  );

  // Fetch pending requests for real-time notifications
  const { data: pendingRequests, isLoading: pendingRequestsLoading } = useQuery(
    'admin-pending-requests',
    async () => {
      const [adoptionsRes, donationsRes] = await Promise.all([
        axios.get('/adoptions?status=pending&limit=5'),
        axios.get('/donations?status=pending&limit=5')
      ]);
      
      return {
        adoptions: adoptionsRes.data.adoptions || [],
        donations: donationsRes.data.donations || []
      };
    },
    {
      enabled: !!user && user.role === 'admin',
      refetchInterval: 3000,
      refetchIntervalInBackground: true
    }
  );

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.totalUsers || 0,
      subtitle: `${stats?.users?.activeUsers || 0} active`,
      icon: UserGroupIcon,
      color: 'from-cyan-500 via-blue-500 to-indigo-600',
      glow: 'shadow-cyan-500/25',
      ring: 'ring-cyan-400/30'
    },
    {
      title: 'Total Pets',
      value: stats?.pets?.total || 0,
      subtitle: `${stats?.pets?.available || 0} available`,
      icon: HeartIcon,
      color: 'from-emerald-500 via-teal-500 to-green-600',
      glow: 'shadow-emerald-500/25',
      ring: 'ring-emerald-400/30'
    },
    {
      title: 'Pending Adoptions',
      value: stats?.adoptions?.pending || 0,
      subtitle: `${stats?.adoptions?.completed || 0} completed`,
      icon: ClockIcon,
      color: 'from-amber-500 via-orange-500 to-red-500',
      glow: 'shadow-amber-500/25',
      ring: 'ring-amber-400/30'
    },
    {
      title: 'Total Donations',
      value: stats?.donations?.total || 0,
      subtitle: `${stats?.donations?.pending || 0} pending review`,
      icon: GiftIcon,
      color: 'from-purple-500 via-pink-500 to-rose-600',
      glow: 'shadow-purple-500/25',
      ring: 'ring-purple-400/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 lg:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full mb-6 backdrop-blur-sm border border-cyan-500/20">
            <SparklesIcon className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Admin Control Center
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Monitor real-time platform metrics, manage pending requests, and oversee the entire pet adoption ecosystem
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">System Online</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className={`relative group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className={`relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 ${stat.glow} shadow-2xl hover:shadow-3xl transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {statsLoading ? (
                          <div className="w-16 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse"></div>
                        ) : statsError ? (
                          <span className="text-red-400 text-sm">Error</span>
                        ) : (
                          <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value.toLocaleString()}
                          </span>
                        )}
                      </p>
                      {stat.subtitle && (
                        <p className="text-sm text-gray-400">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-60`}></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Real-time Pending Requests */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Critical Pending Actions</h3>
                  <p className="text-gray-400">Real-time monitoring dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Live Feed Active</span>
              </div>
            </div>

            {pendingRequestsLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Synchronizing data streams...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Adoptions */}
                {pendingRequests?.adoptions?.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center">
                      <HeartIcon className="w-5 h-5 mr-2" />
                      Adoption Requests ({pendingRequests.adoptions.length})
                    </h4>
                    <div className="space-y-3">
                      {pendingRequests.adoptions.slice(0, 5).map((adoption) => (
                        <div key={adoption.id} className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getPetMainImage(adoption.pet?.images)}
                              alt={adoption.pet?.name}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-yellow-500/50 group-hover:border-yellow-400 transition-colors"
                            />
                            <div>
                              <p className="font-medium text-white">
                                {adoption.pet?.name} Adoption
                              </p>
                              <p className="text-sm text-gray-400">
                                Applied by {adoption.adopter?.name}
                              </p>
                            </div>
                          </div>
                          <Link
                            to="/dashboard/admin/adoptions"
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                          >
                            <span>Review</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                    {pendingRequests.adoptions.length > 5 && (
                      <Link
                        to="/dashboard/admin/adoptions"
                        className="block text-center text-yellow-400 hover:text-yellow-300 py-3 mt-4 font-medium transition-colors"
                      >
                        View {pendingRequests.adoptions.length - 5} more adoption requests
                      </Link>
                    )}
                  </div>
                )}

                {/* Pending Donations */}
                {pendingRequests?.donations?.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
                      <GiftIcon className="w-5 h-5 mr-2" />
                      Pet Donation Submissions ({pendingRequests.donations.length})
                    </h4>
                    <div className="space-y-3">
                      {pendingRequests.donations.slice(0, 5).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getPetMainImage(donation.pet?.images)}
                              alt={donation.pet?.name}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors"
                            />
                            <div>
                              <p className="font-medium text-white">
                                {donation.pet?.name} Donation
                              </p>
                              <p className="text-sm text-gray-400">
                                Submitted by {donation.donor_name}
                              </p>
                            </div>
                          </div>
                          <Link
                            to="/dashboard/admin/donations"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-400 hover:to-purple-400 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                          >
                            <span>Review</span>
                            <ArrowRightIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                    {pendingRequests.donations.length > 5 && (
                      <Link
                        to="/dashboard/admin/donations"
                        className="block text-center text-blue-400 hover:text-blue-300 py-3 mt-4 font-medium transition-colors"
                      >
                        View {pendingRequests.donations.length - 5} more donation requests
                      </Link>
                    )}
                  </div>
                )}

                {/* No Pending Requests */}
                {(!pendingRequests?.adoptions?.length && !pendingRequests?.donations?.length) && (
                  <div className="text-center py-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl">
                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-xl font-medium text-white mb-2">System Status: Optimal</p>
                    <p className="text-gray-400">All immediate actions have been processed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Core Navigation Modules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  to: "/dashboard/admin/users", 
                  icon: UserGroupIcon, 
                  title: "Manage Users", 
                  subtitle: "View and manage user accounts and roles.",
                  color: "from-cyan-500 to-blue-500",
                  hoverColor: "hover:from-cyan-400 hover:to-blue-400"
                },
                { 
                  to: "/dashboard/admin/adoptions", 
                  icon: HeartIcon, 
                  title: "Review Adoptions", 
                  subtitle: "Process pending adoption applications.",
                  color: "from-pink-500 to-rose-500",
                  hoverColor: "hover:from-pink-400 hover:to-rose-400"
                },
                { 
                  to: "/dashboard/admin/donations", 
                  icon: GiftIcon, 
                  title: "Review Donations", 
                  subtitle: "Verify pet donation and shelter submissions.",
                  color: "from-purple-500 to-indigo-500",
                  hoverColor: "hover:from-purple-400 hover:to-indigo-400"
                }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div 
                    key={index} 
                    whileHover={{ 
                      scale: 1.05, 
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group"
                  >
                    <Link 
                      to={action.to} 
                      className={`block p-6 bg-gray-800/50 border border-gray-700/50 rounded-2xl hover:bg-gray-700/50 transition-all duration-300 transform hover:shadow-2xl`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {action.subtitle}
                      </p>
                      <div className={`h-1 bg-gradient-to-r ${action.color} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Pet Care Tips Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative mt-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full mb-4 backdrop-blur-sm border border-emerald-500/20">
                <HeartIcon className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Essential Pet Care Tips
                </span>
              </h3>
              <p className="text-gray-400">Quick reference guide for optimal pet wellness</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BeakerIcon,
                  title: "Nutrition & Diet",
                  tips: [
                    "Provide fresh water daily",
                    "Age-appropriate food portions",
                    "Avoid toxic foods (chocolate, grapes)",
                    "Regular feeding schedule"
                  ],
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "from-blue-500/10 to-cyan-500/10",
                  borderColor: "border-blue-500/20"
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Health & Wellness",
                  tips: [
                    "Annual veterinary checkups",
                    "Keep vaccinations current",
                    "Regular dental care",
                    "Monitor for health changes"
                  ],
                  color: "from-emerald-500 to-green-500",
                  bgColor: "from-emerald-500/10 to-green-500/10",
                  borderColor: "border-emerald-500/20"
                },
                {
                  icon: SunIcon,
                  title: "Exercise & Activity",
                  tips: [
                    "Daily walks and playtime",
                    "Mental stimulation activities",
                    "Safe outdoor exploration",
                    "Age-appropriate exercise"
                  ],
                  color: "from-yellow-500 to-orange-500",
                  bgColor: "from-yellow-500/10 to-orange-500/10",
                  borderColor: "border-yellow-500/20"
                },
                {
                  icon: AcademicCapIcon,
                  title: "Training & Behavior",
                  tips: [
                    "Positive reinforcement methods",
                    "Consistent training routine",
                    "Socialization opportunities",
                    "Patience and understanding"
                  ],
                  color: "from-purple-500 to-pink-500",
                  bgColor: "from-purple-500/10 to-pink-500/10",
                  borderColor: "border-purple-500/20"
                }
              ].map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className={`bg-gradient-to-br ${category.bgColor} border ${category.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group`}
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-white text-sm">{category.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {category.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start text-xs text-gray-300">
                          <div className={`w-1.5 h-1.5 bg-gradient-to-r ${category.color} rounded-full mt-1.5 mr-2 flex-shrink-0`}></div>
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={`h-0.5 bg-gradient-to-r ${category.color} rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Links Footer */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400 font-medium">Pet Care Resources Active</span>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>Emergency Vet Contacts</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </a>
                  <a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>Pet Care Guidelines</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </a>
                  <a 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>Training Resources</span>
                    <ArrowRightIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
