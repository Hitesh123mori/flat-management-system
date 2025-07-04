import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../common/LoadingSpinner';
import ShimmerLoader from '../common/ShimmerLoader';
import { FaPlus, FaEdit, FaTrash, FaHome, FaUsers, FaSearch } from 'react-icons/fa';

const FlatManagement = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [formData, setFormData] = useState({
    flatNumber: '',
    floor: '',
    type: '',
    size: '',
    status: 'Available',
    rent: '',
    deposit: '',
    description: '',
    ownerId: ''
  });

  useEffect(() => {
    fetchFlats();
  }, []);

  const fetchFlats = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'flats'), orderBy('flatNumber'));
      const querySnapshot = await getDocs(q);
      const flatsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFlats(flatsList);
    } catch (error) {
      console.error('Error fetching flats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFlat) {
        await updateDoc(doc(db, 'flats', editingFlat.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'flats'), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      resetForm();
      fetchFlats();
    } catch (error) {
      console.error('Error saving flat:', error);
    }
  };

  const handleEdit = (flat) => {
    setEditingFlat(flat);
    setFormData({
      flatNumber: flat.flatNumber,
      floor: flat.floor,
      type: flat.type,
      size: flat.size,
      status: flat.status,
      rent: flat.rent,
      deposit: flat.deposit,
      description: flat.description,
      ownerId: flat.ownerId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flat?')) {
      try {
        await deleteDoc(doc(db, 'flats', id));
        fetchFlats();
      } catch (error) {
        console.error('Error deleting flat:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      flatNumber: '',
      floor: '',
      type: '',
      size: '',
      status: 'Available',
      rent: '',
      deposit: '',
      description: ''
    });
    setEditingFlat(null);
    setShowModal(false);
  };

  const filteredFlats = flats.filter(flat => {
    const matchesSearch =
      flat.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flat.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || flat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <ShimmerLoader className="h-8 w-48" />
          <ShimmerLoader className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ShimmerLoader key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaHome className="text-purple-600" />
          Flat Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 btn-animated"
        >
          <FaPlus /> Add Flat
        </button>
      </div>
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search flats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Under Maintenance</option>
          </select>
        </div>


      {/* Flats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlats.map((flat) => (
          <div key={flat.id} className="bg-white rounded-lg shadow-md p-6 hover-lift card-hover">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Flat {flat.flatNumber}
                </h3>
                <p className="text-gray-600">Floor: {flat.floor}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(flat)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(flat.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {flat.type}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Size:</span> {flat.size} sq ft
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Rent:</span> ₹{flat.rent}/month
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Deposit:</span> ₹{flat.deposit}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  flat.status === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : flat.status === 'Occupied'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {flat.status}
                </span>
              </div>
              {flat.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {flat.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingFlat ? 'Edit Flat' : 'Add New Flat'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.flatNumber}
                    onChange={(e) => setFormData({...formData, flatNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size (sq ft)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent (₹/month)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.rent}
                    onChange={(e) => setFormData({...formData, rent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deposit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.deposit}
                    onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors btn-animated"
                  >
                    {editingFlat ? 'Update' : 'Add'} Flat
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlatManagement;