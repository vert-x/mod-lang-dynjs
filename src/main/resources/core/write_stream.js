writeStream = function(jsObj, jObj) {
  jsObj.write = function(data) {
    jObj.write(data);
    return jsObj;
  }
  jsObj.writeQueueMaxSize = function(size) {
    jObj.setWriteQueueMaxSize(size);
    return jsObj;
  }
  jsObj.writeQueueFull = function() {
    return jObj.writeQueueFull();
  }
  jsObj.drainHandler = function(handler) {
    jObj.drainHandler(handler);
    return jsObj;
  }
  jsObj.exceptionHandler = function(handler) {
    jObj.exceptionHandler(handler);
    return jsObj;
  }
}
