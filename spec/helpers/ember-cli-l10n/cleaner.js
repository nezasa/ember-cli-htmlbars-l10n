afterEach(function() {
  if (builder) {
    return builder.cleanup();
  }
});