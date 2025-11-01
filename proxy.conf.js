const PROXY_CONFIG = [
  {
    context: ['/api/**'],
    target: 'http://localhost:5160',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': ''
    },
    onProxyReq: function(proxyReq, req, res) {
      console.log('🔄 Proxy request:', req.method, req.url, '→', proxyReq.path);
    },
    onProxyRes: function(proxyRes, req, res) {
      console.log('✅ Proxy response:', req.url, '→ Status:', proxyRes.statusCode);
    },
    onError: function(err, req, res) {
      console.log('❌ Proxy error:', err.message);
    }
  }
];

module.exports = PROXY_CONFIG;