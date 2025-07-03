// backend/functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Import route handlers
const authHandlers = require('./auth');
const flatHandlers = require('./flats');
const ownerHandlers = require('./owners');
const vehicleHandlers = require('./vehicles');

// Middleware for CORS
exports.api = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    // Route handling
    const path = req.path;
    const method = req.method;

    try {
      // Auth routes
      if (path.startsWith('/auth')) {
        return authHandlers.handleAuth(req, res, db);
      }
      
      // Flat routes
      if (path.startsWith('/flats')) {
        return flatHandlers.handleFlats(req, res, db);
      }
      
      // Owner routes
      if (path.startsWith('/owners')) {
        return ownerHandlers.handleOwners(req, res, db);
      }
      
      // Vehicle routes
      if (path.startsWith('/vehicles')) {
        return vehicleHandlers.handleVehicles(req, res, db);
      }
      
      // Default route
      res.status(404).json({ error: 'Route not found' });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Cloud function to create user profile on auth signup
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'user', // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLoginAt: null,
      profile: {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: null,
        gender: '',
      }
    };

    await db.collection('users').doc(user.uid).set(userProfile);
    console.log('User profile created for:', user.email);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

// Cloud function to update user last login
exports.updateUserLastLogin = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection('users').doc(user.uid).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
});

// Cloud function to clean up user data on deletion
exports.deleteUserData = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user profile
    await db.collection('users').doc(user.uid).delete();
    
    // You can add more cleanup logic here if needed
    console.log('User data cleaned up for:', user.email);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});

// Scheduled function to backup data (runs daily at 2 AM)
exports.backupData = functions.pubsub.schedule('0 2 * * *').onRun(async (context) => {
  try {
    const collections = ['flats', 'owners', 'vehicles', 'users'];
    const backupData = {};
    
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      backupData[collection] = [];
      
      snapshot.forEach(doc => {
        backupData[collection].push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    // Store backup in a separate collection
    await db.collection('backups').add({
      data: backupData,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      type: 'daily'
    });
    
    console.log('Daily backup completed');
  } catch (error) {
    console.error('Backup error:', error);
  }
});

// Cloud function to send notifications
exports.sendNotification = functions.firestore.document('notifications/{notificationId}').onCreate(async (snap, context) => {
  try {
    const notification = snap.data();
    
    // Here you can implement push notification logic
    // For example, using Firebase Cloud Messaging (FCM)
    
    console.log('Notification created:', notification);
  } catch (error) {
    console.error('Notification error:', error);
  }
});

// Cloud function to validate vehicle number format
exports.validateVehicleNumber = functions.https.onCall((data, context) => {
  const { vehicleNumber } = data;
  
  // Indian vehicle number pattern: XX00XX0000
  const pattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
  
  return {
    isValid: pattern.test(vehicleNumber),
    formatted: vehicleNumber.replace(/\s/g, '').toUpperCase()
  };
});

// Cloud function to generate reports
exports.generateReport = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is authenticated and has admin role
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'User must be admin');
    }
    
    const { reportType } = data;
    let reportData = {};
    
    switch (reportType) {
      case 'flats':
        const flatsSnapshot = await db.collection('flats').get();
        reportData = {
          totalFlats: flatsSnapshot.size,
          occupiedFlats: flatsSnapshot.docs.filter(doc => doc.data().isOccupied).length,
          flats: flatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        break;
        
      case 'owners':
        const ownersSnapshot = await db.collection('owners').get();
        reportData = {
          totalOwners: ownersSnapshot.size,
          owners: ownersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        break;
        
      case 'vehicles':
        const vehiclesSnapshot = await db.collection('vehicles').get();
        reportData = {
          totalVehicles: vehiclesSnapshot.size,
          vehicles: vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
        break;
        
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid report type');
    }
    
    return {
      success: true,
      data: reportData,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
  } catch (error) {
    console.error('Report generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate report');
  }
});

// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
});