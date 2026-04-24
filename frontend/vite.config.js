import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Check if your local certificates actually exist
const keyPath = './192.168.9.122-key.pem';
const certPath = './192.168.9.122.pem';
const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);

export default defineConfig({
  plugins: [react()],
  server: useHttps ? {
    // This runs locally when testing on your network
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    host: true, 
  } : {
    // This runs when the certs aren't found (like on Vercel)
    host: true,
  },
});