# Guion rápido para demostrar el proyecto

1. Abrir **Modelos** y explicar que MySQL utiliza 9 tablas mientras MongoDB concentra el catálogo en documentos `libros`.
2. En **Comparador**, ejecutar `Catálogo completo con autores` y señalar los JOIN de MySQL frente al documento embebido de MongoDB.
3. Ejecutar `Ejemplares disponibles`: MySQL usa `ejemplar + libro`; MongoDB usa `$unwind` sobre `ejemplares[]`.
4. Ejecutar `Préstamos de un usuario` con `David`: MySQL recorre usuario, préstamo, detalle, ejemplar y libro; MongoDB recupera el préstamo como agregado.
5. Abrir **CRUD comparativo**, crear un libro con uno o dos autores y mostrar cómo MySQL inserta `libro` y `libro_autor`, mientras MongoDB mantiene los autores dentro del documento.
6. Intentar borrar un libro sembrado que tenga ejemplares para mostrar cómo la FK de MySQL protege la integridad referencial.
7. Cerrar explicando que ninguno de los dos modelos es universalmente superior: organizan los datos de forma distinta y favorecen patrones de consulta distintos.
