// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


import phases     from 'next/constants.js'


export default function cfg(phase, { defaultConfig }) {
   console.log(`          ${phase}\n`)
   /**
    * @type {import('next').NextConfig}
    */
   const nextConfig = {
      distDir:          phase===phases.PHASE_DEVELOPMENT_SERVER? '.dev' : '.bin',
      reactStrictMode:  true,
   }
   return nextConfig
}
