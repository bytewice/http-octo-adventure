const express = require('express');
const router = express.Router();

const authController = require("../controllers/authController");
const basicController = require("../controllers/basicController");
const middleware = require("../middleware/middleware");

// Rota Raiz (index)
router.get('/', basicController.basicController);

// Rota de Login
router.get('/login', basicController.login);

// Rota Sobre (Texto simples)
router.get('/sobre', basicController.about);

// Rota Home (agora com autenticação)
router.post("/login", authController.authenticate); // Usando a função que autentica com o banco de dados
router.get("/home", middleware.authUser, authController.userHome);

module.exports = router;


// LEMBRAR QUE EU COLOQUEI UTILIZANDO O MIDDLEWARE MAS ISSO NAO VAI ESTAR FUNCIONANDO JÁ QUE NAO TO CONSEGUINDO PASSAR UM COOKIE NO COMEÇO DA NAVEGAÇÃO!!!!!!!!!!!!