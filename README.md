# node-decision-tree

Machine Learning. Decision tree implementation

## Implementation

A classification tree using ID3. 

## example

```js
var dt = require('node-decision-tree');

var train = [
    { class: 'crew', age: 'adult', sex: 'male', survived: 'no' },
    { class: '1st', age: 'adult', sex: 'female', survived: 'yes' },
    { class: 'crew', age: 'adult', sex: 'male', survived: 'no' },
    { class: '3rd', age: 'adult', sex: 'female', survived: 'no' },
    { class: 'crew', age: 'adult', sex: 'male', survived: 'no' },
    { class: 'crew', age: 'adult', sex: 'male', survived: 'no' },
    { class: '2nd', age: 'adult', sex: 'male', survived: 'no' },
    { class: '2nd', age: 'adult', sex: 'female', survived: 'yes' },
    { class: 'crew', age: 'adult', sex: 'male', survived: 'yes' }
];

var predict = [
    { class: 'crew', age: 'adult', sex: 'female' },
    { class: '1st', age: 'adult', sex: 'male' }
];

var test = [
    { class: 'crew', age: 'adult', sex: 'male', survived: 'no' },
    { class: '2nd', age: 'adult', sex: 'male', survived: 'no' },
    { class: '2nd', age: 'adult', sex: 'female', survived: 'no' }
];

var features = ['class', 'age', 'sex'];

var target = ['class', 'age', 'sex'];

// get dataset
var dataset = dt.Dataset('titanic');

// Create tree and fit the model
var tree = new dt.Tree;
var nodes = tree.fit(train, features, target);

// Predict
clazz = tree.predict(predict);
console.log(clazz);

// Test
var error = tree.test(test, target);
console.log(error);
```

## dataset

There is a dataset with the titanic survival model

```js
var dt = require('node-decision-tree');

var dataset = dt.dataset('titanic');
```

then it is posible to access to the training data `dataset.train`, data to predict or test `dataset.predict`, features `dataset.features` and target `dataset.target`

