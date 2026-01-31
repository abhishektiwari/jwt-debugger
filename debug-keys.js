import { getRealKey, REAL_KEYS } from './src/composables/useKeyLoader.js';

console.log('Available keys:', Object.keys(REAL_KEYS));
console.log('RS256 private key exists:', !!getRealKey('RS256', 'private')); 
console.log('RS256 private key length:', getRealKey('RS256', 'private')?.length);
console.log('First 50 chars:', getRealKey('RS256', 'private')?.substring(0, 50));