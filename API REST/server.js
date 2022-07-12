const express = require('express');
const app = express()
const data = require("./data.json")

// Verbos HTTP:
// POST : Recebe dados de um resource.
// GET : Envia dados ou informações para serem processados por um resource.
// PUT : Atualiza dados de um resource.
// DELETE : Deleta um resource.

//Usando verbos no express:
// app.get("/clients") --> \clients é o endpoint --> \clients:id pegando um único client
// app.post("/clients") --> \clients é o endpoint
// app.put("/clients") --> \clients é o endpoint
// app.delete("/clients") --> \clients é o endpoint


app.use(express.json());
app.get("/clients", function (req, res){
    res.json(data);
});
app.get("/clients/:id", function (req, res){
    const { id }= req.params;
    const client = data.find(cli => cli.id == id);
    
    res.json(client);

});

app.listen(3000, function (){
    console.log("Server is running");
});