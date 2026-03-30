import { createBareServer } from '@tomphttp/bare-server-node';
import http from 'http';

const server = http.createServer();

const bare = createBareServer('/bare/');

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bare server is running');
  }
});

const port = process.env.PORT || 10000;

server.listen(port, () => {
  console.log('Server running on port', port);
});
