// src/services/firestore.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'react-hot-toast';

export const firestoreService = {


  // Generic CRUD operations
  async  createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  },
    

  async updateDocument(collectionName, id, data){
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(`Error updating document: ${error.message}`);
  }
}, 


   async  deleteDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
} ,

async getDocument(collectionName, id) {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    throw new Error(`Error getting document: ${error.message}`);
  }
},

  // FLATS CRUD OPERATIONS
  async  addFlat(flatData) {
    try {
      // ✅ Validate format like A-101
      const isValidFormat = /^[A-Z]-\d{3}$/.test(flatData.flatNumber);
      if (!isValidFormat) {
        toast.error('Flat number must be in format like A-101');
        throw new Error('Invalid flat number format');
      }

      // ✅ Check if flat number already exists
      const existingFlatsSnapshot = await getDocs(collection(db, 'flats'));
      const flatExists = existingFlatsSnapshot.docs.some(doc =>
        doc.data().flatNumber === flatData.flatNumber
      );

      if (flatExists) {
        toast.error(`Flat ${flatData.flatNumber} already exists`);
        throw new Error('Duplicate flat');
      }

      // ✅ Add new flat
      await addDoc(collection(db, 'flats'), {
        ...flatData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success('Flat added successfully!');
    } catch (error) {
      console.error('Add flat error:', error);
      throw error;
    }
  },

  async updateFlat(flatId, updateData) {
    try {
      await updateDoc(doc(db, 'flats', flatId), {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update flat error:', error);
      throw error;
    }
  },

  async deleteFlat(flatId) {
    try {
      await deleteDoc(doc(db, 'flats', flatId));
    } catch (error) {
      console.error('Delete flat error:', error);
      throw error;
    }
  },

  async getFlat(flatId) {
    if (!flatId) throw new Error("Flat ID is undefined");

    try {
      const docSnap = await getDoc(doc(db, 'flats', flatId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Get flat error:', error);
      throw error;
    }
  },

  async getAllFlats() {
    try {
      const querySnapshot = await getDocs(collection(db, 'flats'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get all flats error:', error);
      throw error;
    }
  },

  // Get flats with pagination and ordering
  async getFlatsWithPagination(limitCount = 10, orderByField = 'createdAt') {
    try {
      const q = query(
        collection(db, 'flats'),
        orderBy(orderByField, 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get flats with pagination error:', error);
      throw error;
    }
  },

  // OWNERS CRUD OPERATIONS
  async  addOwner(ownerData) {
  try {
    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerData.email)) {
      toast.error('Invalid email address');
      throw new Error('Invalid email format');
    }

    // ✅ Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(ownerData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      throw new Error('Invalid phone number');
    }

    // ✅ If all validations pass
    const docRef = await addDoc(collection(db, 'owners'), {
      ...ownerData,
      createdAt: new Date(),
    });

    toast.success('Owner added successfully');
    return docRef.id;
  } catch (error) {
    console.error('Add owner error:', error);
    if (!error.message.includes('Invalid')) {
      toast.error('Failed to add owner. Try again.');
    }
    throw error;
  }
},

  async updateOwner(ownerId, updateData) {
    try {
      await updateDoc(doc(db, 'owners', ownerId), {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update owner error:', error);
      throw error;
    }
  },

  async getOwner(ownerId) {
    try {
      const docSnap = await getDoc(doc(db, 'owners', ownerId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Get owner error:', error);
      throw error;
    }
  },

  async getAllOwners() {
    try {
      const querySnapshot = await getDocs(collection(db, 'owners'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get all owners error:', error);
      throw error;
    }
  },

  async getOwnersByFlat(flatId) {
    try {
      const q = query(collection(db, 'owners'), where('flatId', '==', flatId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get owners by flat error:', error);
      throw error;
    }
  },

  // Get recent owners with pagination
  async getRecentOwners(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'owners'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get recent owners error:', error);
      throw error;
    }
  },

  // VEHICLES CRUD OPERATIONS
  async addVehicle(vehicleData) {
    try {
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicleData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Add vehicle error:', error);
      throw error;
    }
  },

  async updateVehicle(vehicleId, updateData) {
    try {
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  },

  async deleteVehicle(vehicleId) {
    try {
      await deleteDoc(doc(db, 'vehicles', vehicleId));
    } catch (error) {
      console.error('Delete vehicle error:', error);
      throw error;
    }
  },

  async searchVehicle(vehicleId) {
    try {
      const docSnap = await getDoc(doc(db, 'vehicles', vehicleId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Get vehicle error:', error);
      throw error;
    }
  },

  async getVehicleByNumber(vehicleNumber) {
    try {
      const q = query(
        collection(db, 'vehicles'), 
        where('vehicleNumber', '==', vehicleNumber.toUpperCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const vehicleDoc = querySnapshot.docs[0];
        const vehicleData = { id: vehicleDoc.id, ...vehicleDoc.data() };
        
        // Get owner and flat details
        const ownerData = await this.getOwner(vehicleData.ownerId);
        const flatData = await this.getFlat(vehicleData.flatId);
        
        return {
          vehicle: vehicleData,
          owner: ownerData,
          flat: flatData
        };
      }
      return null;
    } catch (error) {
      console.error('Get vehicle by number error:', error);
      throw error;
    }
  },

  async getAllVehicles() {
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get all vehicles error:', error);
      throw error;
    }
  },

  async getVehiclesByOwner(ownerId) {
    try {
      const q = query(collection(db, 'vehicles'), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get vehicles by owner error:', error);
      throw error;
    }
  },

  // Get vehicles with pagination and ordering
  async getVehiclesWithPagination(limitCount = 10, orderByField = 'createdAt') {
    try {
      const q = query(
        collection(db, 'vehicles'),
        orderBy(orderByField, 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get vehicles with pagination error:', error);
      throw error;
    }
  },

  // OWNERSHIP TRANSFER
  async transferOwnership(flatId, currentOwnerId, newOwnerData, transferReason, adminUserId) {
    try {
      // Add new owner
      const newOwnerId = await this.addOwner({
        ...newOwnerData,
        flatId: flatId,
        status:"Active",
      });

      // Update current owner to inactive
      await this.updateOwner(currentOwnerId, {
        status : "Old"
      });

      // Update flat with new owner
      await this.updateFlat(flatId, {
        currentOwnerId: newOwnerId,
        previousOwnerId: currentOwnerId
      });

  
      return newOwnerId;
    } catch (error) {
      console.error('Transfer ownership error:', error);
      throw error;
    }
  },

  // REAL-TIME LISTENERS
  subscribeToFlats(callback) {
    return onSnapshot(collection(db, 'flats'), callback);
  },

  subscribeToOwners(callback) {
    return onSnapshot(collection(db, 'owners'), callback);
  },

  subscribeToVehicles(callback) {
    return onSnapshot(collection(db, 'vehicles'), callback);
  },


   // USER ROLE MANAGEMENT
  async getUserRole(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data().role || 'user';
      }
      return 'user'; // default role
    } catch (error) {
      console.error('Get user role error:', error);
      throw error;
    }
  },

  async updateUserRole(userId, role) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: role,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

    // USERS CRUD OPERATIONS
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },




  // DASHBOARD STATS
  async getDashboardStats() {
    try {
      const [flatsSnapshot, ownersSnapshot, vehiclesSnapshot] = await Promise.all([
        getDocs(collection(db, 'flats')),
        getDocs(collection(db, 'owners')),
        getDocs(collection(db, 'vehicles'))
      ]);

      const flats = flatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const owners = ownersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vehicles = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const occupiedFlats = flats.filter(flat => !flat.isAvailable).length;
      const activeOwners = owners.filter(owner => owner.isActive).length;
      const totalFamilyMembers = owners.reduce((sum, owner) => 
        sum + (owner.familyMembers?.totalMembers || 0), 0
      );

      return {
        totalFlats: flats.length,
        occupiedFlats,
        availableFlats: flats.length - occupiedFlats,
        totalOwners: activeOwners,
        totalVehicles: vehicles.length,
        totalFamilyMembers
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  
};

export const getFlatById = firestoreService.getFlat;
export const getVehiclesByOwnerId = firestoreService.getVehiclesByOwner;
export const getAllFlats = firestoreService.getAllFlats;
export const getAllVehicles = firestoreService.getAllVehicles;
export const searchVehicle = firestoreService.searchVehicle ;
export const getUserRole = firestoreService.getUserRole;
export const updateUserRole = firestoreService.updateUserRole;
export const getAllOwners = firestoreService.getAllOwners;
export const updateOwner = firestoreService.updateOwner ;
export const updateFlat = firestoreService.updateFlat ;
export const addOwner = firestoreService.addOwner ;
export const addFlat = firestoreService.addFlat ;
