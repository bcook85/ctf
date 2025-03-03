'use strict';

const MAPSIZES = {
  "small": MAPSMALL,
  "medium": MAPMEDIUM,
  "large": MAPLARGE
};

const BRAINDIMENSIONS = {
  "small": [12],
  "medium": [12, 12],
  "large": [12, 12, 12]
};

const MUTATIONRATES = {
  "small": 0.001,
  "medium": 0.01,
  "large": 0.1
};

const MUTATIONSCALES = {
  "small": 0.001,
  "medium": 0.01,
  "large": 0.1
};

const POINTS = {
  "hit": 0.5,
  "kill": 1,
  "capture": 200,
  "return": 10,
  "pickup": 50,
  "accuracy": 100,
  "exploration": 100
};