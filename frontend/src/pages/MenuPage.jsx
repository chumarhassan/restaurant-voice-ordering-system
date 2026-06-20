import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Flame, Leaf } from 'lucide-react';
import { fetchMenu } from '../utils/api';

const MenuPage = () => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchMenu();
        setMenu(data);
        // Expand first few categories by default
        if (data?.categories) {
          setExpandedCategories(new Set(data.categories.slice(0, 3).map(c => c.id)));
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
      }
      setLoading(false);
    };
    
    loadMenu();
  }, []);
  
  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };
  
  // Filter items by search
  const filterItems = (items) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.toppings?.some(t => t.toLowerCase().includes(query))
    );
  };
  
  // Check if category has matching items
  const categoryHasMatches = (category) => {
    if (!searchQuery.trim()) return true;
    return filterItems(category.items).length > 0;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Laster meny...</p>
        </div>
      </div>
    );
  }
  
  if (!menu) {
    return (
      <div className="text-center text-gray-400 p-8">
        <p>Kunne ikke laste menyen</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          🍔 {menu.restaurant?.name || 'JAFS Gressvik'}
        </h1>
        <p className="text-orange-400 font-medium">
          {menu.restaurant?.tagline || 'FABELAKTIG FASTFOOD'}
        </p>
        {menu.restaurant?.address && (
          <p className="text-gray-400 text-sm mt-1">
            📍 {menu.restaurant.address}
          </p>
        )}
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Søk i menyen..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      
      {/* Categories */}
      <div className="space-y-4">
        {menu.categories?.filter(categoryHasMatches).map((category) => (
          <div key={category.id} className="glass rounded-xl overflow-hidden">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {category.id.includes('pizza') ? '🍕' :
                   category.id.includes('kebab') ? '🥙' :
                   category.id.includes('burger') || category.id.includes('hamburger') ? '🍔' :
                   category.id.includes('salat') ? '🥗' :
                   category.id.includes('drikke') ? '🥤' :
                   category.id.includes('barn') ? '👶' : '🍽️'}
                </span>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                  {category.description && (
                    <p className="text-sm text-gray-400">{category.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-sm">{filterItems(category.items).length} varer</span>
                {expandedCategories.has(category.id) ? 
                  <ChevronDown size={20} /> : 
                  <ChevronRight size={20} />
                }
              </div>
            </button>
            
            {/* Category items */}
            {expandedCategories.has(category.id) && (
              <div className="border-t border-white/10">
                {filterItems(category.items).map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">
                            {item.number ? `${item.number}. ` : ''}{item.name}
                          </h3>
                          {item.spicy && (
                            <Flame size={16} className="text-red-400" title="Sterk" />
                          )}
                          {item.vegetarian && (
                            <Leaf size={16} className="text-green-400" title="Vegetar" />
                          )}
                          {item.signature && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                              Signatur
                            </span>
                          )}
                        </div>
                        
                        {item.toppings && item.toppings.length > 0 && (
                          <p className="text-sm text-gray-400 mt-1">
                            {item.toppings.join(', ')}
                          </p>
                        )}
                        
                        {item.includes && item.includes.length > 0 && (
                          <p className="text-sm text-green-400/70 mt-1">
                            Inkl: {item.includes.join(', ')}
                          </p>
                        )}
                        
                        {item.size && !item.pricesMedium && (
                          <p className="text-sm text-gray-500 mt-1">{item.size}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        {item.pricesMedium && item.pricesLarge ? (
                          <div className="text-sm">
                            <p className="text-white">
                              M: <span className="text-orange-400 font-semibold">{item.pricesMedium}kr</span>
                            </p>
                            <p className="text-white">
                              S: <span className="text-orange-400 font-semibold">{item.pricesLarge}kr</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-orange-400 font-semibold text-lg">
                            {item.price}kr
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Global options */}
      {menu.globalOptions && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">ℹ️ Informasjon</h3>
          {menu.globalOptions.glutenFree && (
            <p className="text-sm text-gray-400">
              {menu.globalOptions.glutenFree.note}
            </p>
          )}
        </div>
      )}
      
      {/* Restaurant hours */}
      {menu.restaurant?.hours && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">🕐 Åpningstider</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(menu.restaurant.hours).map(([day, hours]) => (
              <div key={day} className="flex justify-between">
                <span className="text-gray-400 capitalize">{day}</span>
                <span className={hours === 'Stengt' ? 'text-red-400' : 'text-white'}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
