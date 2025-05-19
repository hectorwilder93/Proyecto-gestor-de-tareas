import express from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
//body parser
app.use(express.json());

//Objetos para llamar los métodos de express
const PORT = process.env.PORT || 3000;

app.get('/',function(req, res) {
  res.send("Hola este es mi servidor SENA proyecto");
});

const myDB = mysql.createPool({
  host: 'localhost',
  port:3306,
  user: 'root',
  password: '',
  database: 'db_gestor'
})

//Traer los datos de usuarios de la base de datos
app.get('/usuarios', (req, res)=>{
  let myQuery = `SELECT * FROM db_gestor.usuarios`;
  myDB.query(myQuery, (error, results) => {
    if(error){
      return res.status(404).json(error);
    }
    return res.status(200).json(results); 
  
  });
}); 


//Traer los datos de usuarios por id
app.get('/usuarios/:id', (req, res)=>{
  let {id} = req.params;
  console.log(id);
  //sentencia query para traer usuarios por el id.
  let myQuery = `SELECT * FROM db_gestor.usuarios WHERE id = ${id}`;
  myDB.query(myQuery, (error, result) => {
    if(error){
      return res.status(404).json(error);
    }
    return res.status(200).json(result); 
  
  });
});

//Traer todas las tareas de la base de datos
app.get('/tareas', (req, res)=>{
  let myQuery = `SELECT * FROM db_gestor.tareas`;
  myDB.query(myQuery, (error, result) => {
    if(error){
      return res.status(404).json(error);
    }
    return res.status(200).json(result); 
  
  });
});

//Tareas por Id
app.get('/tareas/:id', (req, res)=>{
  let {id} = req.params;
  console.log(id);
  //sentencia query para traer usuarios por el id.
  let myQuery = `SELECT * FROM db_gestor.tareas WHERE id = ${id}`;
  myDB.query(myQuery, (error, result) => {
    if(error){
      return res.status(404).json(error);
    }
    return res.status(200).json(result); 
  
  });
});

//Crear nueva tarea
app.post('/tareas', (req, res)=>{
  //Leer los datos del cuerpo de la solicitud
  const {titulo, descripcion,fecha_creacion,fecha_vencimiento,prioridad,estado,usuarios_id} = req.body;
  //Validar campos obligatorios
  if(!titulo || !descripcion || !usuarios_id){
    return res.status(400).json({error: "Los campos titulo, descripcion y usuarios_id son obligatorios" });
  }

  //sentencia SQL con parametros preparados para evitar inyección SQL.
  const myQuery = `INSERT INTO db_gestor.tareas (titulo, descripcion,fecha_creacion,fecha_vencimiento,prioridad,estado,usuarios_id) VALUES (?,?,?,?,?,?,?)`;

  //Valores para la consulta
  const values = [
    titulo,
    descripcion,
    fecha_creacion || new Date(), // Si no se proporciona, usa la fecha actual
    fecha_vencimiento || null,
    prioridad || 'media', //Valor por defecto
    estado || 'pendiente', // Valor por defecto
    usuarios_id
  ];

  //Ejecutar la consulta
  myDB.query(myQuery,values, (error, result) => {
    if(error) {
      console.error('Error de la consulta SQL:', error);
      return res.status(500).json({
        error: "Error al crear la tarea",
        details: error.message
      });
    }

    //Devolver el id de la nueva tarea creada
    return res.status(201).json({
      message: "Tarea creada exitosamente",
      id: result.insertId
    });   
  });
});

//PUT actualizar las tareas

app.put('/tareas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_vencimiento, prioridad, estado, usuarios_id } = req.body;

  console.log(`Actualizando tarea ID: ${id} con datos:`, req.body);

  // Validar que al menos un campo sea proporcionado para actualizar
  if (!titulo && !descripcion && !fecha_vencimiento && !prioridad && !estado && !usuarios_id) {
    return res.status(400).json({ 
      error: "Debe proporcionar al menos un campo para actualizar",
      campos_disponibles: ["titulo", "descripcion", "fecha_vencimiento", "prioridad", "estado", "usuarios_id"]
    });
  }

  // Construir la consulta SQL dinámicamente
  let updateFields = [];
  let queryParams = [];

  if (titulo) {
    updateFields.push("titulo = ?");
    queryParams.push(titulo);
  }
  if (descripcion) {
    updateFields.push("descripcion = ?");
    queryParams.push(descripcion);
  }
  if (fecha_vencimiento) {
    updateFields.push("fecha_vencimiento = ?");
    queryParams.push(fecha_vencimiento);
  }
  if (prioridad) {
    updateFields.push("prioridad = ?");
    queryParams.push(prioridad);
  }
  if (estado) {
    updateFields.push("estado = ?");
    queryParams.push(estado);
  }
  if (usuarios_id) {
    updateFields.push("usuarios_id = ?");
    queryParams.push(usuarios_id);
  }

  queryParams.push(id); // Añadir el ID al final para el WHERE

  const myQuery = `UPDATE db_gestor.tareas 
                  SET ${updateFields.join(", ")} 
                  WHERE id = ?`;

  myDB.query(myQuery, queryParams, (error, result) => {
    if (error) {
      console.error('Error al actualizar tarea:', error);
      return res.status(500).json({ 
        error: "Error en la base de datos",
        detalle: error.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        error: "Tarea no encontrada",
        mensaje: `No existe una tarea con el ID ${id}`
      });
    }

    // Opcional: Devolver la tarea actualizada
    const getUpdatedQuery = `SELECT * FROM db_gestor.tareas WHERE id = ?`;
    myDB.query(getUpdatedQuery, [id], (err, updatedResult) => {
      if (err) {
        console.error('Error al obtener tarea actualizada:', err);
        return res.status(200).json({ 
          mensaje: "Tarea actualizada pero no se pudo recuperar la nueva versión",
          id: id,
          cambios: req.body
        });
      }

      return res.status(200).json({
        mensaje: "Tarea actualizada exitosamente",
        tarea: updatedResult[0]
      });
    });
  });
});

//Delete borrar las tareas
app.delete('/tareas/:id', (req, res) =>{
  const {id} = req.params;
  let myQuery = `DELETE FROM db_gestor.tareas WHERE id = ${id}`;
  //query
  myDB.query(myQuery, (error, result) =>{
    if(error){
      return res.status(404).json(error);
    }
    return res.status(200).json(result);
  });
});

//middleware::::::::::::::::::::::::.
app.use(express.static("public"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});