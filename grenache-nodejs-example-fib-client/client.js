const { PeerRPCClient } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');

const link = new Link({
  grape: 'http://127.0.0.1:30001',
  requestTimeout: 10000,
});
link.start();

const peer = new PeerRPCClient(link, {});
peer.init();

function submitOrder(clientId, productId, productCount) {
  return new Promise((resolve, reject) => {
    peer.request('order_worker', { clientId, productId, productCount }, { timeout: 100000 }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log(result);
        resolve(result);
      }
    });
  });
}

async function test_with_promise() {
  await Promise.all([
    submitOrder(1, 1, 5),
    submitOrder(2, 1, 5),
    submitOrder(3, 1, 5),
    submitOrder(1, 1, 5),
    submitOrder(2, 1, 5),
    submitOrder(3, 1, 5),
  ]);
}

test_with_promise();

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function test_with_console() {
  rl.question('Which product ? ', function (productId) {
    rl.question('How many products ? ', function (productCount) {
      submitOrder(11, Number(productId), Number(productCount));
      promptUser();
    });
  });
}

// test_with_console();
