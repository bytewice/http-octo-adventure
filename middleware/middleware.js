const cookieParser = require('cookie-parser');
const {checkValidSession, getUserRoleFromSession } = require('../db/database');


// na tabela de sessoes nao tem a role
// o que conecta a tabela de sessoes com a de usuarios é o usuario_id

// if user_id = null then is not an authenticated user, so it will only be able to access a few pages
// if user_id != null then is an authenticated user, so it will be necessary to identify the role of the user
// if user_id.role = admin then admin pages
// if user_id.role = user then user pages

// middleware para verificar se o usuário tem uma sessão válida
async function authAdmin(req, res, next) {
    const token = req.cookies.sessionID;
    
    if (token) {
        const validSession = await checkValidSession(token);
        if (validSession) {
            const role = await getUserRoleFromSession(token);
            if(role === 'admin') {
                return next(); // Permite o acesso à rota protegida para admins
            }
        }
    }
    
    // Se não houver um token válido, redireciona para a página de login
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.redirect('/login');
}

async function authUser(req, res, next) {
        const token = req.cookies.sessionID;
    
    if (token) {
        const validSession = await checkValidSession(token);
        if (validSession) {
            const role = await getUserRoleFromSession(token);
            if(role === 'user' || role === 'admin' ) {
                return next(); // Permite o acesso à rota protegida para admins
            }
        }
    }
    
    // Se não houver um token válido, redireciona para a página de login
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.redirect('/login');
}

async function authAnonymous(req, res, next) {
        const token = req.cookies.sessionID;
    
    if (token) {
        const validSession = await checkValidSession(token);
        if (validSession) {
            return next(); // Permite o acesso à rota protegida para admins
            
        }
    }
    
    // Se não houver um token válido, redireciona para a página de login
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.redirect('/login');
}

module.exports = {
    authAdmin, authUser, authAnonymous
};  
