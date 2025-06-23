export async function checkTermsAccepted(req, res, next) {
  const user = req.user;

  const activeTerm = await Mongo.db.collection('terms').findOne({ active: true });

  if (!activeTerm) return next(); // Sem termos ativos, não força.

  if (
    !user.acceptedTerms ||
    user.acceptedTerms.version !== activeTerm.version
  ) {
    return res.status(403).send({
      success: false,
      message: 'Você precisa aceitar os termos de uso atuais.',
      currentTerms: activeTerm
    });
  }

  next();
}
