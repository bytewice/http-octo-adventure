const express = require('express');
const path = require('path');
const handleRoutes = require('./routes/router'); // Seu router refatorado

const app = express();

// Configurações do servidor
const hostname = '127.0.0.1';
const port = 3000;

// 1. Middlewares Essenciais
app.use(express.json()); // Para suportar JSON no corpo das requisições (útil para o login)
app.use(express.urlencoded({ extended: true })); // Para suportar dados vindos de formulários HTML

// 2. Arquivos Estáticos
// Se suas imagens/css/js estiverem na pasta 'view', o Express serve eles automaticamente
app.use(express.static(path.join(__dirname, 'view')));

// 3. Usando suas rotas
// Aqui o Express passa o controle para o arquivo que adaptamos antes
app.use('/', handleRoutes);

// 4. Iniciando o servidor
app.listen(port, hostname, () => {
  console.log(`Servidor rodando em http://${hostname}:${port}/`);
});