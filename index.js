
const Tree = require('./lib/tree');
const Dataset = require('./lib/dataset');

const internals = {};

/**
 * Return a NEW tree object
 */
internals.Tree = function () {
  return new Tree();
};

/**
 * Example datasets
 */
internals.Dataset = function (name) {

  console.log(Dataset)
  return Dataset(name);
};

module.exports = internals;
