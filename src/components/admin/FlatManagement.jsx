// File: src/components/admin/FlatManagement.jsx

import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../common/LoadingSpinner';
import ShimmerLoader from '../common/ShimmerLoader';
import { FaPlus, FaEdit, FaTrash, FaHome, FaUsers, FaSearch, FaUser } from 'react-icons/fa';

const FlatManagement = () => {
  const [flats, setFlats] = useState([]);
  const [owners, setOwners] = useState([]);
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [flatsSnap, ownersSnap] = await Promise.all([
        getDocs(query(collection(db, 'flats'), orderBy('flatNumber'))),
        getDocs(collection(db, 'owners'))
      ]);

      const ownersList = ownersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const flatsList = flatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setOwners(ownersList);
      setFlats(flatsList);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      fetchData();
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
        fetchData();
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
      description: '',
      ownerId: ''
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

  const getOwnerDetails = (ownerId) => owners.find(o => o.id === ownerId);

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaHome className="text-purple-600" />
          Flat Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Add Flat
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlats.map((flat) => {
          const owner = getOwnerDetails(flat.ownerId);
          return (
            <div key={flat.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Flat {flat.flatNumber}
                  </h3>
                  <p className="text-gray-600">Floor: {flat.floor}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(flat)} className="text-blue-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(flat.id)} className="text-red-600">
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Type:</strong> {flat.type}</p>
                <p><strong>Size:</strong> {flat.size} sq ft</p>
                <p><strong>Rent:</strong> ₹{flat.rent}/month</p>
                <p><strong>Deposit:</strong> ₹{flat.deposit}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${flat.status === 'Available' ? 'bg-green-100 text-green-800' : flat.status === 'Occupied' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{flat.status}</span></p>
                {flat.description && <p><strong>Description:</strong> {flat.description}</p>}
              </div>

              {owner && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <h4 className="text-purple-800 font-semibold mb-1 flex items-center gap-2">
                    <FaUser /> Owner Details
                  </h4>
                  <p className="text-sm"><strong>Name:</strong> {owner.name}</p>
                  <p className="text-sm"><strong>Phone:</strong> {owner.phone}</p>
                  <p className="text-sm"><strong>Email:</strong> {owner.email}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal remains unchanged (omitted for brevity) */}
    </div>
  );
};

export default FlatManagement;
