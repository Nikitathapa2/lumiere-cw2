export function requireStepUp(windowMinutes = 15) {
  return (req, res, next) => {
    const session = req.session;
    if (!session) return next();

    const { stepUpAt } = session;
    if (!stepUpAt) {
      return res.status(403).json({
        code: 'STEP_UP_REQUIRED',
        message: 'Re-authentication required for this action.',
      });
    }

    const elapsedMs = Date.now() - new Date(stepUpAt).getTime();
    if (elapsedMs > windowMinutes * 60 * 1000) {
      return res.status(403).json({
        code: 'STEP_UP_REQUIRED',
        message: 'Re-authentication window expired. Please verify again.',
      });
    }

    next();
  };
}
