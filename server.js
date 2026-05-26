const http = require('http');
const httpProxy = require('http-proxy');

// ==========================================
// CANONICAL PRODUCTION MATRIX
// ==========================================
const TARGET_DOMAIN = 'infamous-tutoring.space';
const TARGET_URL = `https://${TARGET_DOMAIN}`;
const PORT = 9000;
// ==========================================

// Create a highly optimized proxy engine with SSL modeling capabilities
const proxy = httpProxy.createProxyServer({
    target: TARGET_URL,
    changeOrigin: true,
    secure: false, // Prevents self-signed or strict SSL checks from dropping the stream
    ws: true       // CRITICAL: Enables raw WebSocket tunneling support
});

const server = http.createServer((req, client_res) => {
    // Override security frames on the fly to bypass school sandbox blockers
    client_res.setHeader('Access-Control-Allow-Origin', '*');
    client_res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    client_res.setHeader('Access-Control-Allow-Headers', '*');

    // Force Cloudflare edge passthrough variables
    req.headers['host'] = TARGET_DOMAIN;
    req.headers['origin'] = TARGET_URL;
    req.headers['referer'] = TARGET_URL;
    req.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36';

    // Route standard HTTP/HTTPS traffic
    proxy.web(req, client_res, (err) => {
        console.error(`[WEB ERROR] ${err.message}`);
        if (!client_res.headersSent) {
            client_res.writeHead(502);
            client_res.end("Mirroring failed at the Web Routing Layer.");
        }
    });
});

// ==========================================
// CRITICAL: THE WEBSOCKET TUNNEL ENGINE
// ==========================================
server.on('upgrade', (req, socket, head) => {
    // Rewrite host and origin variables for the secure WebSocket handshake
    req.headers['host'] = TARGET_DOMAIN;
    req.headers['origin'] = TARGET_URL;

    console.log(`[WS TUNNEL] Upgrading connection to WebSocket for path: ${req.url}`);
    
    proxy.ws(req, socket, head, (err) => {
        console.error(`[WS FAULT] Tunnel connection dropped: ${err.message}`);
        socket.destroy();
    });
});

// Avoid crashes if the proxy target breaks connections unexpectedly
proxy.on('error', (err, req, res) => {
    console.error(`[PROXY CORE EXCEPTION]: ${err.message}`);
});

server.listen(PORT, () => {
    console.log(`[ONLINE] Deep-Mirror Engine Fully Initialized.`);
    console.log(`Tunneling HTTP and WebSockets word-for-word from: ${TARGET_DOMAIN}`);
    console.log(`Local Core Node listening on http://127.0.0.1:${PORT}`);
});
