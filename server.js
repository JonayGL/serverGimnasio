const express = require('express')
const app = express()
const port = 3000
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var bp = require('body-parser');
var cors = require('cors');
app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({
    extended: true
}));


var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: "./mydb.db"
    },
    useNullAsDefault: true
});
var users = require('./users.js')



app.post('/login',users.login);
app.post('/registro',users.createUser);
app.get('/users',users.userstodos);
app.put('/users/:id',users.updateUser);
app.delete('/users/:id',users.deleteUser);



app.listen(process.env.PORT || 3000, function ()  {
 
  //console.log(`server is listening on ${port}`)


  
  knex.schema.createTableIfNotExists('users', function (table) {
    table.string('nick');
    table.integer('pass');
    table.string('nombre');
    table.string('apellidos');
    table.string('edad');
    table.string('altura');
    table.string('peso');
    table.primary('nick');
}).then(function () {
   // console.log('Users Table is Created!');  
});
})