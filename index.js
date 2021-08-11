const express = require('express');
const app = express();
const {Client} = require('pg');
const {v4} = require('uuid');
const {books} = require('./books.json');

app.use(express.json());

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

// primera vez se cargan los libros en DB
// books.forEach((book) => {
//   const uid = v4();
//   const {id, name, author} = book;
//   const text =
//     'INSERT INTO books(id,name,isbn,author) VALUES($1, $2, $3, $4) RETURNING *';
//   const values = [id, name, uid, author];
//   console.log(book, uid);
//   client.query(text, values, (err, res) => {
//     if (err) {
//       console.log(err.stack);
//       return;
//     }
//     console.log(res);
//     client.end();
//   });
// });

// listar todos los libros
app.get('/books', (req, res) => {
  const query = `SELECT * FROM books`;
  client
    .query(query)
    .then((resp) => {
      res.status(200).send(resp.rows);
    })
    .catch((error) =>
      res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      })
    );
});

// buscar un libro por ID
app.get('/books/:id', (req, res) => {
  const id = req.params.id;
  const text = `
  SELECT * FROM books
  WHERE id=${id}
  `;
  client
    .query(text)
    .then((resp) => {
      if (resp.rows.length === 0) {
        res.status(404).send('No se encontró el libro');
      } else {
        res.status(200).send(resp.rows);
      }
    })
    .catch((error) =>
      res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      })
    );
});

// crear nuevo libro
app.post('/books', (req, res) => {
  const {name, author} = req.body;

  if (name === '' || author === '') {
    res.status(400).send({
      ok: false,
      msg: 'Los campos name y author son requeridos',
    });
    return;
  }

  const query = `
  INSERT INTO books(name,isbn,author) VALUES($1, $2, $3) RETURNING *
  `;

  const uid = v4();
  const values = [name, uid, author];

  client.query(query, values, (err, response) => {
    if (err) {
      res.status(500).send({
        ok: false,
        msg: 'Error al crear libro',
      });
    }

    res.status(201).send({
      ok: true,
      msg: 'Libro creado',
      libro: response.rows[0],
    });
  });
});

// modificar los datos de un libro en particular
app.put('/books/:id', (req, res) => {
  const {name, author} = req.body;

  // validar datos
  if (name === '' || author === '') {
    res.status(400).send('Debe completar name y author');
    return;
  }

  const id = req.params.id;
  const query = `
  UPDATE books
  SET name = '${name}', author = '${author}'
  WHERE id=${id}
  `;

  client.query(query, (err, response) => {
    if (err) {
      res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      });
    }
    if (response.rowCount === 1) {
      res.status(200).send('El libro ha sido actualizado');
    } else {
      res.status(404).send('No existe libro con ese ID');
    }
  });
});

// eliminiar un libro
app.delete('/books/:id', (req, res) => {
  const {id} = req.params;
  const query = `
    DELETE FROM books
    WHERE id=${id}
    `;

  client.query(query, (err, response) => {
    if (err) {
      res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      });
    }

    if (response.rowCount === 1) {
      res.status(200).send('Libro eliminado');
    } else {
      res.status(404).send('No se encontró el libro');
    }
  });
});

app.listen(3000, console.log('listo'));
