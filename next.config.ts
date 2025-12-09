import { withWorkflow } from 'workflow/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
  serverExternalPackages: [
    'mongodb',
    '@browserbasehq/stagehand',
    '@browserbasehq/sdk',
    'playwright-core',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
        url: false,
        assert: false,
        buffer: false,
        events: false,
        child_process: false,
        dns: false,
        dgram: false,
        querystring: false,
        string_decoder: false,
        timers: false,
        tty: false,
        v8: false,
        vm: false,
        process: false,
        async_hooks: false,
        perf_hooks: false,
        worker_threads: false,
        inspector: false,
      };
    }
    return config;
  },
};

export default withWorkflow(nextConfig);
