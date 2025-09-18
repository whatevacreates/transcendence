class NeuralNetwork {
  constructor(modelData) {
    this.nodes = new Map();
    this.connections = [];
    this.inputIds = [-1, -2, -3];
    this.outputIds = [0, 1, 2];
    this.nodeValues = new Map();
    this.previousValues = new Map();

    // Create nodes
    modelData.nodes.forEach((node) => {
      this.nodes.set(node.id, {
        bias: node.bias,
        activation: node.activation,
        type: node.type,
        incoming: [],
      });
      this.nodeValues.set(node.id, 0);
    });

    // Create connections
    modelData.connections.forEach((conn) => {
      if (conn.enabled) {
        this.connections.push({
          in: conn.in,
          out: conn.out,
          weight: conn.weight,
        });

        if (this.nodes.has(conn.out)) {
          this.nodes.get(conn.out).incoming.push({
            from: conn.in,
            weight: conn.weight,
          });
        }
      }
    });

    // DEBUG: Network structure
    /*console.log("Neural Network Initialized");
    console.log("Input IDs:", this.inputIds);
    console.log("Output IDs:", this.outputIds);
    console.log("Nodes:", [...this.nodes.keys()]);
    console.log(
      "Connections:",
      this.connections.map((c) => `${c.in}->${c.out}`)
    );*/
  }

  reset() {
    this.nodeValues.forEach((_, id) => {
      this.nodeValues.set(id, 0);
    });
    this.previousValues.clear();
  }



  activate(inputs) {
    if (inputs.some(isNaN)) {
      console.error("Invalid inputs detected:", inputs);
      return this.outputIds.map(() => 0);
    }

    this.inputIds.forEach((id, index) => {
      this.nodeValues.set(id, inputs[index]);
    });

    // Save previous values for recurrent connections
    this.previousValues = new Map(this.nodeValues);

    // Process all nodes in numerical order
    const nodeIds = [...this.nodes.keys()].sort((a, b) => a - b);

    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      let sum = node.bias;

      // Process incoming connections
      for (const conn of node.incoming) {
        let value;

        if (this.previousValues.has(conn.from)) {
          value = this.previousValues.get(conn.from);
        } else if (this.nodeValues.has(conn.from)) {
          value = this.nodeValues.get(conn.from);
        } else {
          continue;
        }

        sum += value * conn.weight;
      }

      // Apply activation function
      const activatedValue = this.applyActivation(node.activation, sum);
      this.nodeValues.set(nodeId, activatedValue);
    }

    // Get output values
    return this.outputIds.map((id) => this.nodeValues.get(id));
  }

  applyActivation(activation, x) {
    switch (activation) {
      case "relu":
        return Math.max(0, x);
      case "sigmoid":
        return 1 / (1 + Math.exp(-x));
      case "tanh":
        return Math.tanh(x);
      default:
        return x;
    }
  }
}

export default class AIController {
  constructor(modelData) {
    this.network = new NeuralNetwork(modelData);
    this.frameCounter = 0;

    /// VARIABLES FOR INPUTS:

    this.trackPaddleY = 0.5;
    this.framesToImpact = 1000;
    this.ballVelocity = 0;
    this.ballDirection = 1;
    this.ballDirectionX = 0;
    this.ballDirectionY = 0;
    this.inputs = null;
    this.outputs = null;

    this.reset();
    //console.log("AIController initialized with model:", modelData);
  }

  reset() {
    this.network.reset();
    this.frameCounter = 0;
    //console.log("AI Controller Reset");
  }

  getDecision(currentState, frameCounter) {
    this.frameCounter = frameCounter;
    if (this.frameCounter % 60 === 0) {
      this.trackPaddleY = currentState.paddles[1].y - currentState.paddles[1].height / 2;
      [this.framesToImpact, this.impactY] = this.predictImpact(currentState.ball, false);
      this.ballDirectionY = currentState.ball.directionY;
      this.ballDirectionX = currentState.ball.directionX;
      this.ballVelocity = this.ballDirectionY * currentState.ball.speed

      if (this.ballDirectionX < 0)
        this.ballDirection = -1;
      else
        this.ballDirection = 1;
    }
    else {
      if (this.ballDirection > 0) {
        this.framesToImpact -= 1;
      }
      else if (this.ballDirection < 0) {
        this.framesToImpact += 1;
      }
      if (this.framesToImpact < 0) {
        this.framesToImpact = 1000;
      }
    }

    if (this.framesToImpact < 120) {
      this.inputs = [
        this.framesToImpact / 100,
        this.impactY - this.trackPaddleY,
        this.ballVelocity
      ]

      ///console.log("check the inputs: ", this.inputs);
      this.outputs = this.network.activate(this.inputs);
      const maxOutput = Math.max(...this.outputs);
      const decision = this.outputs.indexOf(maxOutput);
      return decision;
    }
    return 0;
  }

  predictImpact(ball, left) {
    let { x, y, radius, directionX, directionY, speed } = ball;

    let boundary;
    if (left) {
      boundary = radius;
    } else {
      boundary = 1 - radius;
    }

    let frames = 0;
    let maxFrames = 1000;

    while (frames < maxFrames) {

      x += speed * directionX;
      y += speed * directionY;
      frames += 1;

      if (y - radius <= 0) {
        y = radius + (radius - y);
        directionY = Math.abs(directionY);
      } else if (y + radius >= 1) {
        y = 1 - radius - (y - (1 - radius));
        directionY = -Math.abs(directionY);
      }

      if (left && x <= boundary) {
        return [frames, y];
      } else if (!left && x >= boundary) {
        return [frames, y];
      }
    }
    return [1000, 0.5]
  }
}
