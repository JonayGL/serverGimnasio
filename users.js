var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var bp = require('body-parser');
var app = express();
var secret = '123456'


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


exports.getUser = function (pet, res) {
    var id = pet.params.id
    knex('users').where('nick', id).first().then(function (query) {
        res.status(200).send(query)
    }).catch((error) => {
        res.status(404).send({ userMessage: "Usuario no existente", devMessage: "" })
    });

}

exports.deleteUser = function (req, res) {
    var id = req.params.id

    if (!isNaN(id)) {
        res.status(401).send({ userMessage: "Las id del usuario no tiene que ser numerica", devMessage: "" })
    } else {
        knex('users')
            .where('nick', id)
            .del()
            .then(function (count) {
                //console.log(count)
                res.sendStatus(204)
            }).catch(function (err) {
                //console.log("Error al borrar")
                res.status(404).send({ userMessage: "Usuario no existente", devMessage: "" })
            });
    }
}
exports.userstodos = function (pet, res) {
    knex('users').select().from('users').then(function (query) {
        res.status(200).send({
            "usuarios": query
        })
    }).catch((error) => {
        res.status(404).send({ userMessage: "Usuario no existente", devMessage: "" })
    });
}
exports.existsUser = function (nick, callback) {
    knex('users').count('nick as c').where('nick', nick).then(function (total) {
        if (total[0].c == 1) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

function existe(nick, callback) {
    knex('users').count('nick as c').where('nick', nick).then(function (total) {
        if (total[0].c == 1) {
            callback(true)
        } else {
            callback(false)
        }
    })
}
exports.createUser = function (req, res) {
    var nick = req.body.nick;
    var pass = req.body.pass;
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var edad = req.body.edad;
    var altura = req.body.altura;
    var peso = req.body.peso;

    existe(nick, function (exists) {
        //console.log(exists)
        if (!exists) {
            var data = {
                nick: nick,
                pass: pass,
                nombre: nombre,
                apellidos: apellidos,
                edad: edad,
                altura: altura,
                peso: peso
            }
            knex('users').insert([
                {
                    nick: data.nick,
                    pass: data.pass,
                    nombre: data.nombre,
                    apellidos: data.apellidos,
                    edad: data.edad,
                    altura: data.altura,
                    peso: data.peso
                }
            ]).then(function (f) {
                knex('users').where('nick', data.nick).first().then(function (query) {
                    res.setHeader('Location', '/users/' + query.users_id);
                    res.sendStatus(201);
                })
            })
        } else {
            res.status(401).send({ userMessage: "Usuario existente, prueba con otro nick", devMessage: "" })
        }
    })
}

exports.updateUser = function (req, res) {
    var id = req.params.id

    var nick = req.body.nick;
    var pass = req.body.pass;
    var nombre = req.body.nombre;
    var apellidos = req.body.apellidos;
    var edad = req.body.edad;
    var altura = req.body.altura;
    var peso = req.body.peso;

    if (!isNaN(id)) {
        res.status(401).send({ userMessage: "Las id del usuario no tiene que ser numerica", devMessage: "" })
    } else {

        var data = {
            nick: nick,
            pass: pass,
            nombre: nombre,
            apellidos: apellidos,
            edad: edad,
            altura: altura,
            peso: peso
        }

        knex('users')
            .where('nick', id)
            .update({
                nick: data.nick,
                pass: data.pass,
                nombre: data.nombre,
                apellidos: data.apellidos,
                edad: data.edad,
                altura: data.altura,
                peso: peso
                

            })
            .then(function (count) {
                //console.log(count)
                res.status(204).send({ userMessage: "Actualizado" })
            }).catch(function (err) {
                //console.log("Error el usuario no existe")
                res.status(404).send({ userMessage: "Usuario no existente", devMessage: "" })
            });
    }

}

exports.correctLog = function (nick, pass, callback) {
    knex('users').count('nick as c').where('nick', nick).where('pass', pass)
        .then(function (total) {
            if (total[0].c == 1) {
                callback(true)
            } else {
                callback(false)
            }
        })
}

function correcto(data, callback) {
    knex('users').count('nick as c').where('nick', data.nick).where('pass',data.pass).then(function (total) {
        if (total[0].c == 1) {
            callback(true)
        } else {
            callback(false)
        }
    })
}

exports.login = function (pet, res) {

    console.log(pet.body)
    var data = pet.body
    correcto(data, function (exists) {
        if (exists) {
            knex('users').where('nick', data.nick).first().then(function (query) {
                res.status(200).send({usuario: query})
            }).catch((error) => {
                console.log("Hola")
    
                res.status(404).send({ userMessage: "Usuario no existente", devMessage: "" })
            });
        } else {
            console.log("Adios")
    
            res.status(401).send({
                userMessage: "El usuario no existe", devMessage: "",
                _links: {
                    register: "localhost:3000/register"
                }
            });
        }
    })

}

