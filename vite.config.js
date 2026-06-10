import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'orbit-os' to your actual GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/Niriksh/',
})
