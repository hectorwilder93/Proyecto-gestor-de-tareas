let mysql = require("mysql");

let conexion = mysql.createConnection({
    host:"localhost",
    database:"db_gestor",
    user:"root",
    password:""
});

conexion.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log("conexión exitosa");
    }
});

const usuarios = "SELECT * FROM db_gestor.usuarios";
conexion.query(usuarios, function(error, lista){
    if(error){
        throw error;
    }else{
        console.log(lista);
    }
})

const tarea = "SELECT * FROM db_gestor.tareas";
conexion.query(tarea, function(error, lista){
    if(error){
        throw error;
    }else{
        console.log(lista[0].descripcion);
    }
})

const recordatorios = "SELECT * FROM db_gestor.recordatorios";
conexion.query(recordatorios, function(error, lista){
    if(error){
        throw error;
    }else{
        console.log(lista[0]);
    }
})

const nuevoRegistro = "INSERT INTO tareas (`id`, `titulo`, `descripcion`, `fecha_creacion`, `fecha_vencimiento`, `prioridad`, `estado`, `usuarios_id`) VALUES (NULL, 'imprimir fotos', 'fotos del paseo', '2025-04-10 13:55:37', '2025-04-11 13:55:37', 'media', 'pendiente', '1')";
conexion.query(nuevoRegistro, function(error, rows){
    if(error){
        throw error;
    }else{
        console.log("Datos insertados correctamente");
    }
})

const tareas = "SELECT * FROM db_gestor.tareas";
conexion.query(tareas, function(error, lista){
    if(error){
        throw error;
    }else{
        console.log(lista[6]);
    }
})

const modificar = "UPDATE tareas SET descripcion = 'fotos en pijama' WHERE tareas.id = 7";
conexion.query(modificar, function(error, lista){
    if(error){
        throw error;
    }else{
        console.log("Datos modificados correctamente");
    }
})

const borrar = "DELETE FROM tareas WHERE tareas.id = 6";
conexion.query (borrar, function(error, lsita){
    if(error){
        throw error;
    }else{
        console.log("Datos eliminados exitosamente");
    }
})
conexion.end();