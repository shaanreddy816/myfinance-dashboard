/**
 * Main Entry Point — Initializes the FamLedgerAI application
 *
 * This file serves as the bridge between the old monolithic index.html
 * and the new modular architecture. It imports extracted modules and
 * makes them available globally for the existing inline code.
 */

// Import extracted modules
import { sb, setCurrentUserEmail, isAuthenticated, getCurrentSession } from './lib/supabaseClient.js';
import * as forecastEngine from './engines/forecastEngine.js';
import * as riskEngine from './engines/riskEngine.js';
import * as stressEngine from './engines/stressEngine.js';

// Expose modules globally for backward compatibility with inline code
// (This will be removed once all code is migrated to imports)
window.sb = sb;
window.supabase = sb;
window.setCurrentUserEmail = setCurrentUserEmail;
window.isAuthenticated = isAuthenticated;
window.getCurrentSession = getCurrentSession;

// Expose engine functions globally
window.forecastEngine = forecastEngine;
window.riskEngine = riskEngine;
window.stressEngine = stressEngine;

console.log('✅ FamLedgerAI modules loaded');
console.log('📦 Forecast Engine:', Object.keys(forecastEngine).length, 'functions');
console.log('📦 Risk Engine:', Object.keys(riskEngine).length, 'functions');
console.log('📦 Stress Engine:', Object.keys(stressEngine).length, 'functions');
console.log('🔐 Supabase client initialized');

// The rest of the app initialization will happen in the inline script
// in index.html (for now, until we migrate everything)
