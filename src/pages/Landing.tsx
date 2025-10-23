// ============================================
// FILE: src/pages/Landing.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Wallet, TrendingUp, PieChart, Shield, Moon, Sun, 
  ArrowRight, IndianRupee, Target, Bell, Calculator 
} from 'lucide-react';

export default function Landing() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Arthsathi
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">आपका वित्तीय साथी</div>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Features
                </a>
                <a href="#security" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Security
                </a>
                <button 
                  onClick={toggleDarkMode} 
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
              <div className="px-4 py-4 space-y-3 bg-white dark:bg-gray-900">
                <a 
                  href="#features" 
                  className="block text-gray-600 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#security" 
                  className="block text-gray-600 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Security
                </a>
                <button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }} 
                  className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }} 
                  className="block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text */}
              <div>
                <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                  🇮🇳 Made for India
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Your Complete
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Financial Companion
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Track investments, manage expenses, plan budgets, and secure your financial future - all in one beautiful, encrypted platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate('/register')} 
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Right Column - Demo Card */}
              <div className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                      <div className="text-sm opacity-90 mb-1">Total Balance</div>
                      <div className="text-2xl font-bold">₹12,45,680</div>
                      <div className="text-xs opacity-75 mt-1">+12.5% this month</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                      <div className="text-sm opacity-90 mb-1">Investments</div>
                      <div className="text-2xl font-bold">₹8,23,450</div>
                      <div className="text-xs opacity-75 mt-1">+18.3% returns</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Mutual Funds</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">5 SIPs Active</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">₹4,56,230</div>
                        <div className="text-sm text-green-600 dark:text-green-400">+15.2%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">PPF Account</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Matures in 2032</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">₹2,45,890</div>
                        <div className="text-sm text-green-600 dark:text-green-400">+7.1%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Comprehensive financial management for Indian investors
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: IndianRupee, 
                  title: 'Indian Financial Instruments', 
                  desc: 'Track PPF, EPF, NPS, SIPs, FDs, Stocks, Mutual Funds, Chit Funds & more' 
                },
                { 
                  icon: Shield, 
                  title: 'Bank-Grade Security', 
                  desc: 'End-to-end encryption, zero-knowledge architecture, your data stays private' 
                },
                { 
                  icon: PieChart, 
                  title: 'Smart Analytics', 
                  desc: 'Visual insights, spending patterns, investment returns, and budget tracking' 
                },
                { 
                  icon: Target, 
                  title: 'Goal Planning', 
                  desc: 'Set financial goals, track progress, and get personalized recommendations' 
                },
                { 
                  icon: Bell, 
                  title: 'Smart Reminders', 
                  desc: 'Never miss EMI, insurance premium, or bill payment deadlines' 
                },
                { 
                  icon: Calculator, 
                  title: 'Financial Calculators', 
                  desc: 'SIP, EMI, retirement, and tax calculators built-in' 
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div id="security" className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Your Security is Our Priority
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Bank-grade encryption protects every piece of your financial data
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      AES-256 Encryption
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Military-grade encryption protects all your sensitive financial data
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Zero-Knowledge Architecture
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We can't see your data - only you have the encryption keys
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Local-First Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your data is encrypted on your device before syncing to cloud
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Start Securing Your Finances Today
                </h3>
                <p className="mb-6">
                  Join thousands of Indians who trust Arthsathi with their financial data
                </p>
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Arthsathi
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">आपका वित्तीय साथी</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 Arthsathi. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
