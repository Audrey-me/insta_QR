// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/proxy',
        destination: 'http://backend-service:8000/generate-qr/',
      },
      {
       	source: '/api/proxy-image',
        destination: 'http://backend-service:8000/generate-qr-image/',
      },
      {
        source: '/metrics',
        destination:'http://backend-service:8000/metrics',
      }
    ];
  },
};

