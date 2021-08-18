const router = require('express').Router();
const {Client} = require('pg');
const {v4} = require('uuid');

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

// Listar todos los libros
router.get('/', (req, res,next) => {
  
  const query = `
  SELECT books.book_id, books.isbn, books.book_name, authors.author_id, authors.name as author_name, authors.country as nationality FROM books INNER JOIN authors ON books.author_id = authors.author_id
  `;

  client
    .query(query)
    .then((resp) => {      
      const books = resp.rows.map(book => ({
        Book_ID: book.book_id,
        Book_NAME: book.book_name,
        isbn: book.isbn,
        Author: {
          Author_ID: book.author_id,
          Author_NAME: book.author_name,
          Author_NATIONALITY: book.nationality,
        }
      }));
      res.status(200).send(books);
      next();
    })
    .catch((error) =>
      res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      })
    );
});

// buscar un libro por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;

  const query = `
  SELECT books.book_id, books.book_name, books.isbn, authors.name as author, authors.country as nationality, authors.author_id FROM books INNER JOIN authors ON books.author_id = authors.author_id where books.book_id = $1
  `;

  client
    .query(query, [id])
    .then((resp) => {
      if (resp.rows.length === 0) {
        res.status(404).send('No se encontró el libro');
      } else {
        const books = resp.rows.map(book => ({
          Book_ID: book.book_id,
          Book_NAME: book.book_name,
          isbn: book.isbn,
          Author: {
            Author_ID: book.author_id,
            Author_NAME: book.author,
            Author_NATIONALITY: book.nationality,
          }
        }));
        res.status(200).send(books);
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
router.post('/', (req, res) => {
  const {name, author_ID} = req.body;

  if (name === '' || author_ID === '') {
    return res.status(400).send({
      ok: false,
      msg: 'Los campos name y author son requeridos',
    });
    
  }

  // validar que el autor exista
  let query = `
  SELECT authors.author_id from authors WHERE author_id = $1
  `;

  client.query(query, [author_ID], (err, resp) => {
    if (err) {
      return res.status(400).send(err);
    }

    if (resp.rowCount === 0) {
      return res.status(404).send({
        ok: false,
        msg: `Autor con id ${author_ID} no existe`
      });         
    }

  });

  query = `
  INSERT INTO books(book_name,isbn,author_id) VALUES($1, $2, $3) RETURNING *
  `;

  const uid = v4();
  const values = [name, uid, author_ID];

  client.query(query, values, (err, response) => {
    if (err) {
      return res.status(500).send({
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
router.put('/:id', (req, res) => {
  const {book_name, author_ID} = req.body;

  // validar datos
  if (book_name === '' || author_ID === '') {
    return res.status(400).send('Debe completar name y author');
  }
  
  const id = req.params.id;

  // existe un libro con ese id?
  const text = `
  select book_id from books
  where book_id = $1 
  `;

  client
  .query(text, [id])
  .then(resp => {
    if (resp.rowCount === 0) {      
      return res.status(400).send('No existe libro con ese ID');
    }
  })
  .catch(err => {    
    return res.status(400).send(err);
  });
   
  
  const query = `
  UPDATE books
  SET book_name = $1, author_id = $2
  WHERE book_id = $3
  `; 

  client.query(query, [book_name, author_ID, id],(err, response) => {

    if (err) {          
      return res.status(500).send({
        msg: 'Error en Base de Datos',
        err,
      });      
    }

    if (response.rowCount === 1) {      
      return res.status(200).send('El libro ha sido actualizado');
    } 
  });
});

// eliminiar un libro
router.delete('/:id', (req, res) => {
  const {id} = req.params;

  const query = `
    DELETE FROM books
    WHERE book_id = $1
    `;

  client.query(query, [id], (err, response) => {
    if (err) {
      return res.status(500).send({
        msg: 'Error en Base de Datos',
        err,
      });
    }

    if (response.rowCount === 1) {
      return res.status(200).send('Libro eliminado');
    } else {
      return res.status(404).send('No se encontró el libro');
    }
  });
});


module.exports = router;