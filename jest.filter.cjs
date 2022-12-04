module.exports = (testPaths) => {
  const allowedPaths = testPaths
    .filter((test) => !test.includes(".perf.test"))
    .map((test) => ({ test }));

  return {
    filtered: allowedPaths,
  };
};
