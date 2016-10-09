var _ = require('lodash');
var debug = require('debug')('tree');

/**
 * Create a node
 */
function Node (feature, value, children) {
  debug('+ NODE feature:', feature, 'value:', value, '#children:', children.length || 1);

  return {
    isLeaf: false,
    feature: feature,
    value: value,
    children: _.isArray(children) ? children : [children]
  };
}

/**
 * Create a leaf
 */
function Leaf (clazz) {
  debug('+ LEAF class:', clazz);

  return {
    isLeaf: true,
    class: clazz
  };
}

/**
 * Create a tree
 */
function Tree () {
  debug('+ TREE class');
  this.root = null;
}

/**
 * Fit tree. Previous feed is destroyed
 */
Tree.prototype.fit = function (data, features, target) {
  debug('* fit #data:', data.length, 'features:', features, 'target:', target);

  // unique featrues
  var uniqFeatures = _.uniq(features);

  // fit tree
  this.root = _fit(data, features, target);
};

/**
 * predict
 */
Tree.prototype.predict = function (samples) {
  debug('* predict', (this.root != null));

  var root = this.root;
  return _.map(samples, function (doc) {
    return _predict(root, doc);
  });
};

/**
 * test
 */
Tree.prototype.test = function (samples, target) {
  debug('* test', (this.root != null));

  // guard
  if (!samples || samples.length == 0) {
    debug('- no samples to test');
    return 0;
  }

  var ok = 0;
  var root = this.root;
  _.map(samples, function (doc) {
    if (_predict(root, doc) == doc[target]) {
      ok++;
    };
  });

  debug('- test ok / samples = ', ok, '/', samples.length, '=', (ok / samples.length));
  return (1 - (ok / samples.length));
};

/**
 * Fit data
 */
function _fit (data, features, target) {
  debug('* _fit #data:', data.length, 'features:', features);

  var probs = _calculateProbs(data, features, target);

  var bestFeature = _calculeBestFeature(data, probs);

  return _splitTree(data, features, target, bestFeature, probs);
}

/**
 * Predict one sample
 */
function _predict (root, sample) {
  debug('* _predict one sample:', sample);

  var node = root;
  var clazz = null;

  var tabs = '';

  while (true) {

    debug('---', tabs.length);
    debug(tabs, JSON.stringify(node, null, 2));
    tabs += '\t';

    var newNode = _.find(node, function (doc) {
      return doc.value == sample[doc.feature];
    });

    // check if there is not a new node
    if (!newNode) {
      clazz = null;
      break;
    }

    node = newNode.children;
    debug('-  _predict #children:', node.length, 'sample', sample);

    if (node.length == 1 && node[0].isLeaf) {
      clazz = node[0].class;
      break;
    }
  }

  debug('-  _predict class:', clazz);
  return clazz;
}



/**
 * Count different number of classes depending on the input
 */
function _calculateProbs (data, features, target) {
  debug('* _calculateProbs #data:', data.length, 'features:', features);

  //init
  var probs = {};

  data.map(function (doc) {
    features.map(function (key) {
      if (!doc[key]) return;

      var v = doc[key];
      var t = doc[target];
      if (v && t) {
        if (!probs[key]) probs[key] = { };
        if (!probs[key][v]) probs[key][v] = { __all: 0 };
        if (!probs[key][v][t]) probs[key][v][t] = 0;
        probs[key][v][t] += 1;
        probs[key][v].__all += 1;
      }
    });
  });

  return probs;
}

/**
 *
 */
function _calculeBestFeature (data, probs) {
  debug('* _calculeBestFeature');

  var dataLen = data.length;
  var entropy = {};

  var feature = null;
  var lastEntropy = 100;

  for (var f in probs) {

    var allEntropy = 0;

    for (var v in probs[f]) {

      var total = probs[f][v].__all;
      delete probs[f][v].__all;
      var vEntropy = 0;

      for (var t in probs[f][v]) {
        //DEL if (t == '__all') continue;

        var p = probs[f][v][t] / total;
        vEntropy += -p * (Math.log(p) / Math.log(2));
      }

      allEntropy += (total / dataLen) * vEntropy;
    }

    if (lastEntropy > allEntropy) {
      lastEntropy = allEntropy;
      feature = f;
    }

    entropy[f] = allEntropy;
  }

  debug('-  _calculeBestFeature feature:', feature);
  return feature;
}

/**
 * Split tree bassed on the new feature
 */
function _splitTree (data, features, target, bestFeature, probs) {
  debug('* _splitTree #data:', data.length, 'features:', features, 'bestFeature:', bestFeature);

  const featureProbs = probs[bestFeature];

  // calculate posible values
  var possibleValues = _.keys(featureProbs);
  debug('-  _splitTree feature:', bestFeature, 'values:', possibleValues);

  // check if Leaf (only one value)
  if (possibleValues.length == 1) {
    var mostCommonClass = _getMostCommonClass(featureProbs, possibleValues[0]);
    return Node(bestFeature, possibleValues[0], Leaf(mostCommonClass));
  }

  var newFeatures = _.without(features, bestFeature);
  debug('-  _splitTree feature:', bestFeature, 'newFeatures:', newFeatures, 'possibleValues');

  // for each possible value
  var nodes = _.map(possibleValues, function (value) {

    // calculate possible classes
    var classes = _.keys(featureProbs[value]);
    debug('-  _splitTree feature:', bestFeature, 'classes:', classes);

    // check if leaf (only one class)
    if (classes.length == 1) {
      return Node(bestFeature, value, Leaf(classes[0]));
    }

    // check if no more features_for_sample
    if (newFeatures.length == 0) {
      var mostCommonClass = _getMostCommonClass(featureProbs, value);
      return Node(bestFeature, value, Leaf(mostCommonClass));
    }

    // get new data
    var newData = data.filter(function (doc) { return doc[bestFeature] == value });
    debug('  _splitTree feature:', bestFeature, '#oldData:', data.length, '#newData:', newData.length);

    return Node(bestFeature, value, _fit(newData, newFeatures, target));
  });

  return nodes;
}

/**
 * Calculate the most common class
 */
function _getMostCommonClass (probs, feature) {
  debug('* _getMostCommonClass feature:', feature);

  var bestClass = null;
  var bestClassValue = 0;
  for (var key in probs[feature]) {
    var value = probs[feature][key];
    if (value > bestClassValue) {
      bestClass = key;
      bestClassValue = value;
    }
  }

  debug('  _getMostCommonClass result:', bestClass);
  return bestClass;
}

module.exports = Tree;
