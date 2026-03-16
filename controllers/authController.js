// controllers/authController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // usando crypto so por enquanto q n coloquei o salt no database
const cookieParser = require('cookie-parser');

const {checkValidSession, createUserSession, userExists, getPassword, getUserRoleFromSession} = require('../db/database');
//const { get } = require('http');

async function userHome(req, res) {

    const token = req.cookies.sessionID;
    
    const tokendb = await checkValidSession(token);
    console.log("Token recebido:", tokendb);
    
    //BRUNAO if tokens exists and its valid in database then sends /home
    if(tokendb){
        const test =  await getUserRoleFromSession(token);
        console.log("Role do usuário:", test);
        res.status(200);
        res.set("Content-Type", "text/plain; charset=utf-8");
        return res.send(`✅ Login bem-sucedido! Bem-vindo ao /home)`);
    }
    // if atacker tries to access without a non-existent token, it will be redirected to /login
    else{
        res.status(401);
        res.set("Content-Type", "text/plain; charset=utf-8");

        return res.send("Deixa de invenção amigão :)");  
    }
}


async function authenticate(req, res) {
    const { usuario, senha } = req.body;

    const existe = await userExists(usuario);
    
    if (existe){
        const hash = crypto.createHash('sha256').update(senha).digest('hex');
        const password = await getPassword(usuario);
        if( hash === password ){
                // Criar sessão e enviar *novo* cookie -> evitar session fixation
                const token = crypto.randomBytes(32).toString('hex');
                // VULN armazenando token hardcoded no banco
                // tem q hashear o token antes de salvar no banco pra evitar sess. hijacking
                await createUserSession(usuario, token); // Salva a sessão no banco de dados
                res.cookie('sessionID', token, {
                  httpOnly: true,  
                  secure: true, // <- all comms are going to be over HTTPS
                  sameSite: 'strict', 
                  maxAge: 3600000  // Tempo de vida do cookie (em milissegundos)
                });
            return res.redirect('/home');
        }
    }
    else{ //tem q ter else pra evitar ->> user enumeration
        const dumb_hash = crypto.createHash('sha256').update("dumb_hash").digest('hex');
    }

    // Caso credenciais erradas
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.redirect('/login');
}

module.exports = {
    authenticate, userHome
};
