import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Tüm IP adreslerinden erişimi sağlar
    port: 5173,        // Kullanmak istediğiniz portu buraya yazın
  },
})
