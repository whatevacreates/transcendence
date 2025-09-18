import crypto from 'crypto';
import Uuid from "../../port/Uuid.js";

class UuidCrypto extends Uuid {
  generate() {
    return crypto.randomUUID();
  }
}

export default UuidCrypto;