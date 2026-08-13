import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async headers() {
    return [
      {
        // Evita que o CDN/navegador segure uma versão antiga do Service Worker
        // por mais tempo do que o esperado — ele precisa ser sempre revalidado
        // pra atualizações do app chegarem nos aparelhos já instalados.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
