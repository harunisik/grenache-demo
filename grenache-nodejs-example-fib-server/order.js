let mutex = Promise.resolve(); // global mutex instance

const products = [
  { id: 1, stock: 100 },
  { id: 2, stock: 200 },
  { id: 3, stock: 300 },
];

const orderBook = [];

const findProduct = (productId) => {
  const product = products.find(({ id }) => id === productId);
  if (!product) {
    throw new Error('product not found');
  }
  return product;
};

const findOrder = (clientId) => {
  return orderBook.find(({ id }) => id === clientId);
};

const validateStock = (product, requestedStock) => {
  if (product.stock < requestedStock) {
    throw new Error('product stock is not sufficent');
  }
};

const updateStock = (product, requestedStock) => {
  product.stock -= requestedStock; // update stocks in product table
};

// internal order process
const __processOrder = (clientId, productId, productCount) => {
  mutex = mutex
    .then(() => {
      const product = findProduct(productId);
      validateStock(product, productCount);
      updateStock(product, productCount);

      let clientOrder = findOrder(clientId);

      if (clientOrder) {
        // if client has an order record
        const clientProduct = clientOrder.products.find(({ id }) => id === productId);
        if (clientProduct) {
          // if requested product exists
          clientProduct.count += productCount;
          clientProduct.stock = product.stock;
        } else {
          // create a new product record in existing client order
          clientOrder.products.push({ id: productId, count: productCount, stock: product.stock });
        }
      } else {
        // create a new client order with a new product record
        clientOrder = { id: clientId, products: [{ id: productId, count: productCount, stock: product.stock }] };
        orderBook.push(clientOrder);
      }
      console.log(clientOrder);
      return clientOrder;
    })
    .catch(() => {});

  return mutex;
};

const processOrder = async (clientId, productId, productCount) => {
  const result = await __processOrder(clientId, productId, productCount);
  return result;
};

module.exports = { processOrder };
