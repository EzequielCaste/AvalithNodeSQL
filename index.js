const express = require('express');
const app = express();
const {Client} = require('pg');
const {v4} = require('uuid');
const booksRoute = require('./routes/booksRoute');
const authorsRoute = require('./routes/authorsRoute');
const {cargarLibros} = require('./src/cargarLibros');
const {cargarAutores} = require('./src/cargarAutores');

const {authors} = require('./authors.json');

// primera vez cargar libros y autores
// cargarAutores();
// cargarLibros();

app.use(express.json());

app.use('/books', booksRoute);
app.use('/authors', authorsRoute);

app.listen(3000, console.log('listo'));
