const CLAVE_REGISTROS = "registroEmocional.registros";

const emociones = [
    { valor: "felicidad", nombre: "Felicidad", emoji: "😊" },
    { valor: "calma", nombre: "Calma", emoji: "😌" },
    { valor: "ansiedad", nombre: "Ansiedad", emoji: "😟" },
    { valor: "tristeza", nombre: "Tristeza", emoji: "😢" },
    { valor: "enojo", nombre: "Enojo", emoji: "😠" },
    { valor: "motivacion", nombre: "Motivación", emoji: "💪" }
];

const registrosDeEjemplo = [
    {
        fecha: "2026-08-21",
        emocion: "felicidad",
        intensidad: 80,
        observacion: "Hoy tuve un buen día."
    },
    {
        fecha: "2026-08-20",
        emocion: "calma",
        intensidad: 60,
        observacion: "Respiré un momento antes de seguir con mis actividades."
    },
    {
        fecha: "2026-08-18",
        emocion: "ansiedad",
        intensidad: 40,
        observacion: "Me sentí inquieto, pero pude pedir ayuda."
    }
];

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

function iniciarAplicacion() {
    iniciarFormulario();
    mostrarInicio();
    mostrarHistorial();
    mostrarEstadisticas();
}

function iniciarFormulario() {
    const formulario = document.querySelector("#form-registro");

    if (!formulario) {
        return;
    }

    prepararFechaActual();
    actualizarIntensidad();
    seleccionarEmocion();

    const rangoIntensidad = document.querySelector("#intensidad");
    const radiosEmocion = document.querySelectorAll('input[name="emocion"]');

    rangoIntensidad.addEventListener("input", actualizarIntensidad);
    formulario.addEventListener("submit", registrarEmocion);

    radiosEmocion.forEach(function (radio) {
        radio.addEventListener("change", seleccionarEmocion);
    });
}

function prepararFechaActual() {
    const campoFecha = document.querySelector("#fecha");

    if (campoFecha && !campoFecha.value) {
        campoFecha.value = obtenerFechaActual();
    }
}

function obtenerFechaActual() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function seleccionarEmocion() {
    const textoSeleccion = document.querySelector("#emocion-seleccionada");
    const emocionSeleccionada = document.querySelector('input[name="emocion"]:checked');

    if (!textoSeleccion) {
        return;
    }

    if (!emocionSeleccionada) {
        textoSeleccion.textContent = "Elegí una emoción.";
        return;
    }

    const datosEmocion = obtenerDatosEmocion(emocionSeleccionada.value);
    textoSeleccion.textContent = `Emoción seleccionada: ${datosEmocion.nombre}.`;
}

function actualizarIntensidad() {
    const rangoIntensidad = document.querySelector("#intensidad");
    const textoIntensidad = document.querySelector("#valor-intensidad");

    if (!rangoIntensidad || !textoIntensidad) {
        return;
    }

    textoIntensidad.textContent = `Intensidad: ${rangoIntensidad.value}/100`;
}

function registrarEmocion(evento) {
    evento.preventDefault();

    const formulario = evento.target;

    if (!formulario.reportValidity()) {
        return;
    }

    const datosFormulario = new FormData(formulario);
    const nuevoRegistro = {
        fecha: datosFormulario.get("fecha"),
        emocion: datosFormulario.get("emocion"),
        intensidad: Number(datosFormulario.get("intensidad")),
        observacion: datosFormulario.get("observacion").trim()
    };

    const registros = obtenerRegistros();
    registros.push(nuevoRegistro);
    const pudoGuardar = guardarRegistros(registros);

    if (!pudoGuardar) {
        return;
    }

    formulario.reset();
    prepararFechaActual();
    actualizarIntensidad();
    seleccionarEmocion();
    mostrarMensajeFormulario("Registro guardado correctamente.");
}

function mostrarMensajeFormulario(texto) {
    const mensaje = document.querySelector("#mensaje-formulario");

    if (mensaje) {
        mensaje.textContent = texto;
    }
}

function obtenerRegistros() {
    let datosGuardados = null;

    try {
        datosGuardados = localStorage.getItem(CLAVE_REGISTROS);
    } catch (error) {
        return [];
    }

    if (!datosGuardados) {
        return [];
    }

    try {
        return JSON.parse(datosGuardados);
    } catch (error) {
        return [];
    }
}

function guardarRegistros(registros) {
    try {
        localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
        return true;
    } catch (error) {
        mostrarMensajeFormulario("No se pudo guardar el registro en este navegador.");
        return false;
    }
}

function obtenerRegistrosParaMostrar() {
    const registrosGuardados = obtenerRegistros();

    if (registrosGuardados.length > 0) {
        return registrosGuardados;
    }

    return registrosDeEjemplo;
}

function mostrarInicio() {
    const resumenUltimo = document.querySelector("#resumen-ultimo");

    if (!resumenUltimo) {
        return;
    }

    const registros = ordenarPorFecha(obtenerRegistrosParaMostrar());
    const resumenIntensidad = document.querySelector("#resumen-intensidad");
    const resumenEmocion = document.querySelector("#resumen-emocion");
    const listaUltimos = document.querySelector("#ultimos-registros");

    if (registros.length === 0) {
        resumenUltimo.textContent = "Sin registros todavía";
        resumenIntensidad.textContent = "-";
        resumenEmocion.textContent = "-";
        mostrarMensajeVacio(listaUltimos, "Todavía no hay registros para mostrar.");
        return;
    }

    const ultimoRegistro = registros[0];
    const datosEmocion = obtenerDatosEmocion(ultimoRegistro.emocion);

    resumenUltimo.textContent = formatearFecha(ultimoRegistro.fecha);
    resumenIntensidad.textContent = `${ultimoRegistro.intensidad}/100`;
    resumenEmocion.textContent = `${datosEmocion.emoji} ${datosEmocion.nombre}`;
    mostrarListaRegistros(listaUltimos, registros.slice(0, 3));
}

function mostrarHistorial() {
    const listaHistorial = document.querySelector("#lista-registros");

    if (!listaHistorial) {
        return;
    }

    const botonesFiltro = document.querySelectorAll("[data-filtro]");

    botonesFiltro.forEach(function (boton) {
        boton.addEventListener("click", function () {
            botonesFiltro.forEach(function (otroBoton) {
                otroBoton.classList.remove("active");
            });

            boton.classList.add("active");
            mostrarRegistrosFiltrados(boton.dataset.filtro);
        });
    });

    mostrarRegistrosFiltrados("todos");
}

function mostrarRegistrosFiltrados(filtro) {
    const listaHistorial = document.querySelector("#lista-registros");
    const registros = ordenarPorFecha(obtenerRegistrosParaMostrar());
    const registrosFiltrados = filtrarRegistros(registros, filtro);

    mostrarListaRegistros(listaHistorial, registrosFiltrados);
}

function mostrarListaRegistros(contenedor, registros) {
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (registros.length === 0) {
        mostrarMensajeVacio(contenedor, "No hay registros para este filtro.");
        return;
    }

    registros.forEach(function (registro) {
        contenedor.appendChild(crearArticuloRegistro(registro));
    });
}

function crearArticuloRegistro(registro) {
    const datosEmocion = obtenerDatosEmocion(registro.emocion);
    const articulo = document.createElement("article");
    const fecha = document.createElement("time");
    const titulo = document.createElement("h3");
    const intensidad = document.createElement("p");
    const observacion = document.createElement("p");

    articulo.className = "registro";

    fecha.dateTime = registro.fecha;
    fecha.textContent = formatearFecha(registro.fecha);

    titulo.textContent = `${datosEmocion.emoji} ${datosEmocion.nombre}`;
    intensidad.textContent = `Intensidad: ${registro.intensidad}/100`;
    observacion.textContent = registro.observacion;

    articulo.appendChild(fecha);
    articulo.appendChild(titulo);
    articulo.appendChild(intensidad);
    articulo.appendChild(observacion);

    return articulo;
}

function mostrarMensajeVacio(contenedor, texto) {
    const mensaje = document.createElement("p");
    mensaje.className = "mensaje-vacio";
    mensaje.textContent = texto;
    contenedor.appendChild(mensaje);
}

function mostrarEstadisticas() {
    const cantidadRegistros = document.querySelector("#cantidad-registros");

    if (!cantidadRegistros) {
        return;
    }

    const registros = obtenerRegistrosParaMostrar();
    const intensidadPromedio = document.querySelector("#intensidad-promedio");
    const emocionFrecuente = document.querySelector("#emocion-frecuente");
    const barrasEmociones = document.querySelector("#barras-emociones");

    cantidadRegistros.textContent = registros.length;
    intensidadPromedio.textContent = `${calcularPromedio(registros)}/100`;
    emocionFrecuente.textContent = obtenerEmocionMasFrecuente(registros);
    mostrarBarrasEmociones(barrasEmociones, registros);
}

function calcularPromedio(registros) {
    if (registros.length === 0) {
        return 0;
    }

    let suma = 0;

    registros.forEach(function (registro) {
        suma = suma + registro.intensidad;
    });

    return Math.round(suma / registros.length);
}

function obtenerEmocionMasFrecuente(registros) {
    if (registros.length === 0) {
        return "-";
    }

    const conteo = contarEmociones(registros);
    let emocionMayor = emociones[0].valor;

    emociones.forEach(function (emocion) {
        if (conteo[emocion.valor] > conteo[emocionMayor]) {
            emocionMayor = emocion.valor;
        }
    });

    const datosEmocion = obtenerDatosEmocion(emocionMayor);
    return `${datosEmocion.emoji} ${datosEmocion.nombre}`;
}

function mostrarBarrasEmociones(contenedor, registros) {
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (registros.length === 0) {
        mostrarMensajeVacio(contenedor, "Todavía no hay datos para calcular estadísticas.");
        return;
    }

    const conteo = contarEmociones(registros);

    emociones.forEach(function (emocion) {
        const porcentaje = Math.round((conteo[emocion.valor] / registros.length) * 100);
        contenedor.appendChild(crearBarraEmocion(emocion, porcentaje));
    });
}

function crearBarraEmocion(emocion, porcentaje) {
    const articulo = document.createElement("article");
    const encabezado = document.createElement("header");
    const titulo = document.createElement("h3");
    const valor = document.createElement("span");
    const barra = document.createElement("progress");

    articulo.className = "barra-emocion";
    titulo.textContent = `${emocion.emoji} ${emocion.nombre}`;
    valor.textContent = `${porcentaje}%`;
    barra.value = porcentaje;
    barra.max = 100;
    barra.textContent = `${porcentaje}%`;

    encabezado.appendChild(titulo);
    encabezado.appendChild(valor);
    articulo.appendChild(encabezado);
    articulo.appendChild(barra);

    return articulo;
}

function contarEmociones(registros) {
    const conteo = {};

    emociones.forEach(function (emocion) {
        conteo[emocion.valor] = 0;
    });

    registros.forEach(function (registro) {
        if (conteo[registro.emocion] !== undefined) {
            conteo[registro.emocion] = conteo[registro.emocion] + 1;
        }
    });

    return conteo;
}

function filtrarRegistros(registros, filtro) {
    const hoy = crearFechaLocal(obtenerFechaActual());

    if (filtro === "semana") {
        return registros.filter(function (registro) {
            const fechaRegistro = crearFechaLocal(registro.fecha);
            const diferencia = hoy - fechaRegistro;
            const dias = diferencia / (1000 * 60 * 60 * 24);

            return dias >= 0 && dias <= 7;
        });
    }

    if (filtro === "mes") {
        return registros.filter(function (registro) {
            const fechaRegistro = crearFechaLocal(registro.fecha);

            return fechaRegistro.getMonth() === hoy.getMonth() &&
                fechaRegistro.getFullYear() === hoy.getFullYear();
        });
    }

    return registros;
}

function crearFechaLocal(fechaISO) {
    const partes = fechaISO.split("-");

    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function ordenarPorFecha(registros) {
    return registros.slice().sort(function (a, b) {
        return b.fecha.localeCompare(a.fecha);
    });
}

function obtenerDatosEmocion(valor) {
    const emocionEncontrada = emociones.find(function (emocion) {
        return emocion.valor === valor;
    });

    if (emocionEncontrada) {
        return emocionEncontrada;
    }

    return { valor: valor, nombre: valor, emoji: "•" };
}

function formatearFecha(fechaISO) {
    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
