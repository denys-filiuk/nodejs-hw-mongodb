import createHttpError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  const error = createHttpError(
    err.status || 500,
    err.message || 'Something went wrong',
  );

  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    data: err.message,
  });
};
