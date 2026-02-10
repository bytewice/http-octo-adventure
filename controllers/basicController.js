const path = require('path');
const viewPath = path.join(__dirname, '..', 'view');

const { cadastrarUsuario, listarTabelas, deletarTabelaUsuarios, secret_from_user } = require('../db/database.js');

function basicController(req,res){

    if(req.path === '/'){
        res.sendFile(path.join(viewPath, 'index.html'));
    }
}

function about(req,res){

    /*
    !!!!!!!!!!!!!!!!TESTE FUNÇÕES DATABASE!!!!!!!!!!!!!
    listarTabelas();
    deletarTabelaUsuarios();
    listarTabelas();
    cadastrarUsuario("brunao", "123", "sessid_example", "admin", "secret_example");
    cadastrarUsuario("dumb_user", "456", "sessid_example2", "user", "secret_example2");
    cadastrarUsuario("another_user", "789", "sessid_example3", "user", "secret_example3");

    secret_from_user("brunao", (err, secret) => {
        if (err) {
            console.error('Erro ao obter secret:', err.message);
        } else {
            console.log(`Secret do usuário "brunao": ${secret}`);
        }
    });
    */
    if(req.path === '/sobre'){
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send('Este é um servidor rodando com Express.js {secret do brunao:}');
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