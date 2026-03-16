const path = require('path');
const viewPath = path.join(__dirname,'..','public','view');

const crypto = require('crypto'); // usando crypto so por enquanto q n coloquei o salt no database

async function basicController(req,res){

    if(req.path === '/'){
       return res.sendFile(path.join(viewPath,'index.html'));
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

    if(req.path === '/Alogin'){
        res.sendFile(path.join(viewPath, 'login-adm.html'));
    }
}

module.exports = {
    basicController, about, login
};