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

async function userExists(usuario) {
    const sql = "SELECT COUNT(*) AS count FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if(result.rows.length === 0) return false; // Se não houver resultados, o usuário não existe
        else return true; // Se houver pelo menos um resultado, o usuário existe
    } catch (err) {
        console.error("Erro ao verificar usuário:", err.message);
        return false;
    }
}

async function getPassword(usuario) {
    const sql = "SELECT password FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if (result.rows.length > 0) {
            return result.rows[0].password;
        }
        // não pode dar throw err pq se não existir o código tem continuar funcionando
        return null;
    } catch (err) {
        console.error("Erro ao acessar o TURSO///PASSWORD_FROM_USER///:", err.message);
        return null;
    }
}

async function sessionExists(user_id){
    const sql = "SELECT COUNT(*) AS count FROM sessoes WHERE usuario_id = ?";
    try {
        const result = await client.execute({
            sql,
            args: [user_id]
        });
        if(result.rows.length > 0){
            return true;
        }   
        else
            return false;
    } catch (err) {
        console.error("Erro ao acessar o TURSO///SESSION_EXISTS///:", err.message);
        return false;
    }   
}

async function tokenExists(token) {
    const sql = "SELECT COUNT(*) AS count FROM sessoes WHERE token = ?";
    try {
        const result = await client.execute({
            sql,
            args: [token]
        });
        if(result.rows.length > 0){
            return true; // Se o token for encontrado, retorna true
        }
        return false;
    } catch (err) {
        console.error("Erro ao verificar token:", err.message);
        return false;
    }
}

async function findUserID(usuario){
    const sql = "SELECT id FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if (result.rows.length > 0) 
            return result.rows[0].id;
        else 
            return false;

    } catch (err) {
        console.error("Erro ao acesar o TURSO///FIND_USER_ID///:", err.message);
        return false;
    }
}


async function expiredSession(token) {
    // O SQL já nos diz se expirou (1 para sim, 0 para não)
    const sql = "SELECT (expira_em <= DATETIME('now')) AS expirou FROM sessoes WHERE token = ?";

    try {
        const result = await client.execute({
            sql,
            args: [token]
        });

        if (result.rows.length === 0) return true; // Token não existe = expirado/inválido

        // No Turso, booleanos são 1 ou 0
        return result.rows[0].expirou === 1;

    } catch (err) {
        console.error("Erro ao verificar expiração:", err.message);
        return true; // Falha segura: na dúvida, desloga
    }
}

//checar se a sessao existe e se não expirou (se expirou, deletar do banco de dados)
async function checkValidSession(token) {
    if (await tokenExists(token)) {
        if (await expiredSession(token)) {
            const sql = "DELETE FROM sessoes WHERE token = ?";
            try {
                await client.execute({
                    sql,
                    args: [token]
                });
                console.log("Sessão expirada deletada com sucesso.");
            } catch (err) {
                console.error("Erro ao deletar sessão expirada:", err.message);
            }
            return false; // Sessão inválida (expirada)
        }
        return true; // Sessão válida
    }
    return false; // Token não encontrado, sessão inválida
}

// gerar sessão pra usuário não autenticado
async function createSession(token){
    
    const expira = new Date();
    expira.setHours(expira.getHours() + 2); // Expira em 2 horas

    const sql = "INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)";
    
    try {
        await client.execute({
            sql,
            args: [null, token, expira.toISOString()]
        });
        return token;
    } catch (err) {
        console.error("Erro ao gerar sessão para usuário não autenticado:", err.message);
        return null;
    }
}

// Na tabela sessoes o usuario é reconhecido pelo seu userID
async function createUserSession(usuario, token) {
    
    // Define expiração para 12 horas (bom para admin)
    const usuarioId = await findUserID(usuario);
    
    if(await sessionExists(usuarioId)){
        // se já existir uma sessão pra esse usuário, deleta a sessão antiga e cria uma nova
        await client.execute({
            sql: "DELETE FROM sessoes WHERE usuario_id = ?",
            args: [usuarioId]
        });
    }

    const expira = new Date();
    expira.setHours(expira.getHours() + 2);
    
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

async function getUserRoleFromUser(usuario){
    const sql = "SELECT role FROM usuarios WHERE usuario = ?";
    try {
        const result = await client.execute({
            sql,
            args: [usuario]
        });
        if (result.rows.length > 0) {
            return result.rows[0].role;
        }
        return null;
    } catch (err) {
        console.error("Erro ao obter role do usuário:", err.message);
        return null;
    }
}

async function getUserRoleFromSession(token) {
    const sql = "SELECT u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?";
    try {
        const result = await client.execute({
            sql,
            args: [token]
        });
        if (result.rows.length > 0) {
            return result.rows[0].role;
        }
        return null;
    } catch (err) {
        console.error("Erro ao obter role do usuário:", err.message);
        return null;
    }
}

module.exports = {createUserSession, userExists, getPassword, checkValidSession, createSession, getUserRoleFromSession, getUserRoleFromUser};