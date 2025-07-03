// File: src/components/admin/TransferOwnership.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFirestore } from '../../hooks/useFirestore';
import  LoadingSpinner  from '../common/LoadingSpinner';
import  ShimmerLoader  from '../common/ShimmerLoader';
import  ProgressBar  from '../common/ProgressBar';

const TransferOwnership = () => {
  const [flats, setFlats] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState('');
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferReason, setTransferReason] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { 
    getFlats, 
    getOwners, 
    transferFlatOwnership, 
    createOwnershipHistory 
  } = useFirestore();

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  setLoading(true);
  try {
    const [flatsData, ownersData] = await Promise.all([
      getFlats(),
      getOwners()
    ]);
    console.log("Flats fetched:", flatsData);      // ✅ Check this
    console.log("Owners fetched:", ownersData);    // ✅ And this
    setFlats(flatsData);
    setOwners(ownersData);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};


  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedFlat || !selectedNewOwner) return;

    setLoading(true);
    setTransferProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setTransferProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const selectedFlatData = flats.find(flat => flat.id === selectedFlat);
      const newOwnerData = owners.find(owner => owner.id === selectedNewOwner);

      // Create ownership history record
      await createOwnershipHistory({
        flatId: selectedFlat,
        previousOwnerId: selectedFlatData.ownerId,
        newOwnerId: selectedNewOwner,
        transferDate: transferDate,
        reason: transferReason,
        transferredBy: 'admin', // Get from auth context
        timestamp: new Date()
      });

      // Transfer ownership
      await transferFlatOwnership(selectedFlat, selectedNewOwner);

      clearInterval(progressInterval);
      setTransferProgress(100);

      // Reset form
      setSelectedFlat('');
      setSelectedNewOwner('');
      setTransferReason('');
      setTransferDate(new Date().toISOString().split('T')[0]);

      // Refresh data
      await fetchData();

      alert('Ownership transferred successfully!');
    } catch (error) {
      console.error('Error transferring ownership:', error);
      alert('Error transferring ownership. Please try again.');
    } finally {
      setLoading(false);
      setTransferProgress(0);
    }
  };

  const selectedFlatData = flats.find(flat => flat.id === selectedFlat);
  const currentOwner = selectedFlatData ? owners.find(owner => owner.id === selectedFlatData.ownerId) : null;

  if (loading && flats.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Transfer Ownership</h2>
        <div className="space-y-4">
          <ShimmerLoader height="h-16" />
          <ShimmerLoader height="h-16" />
          <ShimmerLoader height="h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-purple-900 mb-8">Transfer Ownership</h2>

        {transferProgress > 0 && (
          <div className="mb-6">
            <ProgressBar progress={transferProgress} />
          </div>
        )}

        <form onSubmit={handleTransferOwnership} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select Flat */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-purple-700">
                Select Flat
              </label>
              <select
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Choose a flat</option>
                {flats.map((flat) => (
                  <option key={flat.id} value={flat.id}>
                    Flat {flat.flatNumber} - {flat.building} ({flat.type})
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Select New Owner */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-purple-700">
                Select New Owner
              </label>
              <select
                value={selectedNewOwner}
                onChange={(e) => setSelectedNewOwner(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Choose new owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} - {owner.phone}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Current Owner Info */}
          {currentOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-purple-50 p-4 rounded-lg border border-purple-200"
            >
              <h3 className="font-medium text-purple-900 mb-2">Current Owner</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-purple-700">Name:</span> {currentOwner.name}
                </div>
                <div>
                  <span className="font-medium text-purple-700">Phone:</span> {currentOwner.phone}
                </div>
                <div>
                  <span className="font-medium text-purple-700">Email:</span> {currentOwner.email}
                </div>
              </div>
            </motion.div>
          )}

          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-purple-700">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-purple-700">
                Transfer Reason
              </label>
              <select
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select reason</option>
                <option value="sale">Sale</option>
                <option value="inheritance">Inheritance</option>
                <option value="gift">Gift</option>
                <option value="legal_transfer">Legal Transfer</option>
                <option value="other">Other</option>
              </select>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={loading || !selectedFlat || !selectedNewOwner}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Transfer Ownership'
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransferOwnership;