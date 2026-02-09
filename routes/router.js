const express = require('express');
const router = express.Router();
const path = require('path');

const authController = require("../controllers/authController");
const basicController = require("../controllers/basicController");
const viewPath = path.join(__dirname, '..', 'view');

// Rota Raiz (index)
router.get('/', basicController.basicController);

// Rota de Login
router.get('/login', basicController.basicController);

// Rota Sobre (Texto simples)
router.get('/sobre', basicController.basicController);

// Rota Home (agora com autenticação)
router.post("/home", authController.authenticate);


module.exports = router;