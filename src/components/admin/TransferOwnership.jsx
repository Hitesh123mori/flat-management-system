import React, { useState, useEffect } from 'react';
import { UserCheck, Building, Users, Phone, Mail, MapPin, Calendar, FileText, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ShimmerLoader from '../common/ShimmerLoader';
import ProgressBar from '../common/ProgressBar';
import {
  getAllFlats,
  getAllOwners,
  addOwner,
  updateOwner,
  updateFlat
} from '../../services/firestore';

const TransferOwnership = () => {
  const [flats, setFlats] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [selectedExistingOwnerId, setSelectedExistingOwnerId] = useState('');

  // New owner form data
  const [newOwnerData, setNewOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occupancyDate: new Date().toISOString().split('T')[0],
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


  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewOwnerData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewOwnerData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedFlat || !newOwnerData.name || !newOwnerData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const { adults, children, males, females } = newOwnerData.familyDetails;

    if ([adults, children, males, females].some(val => !val || val <= 0)) {
      alert('All family details (adults, children, males, females) must be greater than 0.');
      return;
    }


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

    let newOwnerId;

if (selectedExistingOwnerId) {
  // update existing owner
  await updateOwner(selectedExistingOwnerId, {
    ...newOwnerData,
    flatId: selectedFlat,
    updatedAt: new Date().toISOString()
  });
  newOwnerId = selectedExistingOwnerId;
} else {
  // add new owner
  newOwnerId = await addOwner({
    ...newOwnerData,
    flatId: selectedFlat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

   setSelectedExistingOwnerId('');


     await updateFlat(selectedFlat, {
      ownerId: newOwnerId,
      previousOwnerId: oldOwnerId || '',
      status: 'Occupied',
      maleCount: newOwnerData.familyDetails.males,
      femaleCount: newOwnerData.familyDetails.females,
      childrenCount: newOwnerData.familyDetails.children,
      totalResidents: newOwnerData.familyDetails.totalMembers,
      updatedAt: new Date().toISOString()
    });

      if (oldOwnerId) {
        await updateOwner(oldOwnerId, {
          status: 'Old',
          updatedAt: new Date().toISOString()
        });
      }

      clearInterval(progressInterval);
      setTransferProgress(100);

      // Reset form
      setSelectedFlat('');
      setNewOwnerData({
        name: '',
        email: '',
        phone: '',
        address: '',
        occupancyDate: new Date().toISOString().split('T')[0],
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
          <ShimmerLoader width="100%" height="64px" />
          <ShimmerLoader width="100%" height="64px" />
          <ShimmerLoader width="100%" height="64px" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Ownership</h1>
          <p className="text-gray-600">Transfer flat ownership to a new owner</p>
        </div>

        {/* Progress Bar */}
        {transferProgress > 0 && (
          <div className="mb-6">
            <ProgressBar progress={transferProgress} />
          </div>
        )}

        <form onSubmit={handleTransferOwnership} className="space-y-8">
          {/* Flat Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-6 h-6 text-purple-600 mr-2" />
              Select Flat
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Flat for Transfer
                </label>
                <select
                  value={selectedFlat}
                  onChange={(e) => setSelectedFlat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a flat...</option>
                  {flats.map(flat => (
                    <option key={flat.id} value={flat.id}>
                      Flat {flat.flatNumber} - Floor {flat.floor} ({flat.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Owner Info */}
              {currentOwner && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">Current Owner</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="font-medium text-purple-700">Name:</span> {currentOwner.name}</div>
                    <div><span className="font-medium text-purple-700">Phone:</span> {currentOwner.phone}</div>
                    <div><span className="font-medium text-purple-700">Email:</span> {currentOwner.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
    <Users className="w-6 h-6 text-purple-600 mr-2" />
    Existing Owner (Optional)
  </h3>

  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Existing Owner (Will autofill details)
      </label>

<select
  value={selectedExistingOwnerId}
  onChange={(e) => {
    const selectedOwnerId = e.target.value;
    setSelectedExistingOwnerId(selectedOwnerId);

    if (!selectedOwnerId) return;

    const existingOwner = owners.find(o => o.id === selectedOwnerId);
    if (!existingOwner) return;

    setNewOwnerData({
      name: existingOwner.name || '',
      email: existingOwner.email || '',
      phone: existingOwner.phone || '',
      address: existingOwner.address || '',
      occupancyDate: existingOwner.occupancyDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      status: 'Active',
      familyDetails: existingOwner.familyDetails || {
        totalMembers: 0,
        adults: 0,
        children: 0,
        males: 0,
        females: 0
      },
      emergencyContact: existingOwner.emergencyContact || {
        name: '',
        phone: '',
        relation: ''
      },
      documents: existingOwner.documents || {
        aadhar: '',
        pan: '',
        lease: ''
      }
    });
  }}
  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
>
  <option value="" className="text-gray-400">-- Select an existing owner --</option>
  {owners.map(owner => {
    const flat = flats.find(flat => flat.ownerId === owner.id);
    const flatLabel = flat ? `Flat ${flat.flatNumber}` : 'No Flat';
    const statusColor = owner.status === 'Active' ? 'text-green-600' : owner.status === 'Old' ? 'text-yellow-600' : 'text-gray-600';

    return (
      <option key={owner.id} value={owner.id}>
        {owner.name} — {flatLabel} — {owner.status}
      </option>
    );
  })}
</select>


    </div>
  </div>
</div>



          {/* New Owner Details */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="w-6 h-6 text-purple-600 mr-2" />
              New Owner Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newOwnerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newOwnerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newOwnerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={newOwnerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupancy Date
                  </label>
                  <input
                    type="date"
                    value={newOwnerData.occupancyDate}
                    onChange={(e) => handleInputChange('occupancyDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Family Details */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-6 h-6 text-purple-600 mr-2" />
              Family Details
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOwnerData.familyDetails.adults}
                  onChange={(e) => handleInputChange('familyDetails.adults', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOwnerData.familyDetails.children}
                  onChange={(e) => handleInputChange('familyDetails.children', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Males
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOwnerData.familyDetails.males}
                  onChange={(e) => handleInputChange('familyDetails.males', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Females
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOwnerData.familyDetails.females}
                  onChange={(e) => handleInputChange('familyDetails.females', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Optional Fields Toggle */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="w-6 h-6 text-purple-600 mr-2" />
                Optional Details
              </h3>
              <span className="text-purple-600 text-sm">
                {showOptionalFields ? 'Hide' : 'Show'} Optional Fields
              </span>
            </button>

            {showOptionalFields && (
              <div className="mt-6 space-y-6">
                {/* Emergency Contact */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newOwnerData.emergencyContact.name}
                        onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Emergency contact name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newOwnerData.emergencyContact.phone}
                        onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Emergency contact phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={newOwnerData.emergencyContact.relation}
                        onChange={(e) => handleInputChange('emergencyContact.relation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Relation (e.g., Father, Brother)"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={newOwnerData.documents.aadhar}
                        onChange={(e) => handleInputChange('documents.aadhar', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Aadhar number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={newOwnerData.documents.pan}
                        onChange={(e) => handleInputChange('documents.pan', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="PAN number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lease Agreement
                      </label>
                      <input
                        type="text"
                        value={newOwnerData.documents.lease}
                        onChange={(e) => handleInputChange('documents.lease', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Lease agreement reference"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedFlat || !newOwnerData.name || !newOwnerData.phone}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>Transfer Ownership</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferOwnership;