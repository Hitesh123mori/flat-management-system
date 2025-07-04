import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import {
  Building,
  Users,
  Car,
  TrendingUp,
  Home,
  UserCheck,
  Wrench,
  CircleDot
} from 'lucide-react';
import ShimmerLoader from '../common/ShimmerLoader';

const Dashboard = () => {
  const { getCollection } = useFirestore();
  const [stats, setStats] = useState({
    totalFlats: 0,
    occupiedFlats: 0,
    maintenanceFlats: 0,
    availableFlats: 0,
    totalOwners: 0,
    totalVehicles: 0,
    maleCount: 0,
    femaleCount: 0,
    childrenCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [flats, owners, vehicles] = await Promise.all([
        getCollection('flats'),
        getCollection('owners'),
        getCollection('vehicles')
      ]);

      const occupiedFlats = flats.filter(f => f.status === 'Occupied').length;
      const maintenanceFlats = flats.filter(f => f.status === 'Maintenance').length;
      const availableFlats = flats.filter(f => f.status === 'Available').length;

      const totalMale = owners.reduce((sum, owner) => sum + (owner.familyDetails?.males || 0), 0);
      const totalFemale = owners.reduce((sum, owner) => sum + (owner.familyDetails?.females || 0), 0);
      const totalChildren = owners.reduce((sum, owner) => sum + (owner.familyDetails?.children || 0), 0);

      setStats({
        totalFlats: flats.length,
        occupiedFlats,
        maintenanceFlats,
        availableFlats,
        totalOwners: owners.length,
        totalVehicles: vehicles.length,
        maleCount: totalMale,
        femaleCount: totalFemale,
        childrenCount: totalChildren
      });


    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {loading ? <ShimmerLoader width="60px" height="36px" /> : value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <ShimmerLoader width="100%" height="120px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening in your property.</p>
        </div>

        {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Flats" value={stats.totalFlats} icon={Building} color="text-purple-600" bgColor="bg-white" />
          <StatCard title="Occupied Flats" value={stats.occupiedFlats} icon={Home} color="text-green-600" bgColor="bg-white" />
          <StatCard title="Maintenance Flats" value={stats.maintenanceFlats} icon={Wrench} color="text-yellow-600" bgColor="bg-white" />
          <StatCard title="Available Flats" value={stats.availableFlats} icon={CircleDot} color="text-cyan-600" bgColor="bg-white" />
          <StatCard title="Total Owners" value={stats.totalOwners} icon={Users} color="text-blue-600" bgColor="bg-white" />
          <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={Car} color="text-orange-600" bgColor="bg-white" />
        </div>

        {/* Demographics and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Male Residents</span>
                <span className="font-semibold text-blue-600">{stats.maleCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Female Residents</span>
                <span className="font-semibold text-pink-600">{stats.femaleCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Children</span>
                <span className="font-semibold text-green-600">{stats.childrenCount}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-gray-900 font-medium">Total Residents</span>
                <span className="font-bold text-purple-600">
                  {stats.maleCount + stats.femaleCount + stats.childrenCount}
                </span>
              </div>
            </div>
          </div>
        </div>
            
            
          </div>
        </div>
  );
};

export default Dashboard;
