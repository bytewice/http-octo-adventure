// controllers/authController.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // usando crypto so por enquanto q n coloquei o salt no database

function authenticate(req, res) {
    const { usuario, senha } = req.body;

    //Exemplo hardcoded enquanto ta sem database
    if (usuario === "brunao"){
        const hash = crypto.createHash('sha256').update(senha).digest('hex');
        if( hash === "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3" ){ // hash de "123"
            const senhaCriptografada = hash;
            res.set("Content-Type", "text/plain; charset=utf-8");
            return res.send(`✅ Login bem-sucedido! Bem-vindo ao /home.`);
        }
    }
    else{ //tem q ter else pra nao ter enumeração de usuário
        const dumb_hash = crypto.createHash('sha256').update("dumb_hash").digest('hex');
    }

    // Caso credenciais erradas
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.send("❌ Usuário ou senha incorretos");
}

module.exports = {
    authenticate
};
