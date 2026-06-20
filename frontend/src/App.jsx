import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Phone, Settings, Menu } from 'lucide-react';
import ChatPage from './pages/ChatPage';
import CallPage from './pages/CallPage';
import AdminPage from './pages/AdminPage';
import MenuPage from './pages/MenuPage';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Chat', icon: MessageSquare },
    { path: '/call', label: 'Call', icon: Phone },
    { path: '/menu', label: 'Menu', icon: Menu },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50 md:top-0 md:bottom-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - hidden on mobile */}
          <Link to="/" className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">J</span>
            </div>
            <span className="text-xl font-bold text-white">JAFS Gressvik</span>
          </Link>
          
          {/* Nav items */}
          <div className="flex items-center justify-around w-full md:w-auto md:gap-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === path
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs md:text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App component
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-20 md:pb-0 md:pt-20">
        <Navigation />
        
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/call" element={<CallPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
