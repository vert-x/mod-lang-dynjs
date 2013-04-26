readStream = function(jsObj, jObj) {
  jsObj.dataHandler = function(handler) {
    jObj.dataHandler(handler);
    return jsObj;
  }
  jsObj.pause = function() {
    jObj.pause();
    return jsObj;
  }
  jsObj.resume = function() {
    jObj.resume();
    return jsObj;
  }
  jsObj.endHandler = function(handler) {
    jObj.endHandler(handler);
    return jsObj;
  }
  jsObj.exceptionHandler = function(handler) {
    jObj.exceptionHandler(handler);
    return jsObj;
  }
}

