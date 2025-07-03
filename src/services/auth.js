// src/services/auth.js
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {


  async signUp(email, password, role){

     try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    });
    
    return { user, role };
  } catch (error) {
    throw new Error(error.message);
  }
  },
  
  // Sign in user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      return {
        user: user,
        role: userData?.role || 'user',
        userData: userData
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Create new user (Admin only)
  async createUser(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        name: userData.name,
        role: userData.role || 'user',
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid
      });
      
      return user;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Get user role
  async getUserRole(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.data()?.role || 'user';
    } catch (error) {
      console.error('Get user role error:', error);
      return 'user';
    }
  }
};


// export const signIn  = authService.signIn ;
// export const signUp  = authService.signUp ;

