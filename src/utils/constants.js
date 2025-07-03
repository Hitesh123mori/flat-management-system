// File: src/utils/constants.js

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Flat Types
export const FLAT_TYPES = {
  '1BHK': '1BHK',
  '2BHK': '2BHK',
  '3BHK': '3BHK',
  '4BHK': '4BHK',
  STUDIO: 'Studio',
  PENTHOUSE: 'Penthouse'
};

// Flat Status
export const FLAT_STATUS = {
  OCCUPIED: 'occupied',
  VACANT: 'vacant',
  UNDER_MAINTENANCE: 'under_maintenance',
  FOR_SALE: 'for_sale'
};

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle',
  SCOOTER: 'scooter',
  TRUCK: 'truck',
  VAN: 'van',
  SUV: 'suv',
  OTHER: 'other'
};

// Vehicle Fuel Types
export const FUEL_TYPES = {
  PETROL: 'petrol',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  CNG: 'cng',
  LPG: 'lpg'
};

// Transfer Reasons
export const TRANSFER_REASONS = {
  SALE: 'sale',
  INHERITANCE: 'inheritance',
  GIFT: 'gift',
  LEGAL_TRANSFER: 'legal_transfer',
  RENTAL: 'rental',
  OTHER: 'other'
};

// Building Names/Blocks
export const BUILDING_BLOCKS = [
  'A Block',
  'B Block',
  'C Block',
  'D Block',
  'E Block',
  'F Block',
  'G Block',
  'H Block',
  'Tower 1',
  'Tower 2',
  'Tower 3',
  'Tower 4',
  'Main Building',
  'Annexe Building'
];

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Lakshadweep',
  'National Capital Territory of Delhi',
  'Puducherry'
];

// Popular Car Brands in India
export const CAR_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Kia',
  'Honda',
  'Toyota',
  'Ford',
  'Renault',
  'Nissan',
  'Volkswagen',
  'Skoda',
  'Chevrolet',
  'Datsun',
  'Jeep',
  'MG',
  'Isuzu',
  'Force',
  'Bajaj',
  'TVS',
  'Hero',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Royal Enfield',
  'KTM',
  'Harley-Davidson',
  'Indian',
  'Triumph',
  'Ducati',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Jaguar',
  'Land Rover',
  'Volvo',
  'Lexus',
  'Infiniti',
  'Porsche',
  'Ferrari',
  'Lamborghini',
  'Bentley',
  'Rolls-Royce',
  'Maserati',
  'Tesla',
  'BYD',
  'MG Motor',
  'Citroen',
  'Peugeot',
  'Fiat',
  'Jeep',
  'Isuzu',
  'SML Isuzu',
  'Ashok Leyland',
  'Eicher',
  'Bharat Benz',
  'Volvo Eicher',
  'Scania',
  'MAN',
  'Tata Motors',
  'Mahindra',
  'Force Motors',
  'Bajaj Auto',
  'TVS Motor',
  'Hero MotoCorp',
  'Honda Motorcycle',
  'Yamaha Motor',
  'Suzuki Motorcycle',
  'Kawasaki Motors',
  'Royal Enfield',
  'KTM India',
  'Harley-Davidson India',
  'Indian Motorcycle',
  'Triumph Motorcycles',
  'Ducati India',
  'BMW Motorrad',
  'Other'
];

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm:ss',
  TIME: 'HH:mm:ss'
};

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  VEHICLE_NUMBER_REGEX: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PINCODE_REGEX: /^[1-9][0-9]{5}$/
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
};

// Color Scheme
export const COLORS = {
  PRIMARY: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87'
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6'
};

// API Endpoints (if using external APIs)
export const API_ENDPOINTS = {
  GEOCODING: 'https://api.mapbox.com/geocoding/v5/',
  VEHICLE_INFO: 'https://api.vehicleinfo.com/v1/',
  PINCODE_INFO: 'https://api.postalpincode.in/pincode/'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  SEARCH_HISTORY: 'searchHistory',
  RECENTLY_VIEWED: 'recentlyViewed',
  FORM_DATA: 'formData',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  WEAK_PASSWORD: 'Password should be at least 6 characters long.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_VEHICLE_NUMBER: 'Please enter a valid vehicle number (e.g., GJ01AB1234).',
  REQUIRED_FIELD: 'This field is required.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item?',
  TRANSFER_CONFIRMATION: 'Are you sure you want to transfer ownership?'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Record created successfully.',
  UPDATED: 'Record updated successfully.',
  DELETED: 'Record deleted successfully.',
  TRANSFERRED: 'Ownership transferred successfully.',
  SAVED: 'Changes saved successfully.',
  UPLOADED: 'File uploaded successfully.',
  SENT: 'Message sent successfully.',
  LOGGED_IN: 'Logged in successfully.',
  LOGGED_OUT: 'Logged out successfully.',
  PASSWORD_RESET: 'Password reset link sent to your email.',
  PROFILE_UPDATED: 'Profile updated successfully.'
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Search Constants
export const SEARCH = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50
};

// Dashboard Refresh Intervals
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  REAL_TIME: 5000,  // 5 seconds
  NOTIFICATIONS: 60000 // 1 minute
};

// Export all constants as default
export default {
  USER_ROLES,
  FLAT_TYPES,
  FLAT_STATUS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  TRANSFER_REASONS,
  BUILDING_BLOCKS,
  INDIAN_STATES,
  CAR_BRANDS,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  ANIMATION_DURATIONS,
  COLORS,
  API_ENDPOINTS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FILE_UPLOAD,
  SEARCH,
  REFRESH_INTERVALS
};