import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { getPetMainImage } from '../../utils/imageUtils';
import {
  PlusIcon,
  DocumentIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Animation variants for consistent futuristic effects
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

const ShelterDashboard = () => {
  const { user } = useAuthStore();

  // Fetch shelter's pets
  const { data: petsData, isLoading: petsLoading } = useQuery(
    ['shelter-pets', user?.id],
    async () => {
      const response = await axios.get(`/pets/user/${user.id}`);
      return response.data;
    }
  );

  // Fetch donations to this shelter
  const { data: donationsData, isLoading: donationsLoading } = useQuery(
    ['shelter-donations', user?.id],
    async () => {
      const response = await axios.get('/donations');
      return response.data;
    }
  );

  // Fetch adoption requests for shelter's pets
  const { data: adoptionsData, isLoading: adoptionsLoading } = useQuery(
    ['shelter-adoptions', user?.id],
    async () => {
      const response = await axios.get('/adoptions');
      return response.data;
    }
  );

  const stats = [
    {
      title: 'Total Pets',
      value: petsData?.pets?.length || 0,
      subtitle: `${petsData?.pets?.filter(pet => pet.adoption_status === 'available').length || 0} available`,
      icon: HeartIcon,
      color: 'from-emerald-500 via-teal-500 to-green-600',
      glow: 'shadow-emerald-500/25'
    },
    {
      title: 'Pending Adoptions',
      value: adoptionsData?.adoptions?.filter(adoption => adoption.status === 'pending').length || 0,
      subtitle: `${adoptionsData?.adoptions?.filter(adoption => adoption.status === 'approved').length || 0} approved`,
      icon: ClockIcon,
      color: 'from-amber-500 via-orange-500 to-red-500',
      glow: 'shadow-amber-500/25'
    },
    {
      title: 'Donations Received',
      value: donationsData?.donations?.filter(donation => donation.shelter_id === user?.id).length || 0,
      subtitle: `${donationsData?.donations?.filter(donation => donation.status === 'pending').length || 0} pending`,
      icon: GiftIcon,
      color: 'from-purple-500 via-pink-500 to-rose-600',
      glow: 'shadow-purple-500/25'
    },
    {
      title: 'Success Rate',
      value: '94%',
      subtitle: 'Adoption success rate',
      icon: ChartBarIcon,
      color: 'from-cyan-500 via-blue-500 to-indigo-600',
      glow: 'shadow-cyan-500/25'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Pet',
      subtitle: 'Register a new pet for adoption',
      icon: PlusIcon,
      to: '/dashboard/shelter/add-pet',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Manage Pets',
      subtitle: 'View and edit your pet listings',
      icon: HeartIcon,
      to: '/dashboard/shelter/pets',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-500/20'
    },
    {
      title: 'Review Adoptions',
      subtitle: 'Process adoption applications',
      icon: DocumentIcon,
      to: '/dashboard/shelter/adoptions',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Manage Donations',
      subtitle: 'Handle donation requests',
      icon: GiftIcon,
      to: '/dashboard/shelter/donations',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'from-purple-500/10 to-violet-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 lg:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full mb-6 backdrop-blur-sm border border-emerald-500/20">
            <HeartIcon className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Shelter Command Center
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Welcome back, {user?.name}! Manage your pets, track adoptions, and help animals find their forever homes
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-400 font-medium">Shelter Active</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
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
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className={`relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 ${stat.glow} shadow-2xl hover:shadow-3xl transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {petsLoading || adoptionsLoading || donationsLoading ? (
                          <div className="w-16 h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse"></div>
                        ) : (
                          <span className={`bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
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

        {/* Recent Pets Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Your Pets</h3>
                  <p className="text-gray-400">Manage your pet listings</p>
                </div>
              </div>
              <Link
                to="/dashboard/shelter/pets"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-medium hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>View All Pets</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {petsLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading your pets...</p>
              </div>
            ) : petsData?.pets?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {petsData.pets.slice(0, 6).map((pet) => (
                  <div key={pet.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-700/50 transition-all duration-300 group">
                    <div className="relative mb-4">
                      <img
                        src={getPetMainImage(pet.images)}
                        alt={pet.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                        pet.adoption_status === 'available' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : pet.adoption_status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {pet.adoption_status}
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{pet.name}</h4>
                    <p className="text-gray-400 text-sm mb-4">{pet.breed} • {pet.age} years old</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-medium">{pet.gender}</span>
                      <div className="flex space-x-2">
                        <button className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-700/50">
                <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-white mb-2">No pets yet</p>
                <p className="text-gray-400 mb-6">Start by adding your first pet for adoption</p>
                <Link
                  to="/dashboard/shelter/add-pet"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-medium hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Pet</span>
                </Link>
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
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
                      className={`block p-6 bg-gradient-to-r ${action.bgColor} border ${action.borderColor} rounded-2xl hover:bg-opacity-80 transition-all duration-300 transform hover:shadow-2xl`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-emerald-300 transition-colors">
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

export default ShelterDashboard;
