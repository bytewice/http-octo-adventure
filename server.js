const express = require('express');
const app = express();
const handleRoutes = require('./routes/router');

const https = require('https'); // Importa o módulo HTTPS nativo
const fs = require('fs');       // Para ler os arquivos do certificado
const path = require('path');

require('dotenv').config();
const cookieParser = require('cookie-parser');

// Configurações do servidor
const hostname = '127.0.0.1';
const port = 3443;

// 1. Carregar as credenciais (certifique-se de que o caminho está correto)
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

app.use(express.json()); // Para suportar JSON no corpo das requisições (útil para o login)
app.use(express.urlencoded({ extended: true })); // Para suportar dados vindos de formulários HTML

app.use(express.static(path.join(__dirname, 'public','view')));

app.use(cookieParser());

// 3. Usando suas rotas
// Aqui o Express passa o controle para o arquivo que adaptamos antes
app.use('/', handleRoutes);

// 2. Em vez de app.listen, criamos o servidor HTTPS passando as opções e o app
https.createServer(options, app).listen(port, () => {
  console.log(`Servidor SEGURO rodando em https://${hostname}:${port}`);
});