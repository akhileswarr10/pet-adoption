import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  GiftIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  HomeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import TestLogin from '../components/TestLogin';
import DirectLoginTest from '../components/DirectLoginTest';

const HomePage = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Find Your Perfect Match',
      description: 'Browse through hundreds of loving pets waiting for their forever homes.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Trusted Shelters',
      description: 'Connect with verified shelters and rescue organizations in your area.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: HomeIcon,
      title: 'Safe Adoptions',
      description: 'Our secure adoption process ensures the best match for both pets and families.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Profiles',
      description: 'All pets come with complete health records and vaccination certificates.',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  const stats = [
    { number: '2,500+', label: 'Pets Adopted' },
    { number: '150+', label: 'Partner Shelters' },
    { number: '98%', label: 'Success Rate' },
    { number: '24/7', label: 'Support' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'Found my perfect companion through PetAdopt. The process was smooth and the support was amazing!',
      rating: 5,
      pet: 'Golden Retriever - Max'
    },
    {
      name: 'Michael Chen',
      text: 'As a shelter owner, this platform has helped us find homes for so many pets. Highly recommended!',
      rating: 5,
      pet: 'Shelter Partner'
    },
    {
      name: 'Emily Davis',
      text: 'The verification process gave me confidence that I was adopting from a reputable source.',
      rating: 5,
      pet: 'Persian Cat - Luna'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Find Your
                <span className="text-gradient block">Perfect Pet</span>
                Companion
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with loving pets looking for their forever homes, or help a pet in need find a new family.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/pets"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Find Your Pet
                </Link>
                <Link
                  to="/donate"
                  className="btn-outline text-lg px-8 py-3"
                >
                  Donate a Pet
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Happy family with adopted pet"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 animate-bounce-gentle"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary-400 to-accent-400 rounded-full opacity-20 animate-float"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PetAdopt?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to making pet adoption a positive experience for everyone involved.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-hover p-6 text-center group"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Happy Families & Pets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read what our community has to say about their adoption experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.pet}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Find Your New Best Friend?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of happy families who have found their perfect pet companion through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pets"
                className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
              >
                Start Browsing Pets
              </Link>
              <Link
                to="/register"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
              >
                Join as Shelter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Debug Section - Remove this after testing */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto space-y-8">
          <TestLogin />
          <DirectLoginTest />
        </div>
      </section>
    </div>
  );
};
export default HomePage;
