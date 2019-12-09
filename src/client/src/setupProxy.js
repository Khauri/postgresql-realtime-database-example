// Manually configure the proxy to use an environment variable instead of hard coding it
// @see https://create-react-app.dev/docs/proxying-api-requests-in-development/#configuring-the-proxy-manually
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  const {PORT=5000} = process.env;
  app.use(
    '/api',
    proxy({
      target: `http://localhost:${PORT}`,
      changeOrigin: true,
    })
  );
  // a development only route for logging process.env variables
  // these wiill only change if the server is restarted
  app.get('/.env', (req, res) => {
    res.send(`<pre>\n${JSON.stringify({...process.env, PORT}, null, 4)}</pre>`);
  });
};
