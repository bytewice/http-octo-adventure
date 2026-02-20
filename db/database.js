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
        }
        // não pode dar throw err pq se não existir o código tem continuar funcionando
        return null;
    } catch (err) {
        console.error("Erro ao acessar o TURSO///PASSWORD_FROM_USER///:", err.message);
        return null;
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
            return result.rows[0].count > 0;
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

async function checkSessionExists(token){
    const sql = "SELECT COUNT(*) AS count FROM sessoes WHERE token = ?";
    try {
        const result = await client.execute({
            sql,
            args: [token]
        });
        
        if(result.rows.length > 0){
            return result.rows[0].count > 0;
        }

        return false;
    } catch (err) {
        console.error("Erro ao acesar o TURSO///CHECK_SESSION_EXISTS///:", err.message);
        return false;
    }
}

//checar se a sessao existe e se não expirou (se expirou, deletar do banco de dados)
async function checkValidSession(usuario, token) {
    const sql = "SELECT expira_em FROM sessoes WHERE token = ? AND usuario_id = ?";
    try {
        const usuarioId = await findUserID(usuario);
        // result = data que vai expirar
        const result = await client.execute({ 
            sql,
            args: [token, usuarioId]
        });
        if (result.rows.length > 0) {
            const expiraEm = new Date(result.rows[0].expira_em);
            if (new Date() < expiraEm) {
                return true; // Sessão válida
            } else {
                // Sessão expirada, deletar do banco de dados
                await client.execute({
                    sql: "DELETE FROM sessoes WHERE token = ?",
                    args: [token]
                });
                return false; // Sessão expirada
            }
        } else {
            return false; // Token não encontrado
        }
    } catch (err) {
        console.error("Erro ao acesar o TURSO///CHECK_VALID_SESSION///:", err.message);
        return false;
    }
}

// gerar sessão pra usuário não autenticado
async function createSession(){

}

// Na tabela sessoes o usuario é reconhecido pelo seu userID
async function createUserSession(usuario, token) {
    
    // Define expiração para 12 horas (bom para admin)
    const usuarioId = await findUserID(usuario);
    
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

module.exports = {createUserSession, userExists, password_from_user};