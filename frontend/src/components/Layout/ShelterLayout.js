import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  HomeIcon,
  HeartIcon,
  PlusIcon,
  UserGroupIcon,
  GiftIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ShelterLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/shelter',
      icon: HomeIcon,
      current: location.pathname === '/dashboard/shelter'
    },
    {
      name: 'My Pets',
      href: '/dashboard/shelter/pets',
      icon: HeartIcon,
      current: location.pathname === '/dashboard/shelter/pets'
    },
    {
      name: 'Add Pet',
      href: '/dashboard/shelter/add-pet',
      icon: PlusIcon,
      current: location.pathname === '/dashboard/shelter/add-pet'
    },
    {
      name: 'Adoptions',
      href: '/dashboard/shelter/adoptions',
      icon: UserGroupIcon,
      current: location.pathname === '/dashboard/shelter/adoptions'
    },
    {
      name: 'Donations',
      href: '/dashboard/shelter/donations',
      icon: GiftIcon,
      current: location.pathname === '/dashboard/shelter/donations'
    },
    {
      name: 'Profile',
      href: '/dashboard/shelter/profile',
      icon: UserIcon,
      current: location.pathname === '/dashboard/shelter/profile'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <HeartIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">{user?.name}</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center py-2 text-xs ${
                  item.current
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShelterLayout;
