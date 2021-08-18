const {books} = require('../books.json');
const {v4} = require('uuid');
const {Client} = require('pg');

const cargarLibros = () => {

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'avalith',
    password: '',
    port: 5432,
  });

  // conectar a la base de datos
  try {
    client.connect();
  } catch (error) {
    console.log('Error al conectar con Base de Datos', error);
  }

  books.forEach((book) => {
    const uid = v4();   
    const {name, author} = book;
    const text =
      'INSERT INTO books(book_name,isbn,author_id) VALUES($1, $2, $3) RETURNING *';
    const values = [name, uid, author];
    
    client.query(text, values, (err, res) => {
      if (err) {
        console.log('Error en cargar los libros');
        return;
      }  
    });
  });
}

exports.cargarLibros = cargarLibros;