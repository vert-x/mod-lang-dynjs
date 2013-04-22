function adaptAsyncResultHandler(handler, resultConverter) {
  return function(fr) {
    if (fr.failed()) {
      handler(fr.cause(), null);
    } else {
      var result = fr.result();
      if (resultConverter) {
        result = resultConverter(fr.result());
      }
      handler(null, result);
    }
  }
}