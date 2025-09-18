class Paddle {
  // --- Dimensions ---
  #height;
  #width;

  // --- Speed ---
  #speed;

  // --- Coordinates, position ---
  #x;
  #position;

  constructor(config, x) {
    this.#height = config.height;
    this.#width = config.width;
    this.#speed = config.speed;
    this.#x = x;
    this.#position = config.position;
  }

  // --- Controls ---
  moveUp() {
    //console.log("Paddle: moveUp");
    if (this.#position - this.#speed < 0)
      this.#position = 0;
    else
      this.#position -= this.#speed;
    //console.log("Paddle:", this.#position);
  }

  moveDown() {
    //console.log("Paddle: moveDown");
    if (this.#position + this.#speed > 1)
      this.#position = 1;
    else
      this.#position += this.#speed;
    //console.log("Paddle:", this.#position);
  }

  stop() {
    //console.log("Paddle: stop");
  }

  // --- Getters ---
  // --- Dimensions ---
  get height() {
    return this.#height;
  }

  get width() {
    return this.#width;
  }

  // --- Coordinates ---
  get x() {
    return this.#x;
  }

  get y() {
    return (this.#height / 2) + this.#position * (1 - this.#height);
  }

  get speed()
  {
    return (this.#speed);
  }

  get position()
  {
    return this.#position;
  }

  top() {
    return this.y - this.#height / 2;
  }

  bottom() {
    return this.y + this.#height / 2;
  }
}

export default Paddle;