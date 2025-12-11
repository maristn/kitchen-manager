import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ChefHat, ShoppingCart, History, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/ingredients', icon: Package, label: 'Ingredientes' },
    { path: '/recipes', icon: ChefHat, label: 'Receitas' },
    { path: '/shopping-list', icon: ShoppingCart, label: 'Lista de Compras' },
    { path: '/history', icon: History, label: 'Histórico' },
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-soft">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-soft-md transition-all duration-200 group-hover:scale-105">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Kitchen Manager
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1.5">
            {links.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-white text-primary-600 font-semibold shadow-soft'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm transition-all duration-200 active:scale-95"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {links.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-soft'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
