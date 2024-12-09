import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Enables the server to use your local network IP
    port: 5173, // Optional: Specify a custom port (default is 5173)
  },
})
