import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  Users, 
  Car, 
  Building, 
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // 🔒 Show nothing if not admin
  if (user?.role !== 'admin') return null;

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'flats', label: 'Flat Management', icon: Building },
    { id: 'owners', label: 'Owner Management', icon: Users },
    { id: 'vehicles', label: 'Vehicle Management', icon: Car },
    { id: 'transfer', label: 'Transfer Ownership', icon: UserCheck },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-full border-r border-purple-100`}>
      
      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/admin/${item.id}`)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
            >
              <Icon className="w-5 h-5 text-current" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Role Badge */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">Admin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
