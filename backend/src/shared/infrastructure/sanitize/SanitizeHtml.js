import sanitizeHtml from "sanitize-html";
import Sanitizer from "../../port/Sanitizer.js";

class SanitizerHtml extends Sanitizer {
  sanitize(input) {
    try {
      return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
      });
    } catch (error) {
      throw new Error("Error sanitizing input");
    }
  }
}

const sanitizer = new SanitizerHtml();

export default sanitizer;

/*
import SanitizerHtml from "./infrastructure/SanitizerHtml.js";

const sanitizer = new SanitizerHtml();
const cleanMessage = sanitizer.sanitize(userInput);

*/