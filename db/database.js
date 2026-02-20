// database.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // usando crypto so por enquanto q n coloquei o salt no database
const { createClient } = require('@libsql/client');

// tables = sessoes e usuarios
// Conexão com o Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function cadastrarAdmin() {
    const usuario = process.env.ADMIN_USER;
    const senhaPura = process.env.ADMIN_PASS; 
    const secret = process.env.ADMIN_SECRET;
    const role = 'admin';

    try {
        console.log("Gerando hash da senha...");
        const hash = crypto.createHash('sha256').update(senhaPura).digest('hex');
        console.log(`Conectando ao Turso em Virginia para cadastrar ${usuario}...`);
        
        const sql = `
            INSERT INTO usuarios (usuario, password, secret, role) 
            VALUES (?, ?, ?, ?)
        `;

        await client.execute({
            sql,
            args: [usuario, hash, secret, role]
        });

        console.log("✅ Usuário administrador cadastrado com sucesso no Turso!");
    } catch (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
            console.error("❌ Erro: Este usuário já existe no banco de dados.");
        } else {
            console.error("❌ Erro ao cadastrar admin:", err.message);
        }
    } finally {
        process.exit();
    }
}

async function userExists(usuario) {
    const sql = "SELECT COUNT(*) AS count FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        return result.rows[0].count > 0;
    } catch (err) {
        console.error("Erro ao verificar usuário:", err.message);
        throw err;
    }
}

async function password_from_user(usuario) {
    const sql = "SELECT password FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if (result.rows.length > 0) {
            return result.rows[0].password;
        } else {
            throw new Error("Usuário não encontrado");
        }
    } catch (err) {
        console.error("Erro ao obter password:", err.message);
        throw err;
    }
}

async function existeToken(token) {
    const sql = "SELECT COUNT(*) AS count FROM sessoes WHERE token = ?";
    try {
        const result = await client.execute({
            sql,
            args: [token]
        });
        return result.rows[0].count > 0;
    } catch (err) {
        console.error("Erro ao verificar token:", err.message);
        throw err;
    }
}

async function findUserID(usuario){
    const sql = "SELECT id FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if (result.rows.length > 0) {
            return result.rows[0].id;
        } else {
            throw new Error("Usuário não encontrado");
        }
    } catch (err) {
        console.error("Erro ao obter userID:", err.message);
        throw err;
    }
}

//checar se a sessao existe e se não expirou (se expirou, deletar do banco de dados)
async function checkSession(usuario, token) {
}


// Na tabela sessoes o usuario é reconhecido pelo seu userID
async function createSession(usuario, token) {
    // Define expiração para 12 horas (bom para admin)
    const expira = new Date();
    expira.setHours(expira.getHours() + 2);
    
    const usuarioId = await findUserID(usuario);
    const sql = "INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)";
    
    try {
        await client.execute({
            sql,
            args: [usuarioId, token, expira.toISOString()]
        });
        return token;
    } catch (err) {
        console.error("Erro ao gerar sessão:", err.message);
    }
}

// Exemplo de função para listar usuários (substituindo o db.all)
const listarUsuarios = async () => {
    try {
        const result = await client.execute("SELECT usuario FROM usuarios");
        // O Turso retorna os dados em result.rows
        console.log("--- Lista de Usuários no Turso ---");
        result.rows.forEach(row => {
            console.log(`- ${row.usuario}`);
        });
        return result.rows;
    } catch (err) {
        console.error("Erro ao acessar o Turso:", err.message);
        throw err;
    }
};

module.exports = {createSession, userExists, password_from_user};