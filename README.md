# AvalithNodeSQL

## Endpoints

# /books 📚
Obtener listado de todos los libros.
#### GET /books
Obtener el listado de un libro por ID.
#### GET /books/:id
Crear un nuevo libro.
#### POST /books
```
{
    "name": "Un nuevo amanecer",    
    "author_ID": "4"
}
```
Modificar un libro.
#### PUT /books/:id
```
{
    "name": "El amanecer del Sargento",    
    "author_ID": "3"
}
```
Eliminar un libro.
#### DELETE /books/:id



# /authors 👨‍🏫
Obtener listado de todos los autores.
#### GET /authors
Obtener el listado de un autor por ID.
#### GET /authors/:id
Crear un nuevo autor.
#### POST /authors
```
{
    "name": "Carlos Castellanos",    
    "country": "Argentina"
}
```
Modificar un autor.
#### PUT /authors/:id
```
{
    "name": "Carlos Alberto Castellanos",    
    "country": "Argentina"
}
```
Eliminar un autor.
#### DELETE /authors/:id
