import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../common/LoadingSpinner';
import ShimmerLoader from '../common/ShimmerLoader';
import { FaPlus, FaEdit, FaTrash, FaUser, FaUsers, FaSearch, FaMale, FaFemale, FaChild } from 'react-icons/fa';

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  

  const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  address: '',
  flatId: '',
  occupancyDate: '',
  status: 'Active', 
  familyDetails: {
    totalMembers: 0,
    adults: 0,
    children: 0,
    males: 0,
    females: 0
  },
  emergencyContact: {
    name: '',
    phone: '',
    relation: ''
  },
  documents: {
    aadhar: '',
    pan: '',
    lease: ''
  }
});


  useEffect(() => {
    fetchOwners();
    fetchFlats();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'owners'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const ownersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOwners(ownersList);
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const q = query(collection(db, 'flats'), orderBy('flatNumber'));
      const querySnapshot = await getDocs(q);
      const flatsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFlats(flatsList);
    } catch (error) {
      console.error('Error fetching flats:', error);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const flatRef = doc(db, 'flats', formData.flatId);
    const flatStatus = formData.status === 'Active' ? 'Occupied' : 'Available';

    if (editingOwner) {
      await updateDoc(doc(db, 'owners', editingOwner.id), {
        ...formData,
        updatedAt: new Date().toISOString()
      });

      // Update flat status
      await updateDoc(flatRef, {
        status: flatStatus
      });

    } else {
      const docRef = await addDoc(collection(db, 'owners'), {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update flat status
      await updateDoc(flatRef, {
        status: flatStatus
      });
    }

    resetForm();
    fetchOwners();
    fetchFlats(); 
  } catch (error) {
    console.error('Error saving owner:', error);
  }
};


  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      flatId: owner.flatId,
      occupancyDate: owner.occupancyDate,
      familyDetails: owner.familyDetails || {
        totalMembers: 0,
        adults: 0,
        children: 0,
        males: 0,
        females: 0
      },
      status: owner.status || 'Active',
      emergencyContact: owner.emergencyContact || {
        name: '',
        phone: '',
        relation: ''
      },
      documents: owner.documents || {
        aadhar: '',
        pan: '',
        lease: ''
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this owner?')) {
      try {
        await deleteDoc(doc(db, 'owners', id));
        fetchOwners();
      } catch (error) {
        console.error('Error deleting owner:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      flatId: '',
      status : "Active",
      occupancyDate: '',
      familyDetails: {
        totalMembers: 0,
        adults: 0,
        children: 0,
        males: 0,
        females: 0
      },
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      },
      documents: {
        aadhar: '',
        pan: '',
        lease: ''
      }
    });
    setEditingOwner(null);
    setShowModal(false);
  };

  const getFlatNumber = (flatId) => {
    const flat = flats.find(f => f.id === flatId);
    return flat ? flat.flatNumber : 'N/A';
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone.includes(searchTerm) ||
    getFlatNumber(owner.flatId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <ShimmerLoader className="h-8 w-48" />
          <ShimmerLoader className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ShimmerLoader key={i} className="h-80 rounded-lg" />
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
          <FaUser className="text-purple-600" />
          Owner Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 btn-animated"
        >
          <FaPlus /> Add Owner
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Owners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => (
          <div key={owner.id} className="bg-white rounded-lg shadow-md p-6 hover-lift card-hover">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {owner.name}
                </h3>
                <p className="text-gray-600">Flat: {getFlatNumber(owner.flatId)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(owner)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(owner.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {owner.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {owner.phone}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Occupancy Date:</span> {owner.occupancyDate}
              </p>
              
              {/* Family Details */}
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaUsers className="text-purple-600" />
                  Family Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-gray-500 text-xs" />
                    <span>Total: {owner.familyDetails?.totalMembers || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaMale className="text-blue-500 text-xs" />
                    <span>Males: {owner.familyDetails?.males || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaFemale className="text-pink-500 text-xs" />
                    <span>Females: {owner.familyDetails?.females || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaChild className="text-green-500 text-xs" />
                    <span>Children: {owner.familyDetails?.children || 0}</span>
                  </div>  


                </div>


              </div>
              <div>
                {owner.status === 'Active' ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-md">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                    </span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-md">
                    <span className="h-3 w-3 bg-red-600 rounded-full"></span>
                    Old
                  </span>
                )}
              </div>



            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingOwner ? 'Edit Owner' : 'Add New Owner'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flat
                    </label>
                    <select
                      required
                      value={formData.flatId}
                      onChange={(e) => setFormData({...formData, flatId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Flat</option>
                      {flats.map(flat => (
                        <option key={flat.id} value={flat.id}>
                          Flat {flat.flatNumber} - {flat.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupancy Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.occupancyDate}
                      onChange={(e) => setFormData({...formData, occupancyDate: e.target.value})}
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
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Old">Old</option>
                  </select>
                </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Family Details */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Family Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Members
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.familyDetails.totalMembers}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyDetails: {
                            ...formData.familyDetails,
                            totalMembers: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adults
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.familyDetails.adults}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyDetails: {
                            ...formData.familyDetails,
                            adults: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Children
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.familyDetails.children}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyDetails: {
                            ...formData.familyDetails,
                            children: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Males
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.familyDetails.males}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyDetails: {
                            ...formData.familyDetails,
                            males: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Females
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.familyDetails.females}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyDetails: {
                            ...formData.familyDetails,
                            females: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            phone: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact.relation}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: {
                            ...formData.emergencyContact,
                            relation: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.aadhar}
                        onChange={(e) => setFormData({
                          ...formData,
                          documents: {
                            ...formData.documents,
                            aadhar: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.documents.pan}
                        onChange={(e) => setFormData({
                          ...formData,
                          documents: {
                            ...formData.documents,
                            pan: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lease Agreement
                      </label>
                      <input
                        type="text"
                        value={formData.documents.lease}
                        onChange={(e) => setFormData({
                          ...formData,
                          documents: {
                            ...formData.documents,
                            lease: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors btn-animated"
                  >
                    {editingOwner ? 'Update' : 'Add'} Owner
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

export default OwnerManagement;