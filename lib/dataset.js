var titanicTrain = null;
var titanicTest = null;

function Dataset (train, predict, features, target) {
  this.train = train;
  this.predict = predict;
  this.features = features;
  this.target = target;
}

module.exports =
  function (name) {
    var basefile = '../datasets/' + name;

    var dataset = require(basefile);

    return new Dataset(
        dataset.train,
        dataset.predict,
        dataset.features,
        dataset.target
      );
  };
