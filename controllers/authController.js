// controllers/authController.js

function authenticate(req, res) {
    const { usuario, senha } = req.body;

    // Exemplo hardcoded enquanto tá sem database
    if (usuario === "brunao" && senha === "123") {
        res.set("Content-Type", "text/plain; charset=utf-8");
        return res.send("✅ Login bem-sucedido! Bem-vindo ao /home");
    }
    // lembrar de colocar o else pra nao ter enumeração de usuários quando tiver database

    // Caso credenciais erradas
    res.status(401);
    res.set("Content-Type", "text/plain; charset=utf-8");
    return res.send("❌ Usuário ou senha incorretos");
}

module.exports = {
    authenticate
};
