const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Xác định target dựa trên môi trường
  // Trong Docker, sử dụng service name 'server'
  // Ngoài Docker, sử dụng 'localhost'
  const target = process.env.PROXY_TARGET || "http://server:3001";

  app.use(
    "/api",
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      ws: true, // Hỗ trợ WebSocket
      logLevel: "debug",
    })
  );

  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      ws: true, // Quan trọng cho WebSocket
      logLevel: "debug",
    })
  );
};
