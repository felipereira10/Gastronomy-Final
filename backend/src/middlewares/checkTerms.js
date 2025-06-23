import { Mongo } from '../database/mongo.js';

export async function checkTermsAccepted(req, res, next) {
    const user = req.user;

    const activeTerm = await Mongo.db.collection('terms').findOne({ active: true });

    if (!activeTerm) return next(); // Se não há termos ativos, libera acesso.

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
