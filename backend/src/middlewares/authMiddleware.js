import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).send({
      success: false,
      statusCode: 401,
      body: { message: 'Token não fornecido' }
    });

  jwt.verify(token, 'secret', (err, user) => {
    if (err)
      return res.status(403).send({
        success: false,
        statusCode: 403,
        body: { message: 'Token inválido' }
      });

    req.user = user; // dados do token ficam disponíveis para a rota
    next();
  });
}