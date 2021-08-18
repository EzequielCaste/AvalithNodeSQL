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

// obtener el listado de todos los autores
router.get('/', (req, res) => {
  const query = `
  SELECT authors.author_id as id, authors.name as name, authors.country as nationality FROM authors
  `;

  client
    .query(query)
    .then((resp) => {
      if (resp.rowCount === 0) {
        return res.status(400).send('No hay autores cargados');
      }
      return res.status(200).send(resp.rows);
    })
    .catch((error) => {
      return res.status(500).send({
        msg: 'Error en Base de Datos',
        error,
      })
    });
});

// obtener author por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = `
  SELECT authors.author_id as id, authors.name as name, authors.country as country FROM authors WHERE authors.author_id = $1
  `;
  
  client
    .query(query, [id])
    .then(resp => {
      if (resp.rowCount === 0) {
        return res.status(400).send('No existe autor con ese ID');
       }
      return res.status(200).send(resp.rows);
    })
    .catch(err => {
      return res.status(400).send(err)
    });    
});

// crear nuevo autor
router.post('/', (req, res) => {
  const {name, country} = req.body;

  if (name === '' || country === '') {
    return res.status(400).send({
      ok: false,
      msg: 'Los campos name y country son requeridos',
    });
  }

  const query = `
  INSERT INTO authors(name,country) VALUES($1, $2) RETURNING *
  `;
  
  const values = [name, country];
 
  client.query(query, values)
  .then(resp => {
    return res.status(201).send({
      ok: true,
      msg: 'Autor creado',
      libro: resp.rows[0],
    });
  })
  .catch(err => {
    return res.status(500).send({
      ok: false,
      msg: 'Error al crear author',     
      err
    });
  });      
});

// modificar los datos de un autor en particular
router.put('/:id', (req, res) => {
  const {name, country} = req.body;

  // validar datos
  if (name === '' || country === '') {
    return res.status(400).send('Debe completar name y author');
  }
  
  const id = req.params.id;

  // existe un autor con ese id?
  const text = `
  select name from authors
  where author_id = $1 
  `;

  client
  .query(text, [id])
  .then(resp => {
    if (resp.rowCount === 0) {      
      return res.status(400).send('No existe autor con ese ID');
    }
  })
  .catch(err => {    
    return res.status(400).send(err);
  });
   
  
  const query = `
  UPDATE authors
  SET name = $1, country = $2
  WHERE author_id = $3
  `; 

  client.query(query, [name, country, id],(err, response) => {

    if (err) {          
      return res.status(500).send({
        msg: 'Error en Base de Datos',
        err,
      });      
    }

    if (response.rowCount === 1) {      
      return res.status(200).send('El autor ha sido actualizado');
    } 
  });
});

// eliminiar un autor
router.delete('/:id', (req, res) => {
  const {id} = req.params;

  const query = `
    DELETE FROM authors
    WHERE author_id = $1
    `;

  client.query(query, [id], (err, response) => {
    if (err) {
      return res.status(500).send({
        msg: 'Error en Base de Datos',
        err,
      });
    }

    if (response.rowCount === 1) {
      return res.status(200).send('Autor eliminado');
    } else {
      return res.status(404).send('No se encontró el autor');
    }
  });
});

module.exports = router;