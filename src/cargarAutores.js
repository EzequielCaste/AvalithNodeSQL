const {authors} = require('../authors.json');
const {Client} = require('pg');

const cargarAutores = () => {  

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

  authors.forEach( author => {  

    const {name,country} = author;

    const text = `
    insert into authors(name, country)
    values ($1, $2)
    RETURNING *;
    `;
    
    const values = [name, country];
    
    client.query(text, values, (err, resp) => {
      if (err) {
        console.log('Error en cargar los libros');
        return;
      }     
    });
    
  });
}

exports.cargarAutores = cargarAutores;