export function isAdmin(req, res, next) {
  // Supondo que você tenha o usuário já no req.user via autenticação JWT
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).send({
    success: false,
    statusCode: 403,
    body: { message: 'Acesso negado. Apenas admin pode realizar esta ação.' }
  });
}
