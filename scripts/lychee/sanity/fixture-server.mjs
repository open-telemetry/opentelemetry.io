// Minimal HTTP server for the external-URL sanity tests. Serves one HTML page
// (with a known anchor) for every path and prints its chosen port on stdout.
// It runs as its own process so it can respond while the test thread is blocked
// invoking lychee synchronously.

import http from 'node:http';

const PAGE =
  '<!doctype html><html><body><h2 id="remote-anchor">R</h2></body></html>';

const server = http.createServer((_req, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(PAGE);
});

server.listen(0, '127.0.0.1', () => {
  process.stdout.write(`${server.address().port}\n`);
});
