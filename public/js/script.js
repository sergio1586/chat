$(document).ready(() => {
    const socket = io();/*funcion especifica de la bliblioteca socker.io 
    que crea una isntancia de conexion con el servidor.
    servidor y cliente usan mismo dominio y puerto*/
    let idUsuario;//va a llevar el nombre del usuario

    window.conectar=()=>{//sintaxis de jquery para obtener el valor de la funcion que se llama
        idUsuario=$('#identificacion').val();//coge el valor de identificador
        if(idUsuario){
            socket.emit('usuarioElegido',idUsuario);/*emite el evento con el usuario y 
            lo asocia al campo de usuarioElegido de la coleccion de datos*/
            $('#usuarioSelecionado').prop('disabled',false);
            /*cuando se emite el usuario se cambia la propiedad disabled a falso */
            $('#identificacion').prop('disabled',true);//hace que nop se pueda modificar despues
            //Con lo de abajo creo un h2 y pongo el nombre de quien es el usuario de ese chat
            var nombreChat= $('<h2></h2>');
            nombreChat.text(`${idUsuario.toUpperCase()}`);
            $('#main').prepend(nombreChat);//añade el elemento al principio
        }
    };

    socket.on('listaUsuarios', function (usuarios) {
        $('#listaUsuarios').empty();//elimina lo anterior del DOM antes de añadir
        usuarios.forEach(usuario => {//recorre toda la coleccion y agrega a ala lista el nombre
            $('#listaUsuarios').append(`<p>${usuario.nombreUsuario}</p>`);
        });
    
        $('#usuarioSelecionado').empty();
        usuarios.forEach(usuario => {//y a la lista desplegable el nombre pero el value es el id
            $('#usuarioSelecionado').append(`<option value="${usuario.idUsuario}">${usuario.nombreUsuario}</option>`);
        });
    });

//se lanza cuando el evento es publico recibe el emit del servidor
    socket.on('mensajePublico',function(data){
        if(contienePalabra(data.mensaje,palabrasProhibidas)){//si el mensaje contiene algun insulto se mete en esta if
            var mensajebloqueo = $("<p><strong>Mensaje bloqueado por inclumplir normas</strong></p>");
            mensajebloqueo.css('color','red');
            $('#mensajes').append(mensajebloqueo);
        }else{//si las palabras no son bloqueadas muestra el mensaje publico inidcando el nombre
            $('#mensajes').append(`<p><strong>${data.nombre}:</strong> ${data.mensaje}</p>`);

        }
        
    });
//recibe el emit del servidor cuando es privado pone el nombre del remite y el mensaje en el DOM
    socket.on('privado', function (data) {
        if(contienePalabra(data.mensaje,palabrasProhibidas)){//si el mensaje contiene algun insulto se mete en esta if
            var mensajebloqueo = $("<p><strong>Mensaje bloqueado por inclumplir normas</strong></p>");
            mensajebloqueo.css('color','red');
            $('#mensajes').append(mensajebloqueo);
        }else{//si las palabras no son bloqueadas muestra el mensaje publico inidcando el nombre
            var privado=$(`<p><strong>Privado (${data.nombre}):</strong> ${data.mensaje}</p>`);//guardo en una variable y le aplico css
            privado.css({
                'background-color':'#194CB9',
                'color':'#FFFFFF',
                'padding':'5px'
            });
            $('#mensajes').append(privado);//añado a mensajes

            mostrarNotificacion()
        } 
    });
    
//la funcion se lanza con el boton que lo llama desde el html
    window.enviarPublico=()=>{
        const mensaje=$('#inputMensaje').val();//coge el valor del input
        const nombre=$('#identificacion').val();//coge el valor del value no de lo que muestra el select
        socket.emit('mensajePublico',{mensaje,nombre});//emite el mensaje publico
        $('#inputMensaje').val('');//limpia el inputMensaje
    };
//se lanza con el boton privado
    window.enviarPrivado = () => {
        const mensaje = $('#inputMensaje').val();//coge el mensaje
        const usuarioElegido = $('#usuarioSelecionado').val();//coge el value del select
        socket.emit('privado', { idUsuario, mensaje, usuarioElegido });//envia lo anterio como evento privado al servidor
        $('#inputMensaje').val('');
    };
    //funcion que comprueba si una palabra esta en uns cadena
    function contienePalabra(cadena, palabras) {
        var cadenaMinus=cadena.toLowerCase();//ponemos la cadena a minuscula todo
        return palabras.some(palabra => cadenaMinus.includes(palabra));//observa si la cadena incluye alguna de las palabras
    }
    //el array que con el que comparo el mensaje
    const palabrasProhibidas = [
        'gilipollas',
        'tonto',
        'cabron',
        'idiota',
        'imbecil',
        'estupido',
        'subnormal',
        'puta',
        'mierda',
        'coño',
        'joder',
        'pendejo',
        'pendeja',
        'puto',
        'puta',
        'malparido',
        'malparida',
        'hijo de puta',
        'hija de puta',
        'chinga tu madre',
        'mamón',
        'mamona',
        'baboso',
        'babosa',
        'maricón',
        'marica'
        // Agrega más palabras según tus necesidades
    ];
    function mostrarNotificacion() {
        // Puedes utilizar la API de Notificaciones del navegador
        if (Notification.permission === 'granted') {
            new Notification('Nuevo mensaje');
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                new Notification('Nuevo mensaje');
            }
        });
        }
    }

});