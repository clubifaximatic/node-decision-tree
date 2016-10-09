var dt = require('../');

// get dataset
var dataset = dt.Dataset('titanic');

console.log('features:', dataset.features);
console.log('target:', dataset.target);

// Create tree and fit the model
var tree = new dt.Tree;
var nodes = tree.fit(dataset.train, dataset.features, dataset.target);

console.log('nodes:', JSON.stringify(tree.root, null, 2));

// Predict
var predictions = tree.predict(dataset.predict);
console.log('predict:', predictions);

// Test
var error = tree.test(dataset.predict, dataset.target);
console.log('error', error);
