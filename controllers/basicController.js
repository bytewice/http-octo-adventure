const path = require('path');
const viewPath = path.join(__dirname, '..', 'view');

const crypto = require('crypto'); // usando crypto so por enquanto q n coloquei o salt no database
const { client, teste, checkValidSession } = require('../db/database');

async function basicController(req,res){

    if(req.path === '/'){
        

        const token = req.cookies.sessionID;
        if(await checkValidSession(token)){
            return res.sendFile(path.join(viewPath, 'index.html'));
        }
        // Criar sessão e enviar cookie -> evitar csrf
        else{
            const usuario = null;
            const token = crypto.randomBytes(32).toString('hex');
            await createSession(token); // Salva a sessão no banco de dados
            res.cookie('sessionID', token, {
                httpOnly: true,  // Impede que o JavaScript (XSS) acesse o cookie
                secure: false,    // o proj vai ser em http <---- vulnerável!!
                sameSite: 'strict', // Proteção nativa contra ataques CSRF
                maxAge: 3600000  // Tempo de vida do cookie (em milissegundos)
            });        
            return res.redirect('/sobre');;
        }
    }
}

async function about(req,res){

    if(req.path === '/sobre'){
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send('Este é um servidor rodando com Express.js');
    }
}

function login(req,res){

    if(req.path === '/login'){  

        res.sendFile(path.join(viewPath, 'login.html'));
    }
}

module.exports = {
    basicController, about, login
};