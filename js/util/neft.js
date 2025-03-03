'use strict';

/*
  Neural Evolution with Fixed Topology
*/

class Neuron {
  constructor(size) {
    this.weights = [];
    for (let i = 0; i < size; i++) {
      this.weights.push((Math.random() * 2) - 1);
    }
    this.bias = (Math.random() * 2) - 1;
  };
  calculate(inputs) {
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return sum + this.bias;
  };
};

class Layer {
  constructor(neuronCount, weightCount) {
    this.neurons = [];
    for (let i = 0; i < neuronCount; i++) {
      this.neurons.push(new Neuron(weightCount));
    }
  };
  calculateRELU(inputs) {
    let output = [];
    for (let i = 0; i < this.neurons.length; i++) {
      output.push(Math.max(0, this.neurons[i].calculate(inputs)));
    }
    return output;
  };
  calculateSIG(inputs) {
    let output = [];
    for (let i = 0; i < this.neurons.length; i++) {
      output.push(1 / (1 + Math.exp(-this.neurons[i].calculate(inputs))));
    }
    return output;
  };
};

class Brain {
  constructor(dimensions) {
    this.dimensions = dimensions;
    this.layers = [];
    this.score = 0;
    this.fitness = 0;
    for (let i = 1; i < dimensions.length; i++) {
      this.layers.push(new Layer(dimensions[i], dimensions[i - 1]));
    }
  };
  process(inputs) {
    let outputs = [];
    for (let i = 0; i < inputs.length; i++) {
      outputs.push(inputs[i]);
    }
    for (let i = 0; i < this.layers.length - 1; i++) {
      outputs = this.layers[i].calculateRELU(outputs);
    }
    return this.layers[this.layers.length - 1].calculateSIG(outputs);
  };
  train() {};// eventually
};

class NEFT {
  constructor(populationSize, brainDimensions, mutationRate, mutationScale) {
    this.populationSize = populationSize;
    this.dimensions = brainDimensions;
    this.mutationRate = mutationRate;
    this.mutationScale = mutationScale;
    this.brains = [];
    this.generation = 0;
    this.bestScore = 0;
    this.bestId = 0;
    this.bestGeneration = 0;
    this.totalFitness = 0;
    for (let i = 0; i < this.populationSize; i++) {
      this.brains.push(new Brain(this.dimensions));
    }
  };
  addScore(id, points) {
    this.brains[id].score += points;
    if (this.brains[id].score > this.bestScore) {
      this.bestScore = this.brains[id].score;
      this.bestId = id;
      this.bestGeneration = this.generation;
    }
  };
  process(id, inputs) {
    return this.brains[id].process(inputs);
  };
  cull(percent) {
    this.brains.sort(function(a, b){ return b.score - a.score; });
    this.brains.length = Math.ceil(this.brains.length * (1 - percent));
  };
  calculateFitness() {
    this.totalFitness = 0;
    let sum = 0;
    let best = 0;
    for (let i = 0; i < this.brains.length; i++) {
      if (this.brains[i].score > best) {
        best = this.brains[i].score;
      }
      sum += this.brains[i].score;
    }
    this.totalFitness = sum;
    for (let i = 0; i < this.brains.length; i++) {
      this.brains[i].fitness = this.brains[i].score / sum;
    }
    console.log(
      "Generation:", this.generation
      ,"Total Fitness:", Math.round(sum)
      ,"Best Score:", Math.round(best)
    );
  };
  nextGeneration() {
    this.calculateFitness();
    let newBrains = [];
    for (let i = 0; i < this.populationSize; i++) {
      newBrains.push(this.mate(
        this.brains[this.pickOne()]
        ,this.brains[this.pickOne()]
      ));
    }
    this.brains = newBrains;
    this.generation += 1;
  };
  pickOne() {
    let r = Math.random();
    let index = 0;
    while (r > 0) {
      r -= this.brains[index].fitness;
      index += 1;
    }
    return index - 1;
  };
  mate(brain1, brain2) {
    let newBrain = new Brain(this.dimensions);
    for (let i = 0; i < newBrain.layers.length; i++) {
      for (let j = 0; j < newBrain.layers[i].neurons.length; j++) {
        for (let k = 0; k < newBrain.layers[i].neurons[j].weights.length; k++) {
          // Pick a parent to inherit weight from
          if (Math.random() < 0.5) {
            newBrain.layers[i].neurons[j].weights[k] = brain1.layers[i].neurons[j].weights[k];
          } else {
            newBrain.layers[i].neurons[j].weights[k] = brain2.layers[i].neurons[j].weights[k];
          }
          // Mutate Weight
          newBrain.layers[i].neurons[j].weights[k] = this.mutateValue(newBrain.layers[i].neurons[j].weights[k]);
        }
        // Pick a parent to inherit Bias from
        if (Math.random() < 0.5) {
          newBrain.layers[i].neurons[j].bias = brain1.layers[i].neurons[j].bias;
        } else {
          newBrain.layers[i].neurons[j].bias = brain2.layers[i].neurons[j].bias;
        }
        // Mutate Bias
        newBrain.layers[i].neurons[j].bias = this.mutateValue(newBrain.layers[i].neurons[j].bias);
      }
    }
    return newBrain;
  };
  mutateValue(value) {
    if (Math.random() < this.mutationRate * 0.001) {
      return (Math.random() * 2) - 1;
    }
    if (Math.random() < this.mutationRate) {
      let amount = (Math.random() * this.mutationScale) * (Math.random() < 0.5 ? 1 : -1);
      let mutatedValue = value + amount;
      if (mutatedValue > 1) {
        mutatedValue -= 2;
      } else if (mutatedValue < -1) {
        mutatedValue += 2;
      }
      return Math.max(-1, Math.min(1, mutatedValue))
    }
    return value;
  };
  save() {
    let savedBrains = [];
    for (let i = 0; i < this.brains.length; i++) {
      let layers = [];
      for (let j = 0; j < this.brains[i].layers.length; j++) {
        let layer = [];
        for (let k = 0; k < this.brains[i].layers[j].neurons.length; k++) {
          let weights = [];
          for (let l = 0; l < this.brains[i].layers[j].neurons[k].weights.length; l++) {
            weights.push(this.brains[i].layers[j].neurons[k].weights[l]);
          }
          layer.push([weights, this.brains[i].layers[j].neurons[k].bias]);
        }
        layers.push(layer);
      }
      savedBrains.push(layers);
    }
    return {
      "dimensions": this.dimensions,
      "populationSize": this.populationSize,
      "mutationRate": this.mutationRate,
      "mutationScale": this.mutationScale,
      "generation": this.generation,
      "brains": savedBrains
    };
  };
  load(neftData) {
    this.dimensions = neftData.dimensions;
    this.populationSize = neftData.populationSize;
    this.mutationRate = neftData.mutationRate;
    this.mutationScale = neftData.mutationScale;
    this.generation = neftData.generation;
    this.brains = [];
    for (let i = 0; i < neftData.brains.length; i++) {//brains
      let newBrain = new Brain(this.dimensions);
      for (let j = 0; j < neftData.brains[i].length; j++) {//layers
        for (let k = 0; k < neftData.brains[i][j].length; k++) {//neurons
          for (let l = 0; l < neftData.brains[i][j][k][0].length; l++) {//weights
            newBrain.layers[j].neurons[k].weights[l] = neftData.brains[i][j][k][0][l];
          }
          newBrain.layers[j].neurons[k].bias = neftData.brains[i][j][k][1];//bias
        }
      }
      this.brains.push(newBrain);
    }
  };
};