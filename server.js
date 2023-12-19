const express = require('express');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io=require('socket.io')(server);
const port = process.env.PORT || 3000;
app.use(express.static('public'));

app.get('/',(req,res)=>{
    var contenido=fs.readFileSync("./public/index.html");
    res.setHeader("Content-type","text/html");
    res.send(contenido);
})
const usuarios={};
//cuando alquien se conecta se manda esto
io.on('connection',function(socket){
    console.log('Usuario Conectado');
//creamos las claves y la estructuda de el array de usuarios
const idUsuario=socket.id;
usuarios[idUsuario]={
    socket:socket,
    usuarioElegido:null};
//caundo recibe el evento usuarioElegido que manda el boton conectar, envia la lista de usuarios
socket.on('usuarioElegido',function(usuario){
    usuarios[idUsuario].usuarioElegido=usuario;
    enviarListaUsuarios();
});
//cuando recibe el evento de mensaje publico que manda el boton publico coge los datos y los envia al cliente
socket.on('mensajePublico',function(data){
    const nombre=data.nombre;
    const mensaje=data.mensaje
    io.emit('mensajePublico',{nombre,mensaje});//emite los datos al cliente
});
//evento de mensaje privado, recoge datos de boton privado
socket.on('privado', function (data) {
    const usuarioElegido = data.usuarioElegido;//contiene la clave de a quien se envia
    var nombre=data.idUsuario;//contiene el nombre de enviador
    if (usuarioElegido && usuarios[usuarioElegido]) {
        const socketDestino = usuarios[usuarioElegido].socket;
        /*
        estructura
            usuarios[idUsuario]={
                socket:socket{id},
                usuarioElegido:null
            };
            socket tiene un campo id que contiene la clave
        */
        //envia el privado indincado a quien, el nombre del remite y el mensaje
        io.to(socketDestino.id).emit('privado', { nombre, mensaje: data.mensaje });//esta es para el que recibe
        io.to(idUsuario).emit('privado',{nombre,mensaje:data.mensaje});//esto es el que envia
    }
});
//muestra cuando un usuario se desconecta, lo borra del array u muestra la lista actualizada
socket.on('disconnect',function(){
    console.log('Usuario desconectado');
    delete usuarios[idUsuario];//se borra la posicion del array cuando el usuario se va
    enviarListaUsuarios();//se catualiza la lista sin el usuario
});
//envia los ids de todos los usuarios y los nombres
function enviarListaUsuarios() {
    // Object.keys(usuarios): Obtiene un array con las claves del objeto 'usuarios'
    const listaUsuarios = Object.keys(usuarios).map(id => {
        // Por cada clave (id) en el array, crea un nuevo objeto con las siguientes propiedades:
        return {
            // 'idUsuario': la clave (id) actual en el array
            idUsuario: id,
            // 'nombreUsuario': el valor de 'usuarioElegido' asociado a esa clave (id) en el objeto 'usuarios'
            nombreUsuario: usuarios[id].usuarioElegido
        };
    });
        //envia la lista estructurada al cliente
    io.emit('listaUsuarios', listaUsuarios);
}

});
server.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`);
    });