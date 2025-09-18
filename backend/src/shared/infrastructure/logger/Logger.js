class Logger {
    log(message) {
      console.log(message);
    }
    
    error(message, details = null) {
      console.error(message, details);
    }
  
    info(message) {
      console.log('INFO: ' + message);
    }
}

export default Logger;