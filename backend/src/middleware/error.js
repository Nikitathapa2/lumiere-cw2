import { env } from '../config/env.js';

export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const preset = res.statusCode && res.statusCode !== 200 ? res.statusCode : null;
  let status = err.statusCode || preset || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  res.status(status).json({
    message,
  });
}
