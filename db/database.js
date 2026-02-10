const sqlite3 = require('sqlite3').verbose();
const path = require('path');

require('dotenv').config(); // carregar variaveis de ambiente
const dbPath = path.resolve(__dirname, 'data.db'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Banco de dados SQLite pronto.');
    }
});

// Criando a tabela com as colunas solicitadas
db.serialize(() => {
    // 1. Cria a tabela
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            sessid TEXT,
            secret TEXT,
            role TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela:', err.message);
        } 
        // adicionar o usuario admin não está funcionando, corrigir isso aqui depois
        else {
            console.log('Tabela "usuarios" verificada/criada com sucesso.');
            
            // 2. Tenta inserir o usuário padrão logo após garantir que a tabela existe
            // Usamos OR IGNORE para que, se o "brunao" já existir, ele simplesmente não faça nada
            const insertDefault = `
                INSERT OR IGNORE INTO usuarios (usuario, password, sessid, role, secret) 
                VALUES (?, ?, ?, ?, ?)
            `;

            const values = [
                process.env.ADMIN_USER,
                process.env.ADMIN_PASS,
                process.env.ADMIN_SESSID,
                process.env.ADMIN_ROLE,
                process.env.ADMIN_SECRET
            ];

            db.run(insertDefault, values, function(err) {
                if (err) {
                    console.error('Erro ao inserir usuário padrão:', err.message);
                } else if (this.changes > 0) {
                    const name = process.env.ADMIN_USER;
                    console.log(`Usuário padrão "${name}" criado com sucesso!`);
                } else {
                    const name = process.env.ADMIN_USER;
                    console.log(`Usuário padrão "${name}" já existe, pulando criação.`);
                }
            });
        }
    });
});

const listarTabelas = () => {
    const sql = `SELECT name FROM sqlite_master WHERE type='table'`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error('Erro ao listar tabelas:', err.message);
        }
        console.log('Tabelas no banco de dados:');
        rows.forEach((row) => {
            console.log(row.name);
        });
    });
}

const deletarTabelaUsuarios = () => {
    const sql = `DROP TABLE IF EXISTS usuarios`;
    
    db.run(sql, function(err) {
        if (err) {
            return console.error('Erro ao deletar tabela:', err.message);
        }
        console.log('Tabela "usuarios" deletada com sucesso!');
    });
}

const deletarUsuario = (usuario) => {
    const sql = `DELETE FROM usuarios WHERE usuario = ?`;
    
    db.run(sql, [usuario], function(err) {
        if (err) {
            return console.error('Erro ao deletar usuário:', err.message);
        }
        console.log(`Usuário ${usuario} deletado com sucesso!`);
    })
};

const cadastrarUsuario = (usuario, password, sessid, secret, role) => {
    const sql = `INSERT INTO usuarios (usuario, password, sessid, role, secret) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [usuario, password, sessid, secret, role], function(err) {
        if (err) {
            return console.error('Erro ao inserir usuário:', err.message);
        }
        console.log(`Usuário ${usuario} adicionado com sucesso! ID: ${this.lastID}`);
    });
};

const secret_from_user = (usuario, callback) => {
    const sql = `SELECT secret FROM usuarios WHERE usuario = ?`;
    
    db.get(sql, [usuario], (err, row) => {
        if (err) {
            console.error('Erro ao buscar secret:', err.message);
            return callback(err);
        }
        if (row) {
            callback(null, row.secret);
        } else {
            callback(new Error('Usuário não encontrado'));
        }
    });
}

module.exports = { db, cadastrarUsuario, listarTabelas,deletarTabelaUsuarios, deletarUsuario, secret_from_user };