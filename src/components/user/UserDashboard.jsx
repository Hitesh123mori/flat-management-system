import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaCar, FaUsers, FaSearch } from 'react-icons/fa';
import { MdMale, MdFemale } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';
import { getAllFlats, getAllVehicles, getAllOwners } from '../../services/firestore'; // ✅ Add getAllOwners
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ShimmerLoader from '../../components/common/ShimmerLoader';

const UserDashboard = () => {
  const [flats, setFlats] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('vehicle'); 
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
  try {
    setLoading(true);
    const [flatsData, vehiclesData, ownersData] = await Promise.all([
      getAllFlats(),
      getAllVehicles(),
      getAllOwners()
    ]);

    // Join each flat with its owner and family details
    const enrichedFlats = flatsData.map(flat => {
    const owner = ownersData.find(o => o.flatId === flat.id);

    if (!owner) {
      console.warn(`No active owner found for flat ID: ${flat.id}`);
    }

     const family = owner?.familyDetails || {};


    return {
      ...flat,
      ownerName: owner?.name || 'N/A',
      ownerPhone: owner?.phone || 'N/A',
      ownerEmail: owner?.email || 'N/A',
      maleMembers: family.males || 0,
      femaleMembers: family.females || 0,
      children: family.children || 0,
      totalMembers: family.totalMembers || 0,
      ownerId: owner?.id || null
    };
  });


    setFlats(enrichedFlats);
    setVehicles(vehiclesData);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      if (searchType === 'vehicle') {
        const results = vehicles.filter(vehicle => 
          vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Add flat and owner details to results
        const enrichedResults = results.map(vehicle => {
          const flat = flats.find(f => f.ownerId === vehicle.ownerId);
          return {
            ...vehicle,
            flatDetails: flat || null
          };
        });
        
        setSearchResults(enrichedResults);
      } else {
        const results = flats.filter(flat => 
          flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ShimmerLoader key={index} height="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Flat Management System
          </h1>
          <p className="text-gray-600">View flat details and search vehicles</p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaSearch className="mr-3 text-purple-600" />
            Search
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Search by ${searchType === 'vehicle' ? 'vehicle number' : 'flat number'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
              >
                <option value="vehicle">Vehicle</option>
                <option value="flat">Flat</option>
              </select>
              
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {searching ? <LoadingSpinner size="sm" /> : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-purple-50 rounded-lg p-4 border border-purple-200"
                  >
                    {searchType === 'vehicle' ? (
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-2">
                          Vehicle: {result.vehicleNumber}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Company: {result.company}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Model: {result.model}
                        </p>
                        {result.flatDetails && (
                          <div className="mt-2 pt-2 border-t border-purple-200">
                            <p className="text-sm text-purple-700">
                              Flat: {result.flatDetails.flatNumber}
                            </p>
                            <p className="text-sm text-purple-700">
                              Owner: {result.flatDetails.ownerName}
                            </p>
                  
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-2">
                          Flat: {result.flatNumber}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Owner: {result.ownerName}
                        </p>
                
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

    

    
      </motion.div>
    </div>
  );
};

export default UserDashboard;