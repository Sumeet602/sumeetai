import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseAuth = null;

export const initFirebase = () => {
    try {
        const keyPath = path.join(__dirname, '../serviceAccountKey.json');
        
        if (fs.existsSync(keyPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log('Auth Service: Firebase Admin initialized successfully');
        } else {
            console.warn('Auth Service: WARNING - serviceAccountKey.json not found. Firebase verification will fail.');
        }
    } catch (error) {
        console.error('Auth Service: Firebase init error:', error);
    }
};

// Re-export getAuth from firebase-admin/auth
export { getAuth };