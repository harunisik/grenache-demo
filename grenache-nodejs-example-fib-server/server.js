const { PeerRPCServer } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const { processOrder } = require('./order');

const link = new Link({
  grape: 'http://127.0.0.1:30001',
});
link.start();

const peer = new PeerRPCServer(link, {});
peer.init();

const service = peer.transport('server');
service.listen(1337);

setInterval(() => {
  link.announce('order_worker', service.port, {});
}, 1000);

service.on('request', async (rid, key, payload, handler) => {
  const { clientId, productId, productCount } = payload;

  const result = await processOrder(clientId, productId, productCount);

  handler.reply(null, result);
});
