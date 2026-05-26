import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@honeybee/shared', '@honeybee/supabase-client'],
}

export default nextConfig
