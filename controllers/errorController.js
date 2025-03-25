const errorController = {};

// This function deliberately throws an error
errorController.generateError = (req, res, next) => {
  try {
    throw new Error("Intentional 500 Server Error!");
  } catch (error) {
    next(error); // Pass the error to middleware
  }
};

module.exports = errorController;
