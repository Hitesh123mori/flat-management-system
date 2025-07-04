// File: src/components/admin/TransferOwnership.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import {
  getAllFlats,
  getAllOwners,
  updateOwner,
  updateFlat
} from '../../services/firestore';
import LoadingSpinner from '../common/LoadingSpinner';
import ShimmerLoader from '../common/ShimmerLoader';
import ProgressBar from '../common/ProgressBar';

const TransferOwnership = () => {
  const [flats, setFlats] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState('');
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferReason, setTransferReason] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flatsData, ownersData] = await Promise.all([
        getAllFlats(),
        getAllOwners()
      ]);
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
      const oldOwnerId = selectedFlatData.ownerId;

      // 1. Mark old owner as inactive
      if (oldOwnerId) {
        await updateOwner(oldOwnerId, {
          isActive: false,
          moveOutDate: new Date()
        });
      }

      // 2. Mark new owner as active
      await updateOwner(selectedNewOwner, {
        isActive: true,
        moveInDate: new Date()
      });

      // 3. Update flat with new owner
      await updateFlat(selectedFlat, {
        ownerId: selectedNewOwner,
        previousOwnerId: oldOwnerId
      });

      clearInterval(progressInterval);
      setTransferProgress(100);

      // Reset form
      setSelectedFlat('');
      setSelectedNewOwner('');
      setTransferReason('');
      setTransferDate(new Date().toISOString().split('T')[0]);

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
  const currentOwner = selectedFlatData
    ? owners.find(owner => owner.id === selectedFlatData.ownerId)
    : null;

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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-700">Select Flat</label>
              <Select
                options={flats.map(flat => ({
                  value: flat.id,
                  label: `Flat ${flat.flatNumber} - Floor ${flat.floor} (${flat.type})`
                }))}
                value={selectedFlat ? {
                  value: selectedFlat,
                  label: `Flat ${selectedFlatData?.flatNumber} - ${selectedFlatData?.building} (${selectedFlatData?.type})`
                } : null}
                onChange={option => setSelectedFlat(option.value)}
                placeholder="Choose a flat..."
                isSearchable
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-700">Select New Owner</label>
              <Select
                options={owners.map(owner => ({
                  value: owner.id,
                  label: `${owner.name} - ${owner.phone}`
                }))}
                value={selectedNewOwner ? {
                  value: selectedNewOwner,
                  label: `${owners.find(o => o.id === selectedNewOwner)?.name} - ${owners.find(o => o.id === selectedNewOwner)?.phone}`
                } : null}
                onChange={option => setSelectedNewOwner(option.value)}
                placeholder="Choose new owner..."
                isSearchable
              />
            </div>
          </div>

          {currentOwner && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-900 mb-2">Current Owner</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="font-medium text-purple-700">Name:</span> {currentOwner.name}</div>
                <div><span className="font-medium text-purple-700">Phone:</span> {currentOwner.phone}</div>
                <div><span className="font-medium text-purple-700">Email:</span> {currentOwner.email}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-700">Transfer Date</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-700">Transfer Reason</label>
              <select
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select reason</option>
                <option value="sale">Sale</option>
                <option value="inheritance">Inheritance</option>
                <option value="gift">Gift</option>
                <option value="legal_transfer">Legal Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedFlat || !selectedNewOwner}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
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
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TransferOwnership;
