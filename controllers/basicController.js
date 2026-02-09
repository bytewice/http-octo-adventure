function basicController(req,res){

    if(req.path === '/'){
        res.sendFile(path.join(viewPath, 'index.html'));
    }
}

function about(req,res){

    if(req.path === '/sobre'){
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send('Este é um servidor rodando com Express.js');
    }
}

function login(req,res){
    
    if(req.path === '/login'){  
        res.sendFile(path.join(viewPath, 'login.html'));
    }
}

module.exports = {
    basicController, about, login
};