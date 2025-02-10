import { OpenAI } from "openai";
import dotenv from "dotenv";
import Thread from '../models/Thread.js';
import Usuario from '../models/Usuario.js';
import { Op, Sequelize } from 'sequelize';


dotenv.config(); // Cargar las variables de entorno

// Configuración de OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: { "OpenAI-Beta": "assistants=v2" },
});

// Lista de asistentes disponibles
const assistants = [
    { id: 'asst_Xx06oeSiJnLTHeK2fJHcbxzF', name: 'Matías Ríos', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740997/MATIAS_dsytw0.png', description: 'Psicólogo clínico con enfoque en ansiedad.' },
    { id: 'asst_rT3d64PKjIP2YCJzQLIKD9zD', name: 'Gloria', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740996/GLORIA_amy2us.png', description: 'Especialista en terapias cognitivo-conductuales.' },
    { id: 'asst_gUECq24wTRwPkmitA18WOChZ', name: 'Alejandro López', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740997/Alejandro_thwmpj.png', description: 'Terapeuta especializado en adolescentes.' },
    { id: 'asst_B3TfdniT0pSxTOYRtrvC9lvC', name: 'Luis Fernández', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740996/Luis_bpguzg.png', description: 'Especialista en psicoterapia humanista.' },
    { id: 'asst_NyQk1ZDUK5fkoQAUEKjsodTZ', name: 'Carlos Mendoza', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740996/CARLOS_zjpqct.png', description: 'Especialista en terapias cognitivo-conductuales.' },
    { id: 'asst_CVlAdD3yeSlGl3mBlDdTFIh8', name: 'José Ramírez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740997/JOSE_qkp1dj.png', description: 'Terapeuta especializado en adolescentes.' },
    { id: 'asst_kyQLTBmPTvbIQTiSQlNtwNoH', name: 'Maria Gomez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1736740997/MARIA_p9onmi.png', description: 'Especialista en psicoterapia humanista.' },
  ];

const DEFAULT_ASSISTANT_ID = process.env.ASSISTANT_ID || assistants[0].id;

export const crearHilo = async (req, res) => {
    const { patientId } = req.body;
  
    if (!patientId) {
      return res.status(400).json({
        message: "El ID del paciente es obligatorio.",
      });
    }
  
    // Buscar el asistente correspondiente
    const assistant = assistants.find(asst => asst.id === patientId);
    if (!assistant) {
      return res.status(404).json({
        message: "El asistente seleccionado no existe.",
      });
    }
  
    try {
      console.log("Creando un nuevo hilo para el paciente:", patientId);
  
      // Crear un hilo en OpenAI
      const thread = await openai.beta.threads.create({});
  
      console.log("Nuevo hilo creado:", thread.id);
  
      // Guardar el hilo en la base de datos
      await Thread.create({
        id_thread: thread.id,
        id_usuario: req.usuario.id, // ID del usuario autenticado
        id_asistente: assistant.id,
        enabled: true, // Por defecto, el hilo está habilitado
      });
  
      // Devolver respuesta al cliente
      res.status(201).json({
        threadId: thread.id,
        patientId: assistant.id,
        name: assistant.name,
        image: assistant.image,
        description: assistant.description,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error al crear el hilo:", error.message);
      res.status(500).json({
        message: "Error al crear el hilo.",
        detalles: error.message,
      });
    }
  };
  

// Obtener el historial de hilos de un usuario
export const obtenerHistorialDeHilos = async (req, res) => {
    const userId = req.usuario.id; // ID del usuario autenticado

    try {
        // Agrupar por asistente y contar la cantidad de hilos
        const history = await Thread.findAll({
            where: { id_usuario: userId },
            attributes: [
                'id_asistente', // ID del asistente
                [Sequelize.fn('COUNT', Sequelize.col('id_thread')), 'interacciones'], // Número de hilos (interacciones)
            ],
            group: ['id_asistente'], // Agrupamos por asistente
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_thread')), 'DESC']], // Ordenar por interacciones
        });

        // Obtener los nombres y descripciones de los asistentes a partir de los IDs
        const assistantsData = history.map((entry) => {
            const assistant = assistants.find((asst) => asst.id === entry.id_asistente);
            return {
                id: entry.id_asistente, // Incluir explícitamente el ID del asistente
                name: assistant?.name || 'Asistente desconocido',
                image: assistant?.image || null,
                description: assistant?.description || 'Sin descripción',
                interactions: entry.get('interacciones'),
            };
        });

        res.json(assistantsData);
    } catch (error) {
        console.error("Error al obtener el historial de hilos:", error.message);
        res.status(500).json({
            message: "Error al obtener el historial de hilos.",
            detalles: error.message,
        });
    }
};


// Agregar un mensaje al hilo y ejecutar un asistente
export const agregarMensaje = async (req, res) => {
    const { threadId, mensaje, assistantId } = req.body;

    if (!threadId || !mensaje) {
        return res.status(400).json({
            message: "El threadId y el mensaje son obligatorios.",
        });
    }

    const selectedAssistantId = assistantId || DEFAULT_ASSISTANT_ID;

    // Validar si el asistente es válido
    const selectedAssistant = assistants.find(asst => asst.id === selectedAssistantId);
    if (!selectedAssistant) {
        return res.status(404).json({
            message: "El asistente seleccionado no existe.",
        });
    }

    try {
        // Agregar el mensaje al hilo
        console.log(`Agregando mensaje al hilo: ${threadId}`);
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: mensaje,
        });

        // Ejecutar el asistente
        console.log(`Ejecutando asistente (${selectedAssistant.name}) para el hilo: ${threadId}`);
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: selectedAssistantId,
        });
        const runId = run.id;

        // Polling para verificar la respuesta del asistente
        const interval = setInterval(async () => {
            try {
                const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
                const status = runObject.status;

                console.log("Estado del asistente: " + status);

                if (status === "completed") {
                    clearInterval(interval);

                    // Obtener los mensajes del hilo
                    const messagesList = await openai.beta.threads.messages.list(threadId);
                    const messages = messagesList.data.map(msg => msg.content[0]?.text?.value || "");

                    return res.json({ messages });
                }
            } catch (error) {
                clearInterval(interval);
                console.error("Error al verificar el estado:", error.message);
                return res.status(500).json({
                    message: "Error al verificar el estado del asistente.",
                    detalles: error.message,
                });
            }
        }, 3000);
    } catch (error) {
        console.error("Error al agregar el mensaje o ejecutar el asistente:", error.message);
        res.status(500).json({
            message: "Error al agregar el mensaje o ejecutar el asistente.",
            detalles: error.message,
        });
    }
};

// Ejecutar un asistente en un hilo
export const ejecutarAsistente = async (req, res) => {
    const { threadId, assistantId } = req.body;

    if (!threadId) {
        return res.status(400).json({
            message: "El threadId es obligatorio.",
        });
    }

    const selectedAssistantId = assistantId || DEFAULT_ASSISTANT_ID;

    // Validar si el asistente es válido
    const selectedAssistant = assistants.find(asst => asst.id === selectedAssistantId);
    if (!selectedAssistant) {
        return res.status(404).json({
            message: "El asistente seleccionado no existe.",
        });
    }

    try {
        console.log(`Ejecutando asistente (${selectedAssistant.name}) para el hilo: ${threadId}`);
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: selectedAssistantId,
        });
        const runId = run.id;

        const interval = setInterval(async () => {
            try {
                const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
                const status = runObject.status;

                if (status === "completed") {
                    clearInterval(interval);

                    const messagesList = await openai.beta.threads.messages.list(threadId);
                    const messages = messagesList.data.map(msg => msg.content[0]?.text?.value || "");

                    return res.json({ threadId, messages });
                }
            } catch (error) {
                clearInterval(interval);
                console.error("Error al verificar el estado:", error.message);
                return res.status(500).json({
                    message: "Error al verificar el estado del asistente.",
                    detalles: error.message,
                });
            }
        }, 3000);
    } catch (error) {
        console.error("Error al ejecutar el asistente:", error.message);
        res.status(500).json({
            message: "Error al ejecutar el asistente.",
            detalles: error.message,
        });
    }
};

// Obtener mensajes de un hilo
export const obtenerMensajes = async (req, res) => {
    const { threadId } = req.query;

    if (!threadId) {
        return res.status(400).json({
            message: "El threadId es obligatorio.",
        });
    }

    try {
        console.log(`Obteniendo mensajes para el hilo: ${threadId}`);
        const messages = await openai.beta.threads.messages.list(threadId); // Cambia según tu implementación
        const formattedMessages = messages.data.map((msg) => ({
            role: msg.role,
            content: msg.content[0]?.text?.value || "",
        }));
        res.json({ messages: formattedMessages });
    } catch (error) {
        console.error("Error al obtener los mensajes:", error.message);
        res.status(500).json({
            message: "Error al obtener los mensajes del hilo.",
            detalles: error.message,
        });
    }
};

// ✅ Registrar tiempo de uso en el chat
export const registrarTiempoDeUsoChat = async (req, res) => {
  const { id } = req.usuario;
  const { minutos } = req.body;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.minutos_uso += minutos;
    await usuario.save();

    res.json({ message: 'Tiempo de uso registrado', minutos });
  } catch (error) {
    console.error('❌ Error al registrar tiempo de uso:', error);
    res.status(500).json({ message: 'Error al registrar el tiempo de uso', error });
  }
};

// Obtener las fechas de los hilos del usuario con un asistente específico
export const obtenerFechasDeHilosPorUsuarioYAsistente = async (req, res) => {
    const userId = req.usuario.id; // ID del usuario autenticado
    const { assistantId } = req.query; // ID del asistente pasado como parámetro
  
    console.log('User ID:', userId); // Verificar el ID del usuario
    console.log('Assistant ID recibido:', assistantId); // Verificar el ID del asistente recibido
  
    if (!assistantId) {
      console.error('El ID del asistente no fue proporcionado.');
      return res.status(400).json({ message: 'El ID del asistente es obligatorio.' });
    }
  
    try {
      // Buscar hilos del usuario con el asistente específico
      const threads = await Thread.findAll({
        where: {
          id_usuario: userId, // Filtrar por el usuario autenticado
          id_asistente: assistantId, // Filtrar por el asistente consultado
        },
        attributes: ['id_thread', 'fecha_creacion'], // Obtener solo los campos necesarios
        order: [['fecha_creacion', 'DESC']], // Ordenar por fecha de creación descendente
      });
  
      console.log('Hilos encontrados:', threads); // Verificar si se encontraron hilos
  
      if (threads.length === 0) {
        console.warn(`No se encontraron hilos para el usuario ${userId} y el asistente ${assistantId}.`);
        return res.status(404).json({ message: 'No se encontraron hilos para este asistente con este usuario.' });
      }
  
      // Formatear las fechas para el frontend
      const formattedDates = threads.map((thread) => ({
        id: thread.id_thread,
        date: new Date(thread.fecha_creacion).toLocaleDateString('es-ES'), // Formato de fecha legible
      }));
  
      console.log('Fechas formateadas para el frontend:', formattedDates); // Verificar las fechas formateadas
  
      res.json({ dates: formattedDates });
    } catch (error) {
      console.error('Error al obtener las fechas de los hilos:', error.message);
      res.status(500).json({
        message: 'Error al obtener las fechas de los hilos.',
        detalles: error.message,
      });
    }
  };
  

export const obtenerUltimoHilo = async (req, res) => {
    const userId = req.usuario.id;
  
    try {
      // Buscar el último hilo modificado por el usuario
      const ultimoHilo = await Thread.findOne({
        where: { id_usuario: userId },
        order: [['updatedAt', 'DESC']],
      });
  
      if (!ultimoHilo) {
        return res.status(404).json({ message: 'No se encontraron hilos para este usuario.' });
      }
  
      const { id_thread: threadId, id_asistente: assistantId, enabled } = ultimoHilo;
  
      // Buscar los detalles del asistente
      const assistant = assistants.find((asst) => asst.id === assistantId);
  
      if (!assistant) {
        return res.status(404).json({ message: 'El asistente asociado al hilo no existe.' });
      }
  
      // Responder con toda la información, incluyendo el ID del asistente
      res.json({
        threadId,
        patientId: assistant.id, // Incluimos el ID del asistente explícitamente
        name: assistant.name,
        image: assistant.image,
        description: assistant.description,
        enabled,
      });
    } catch (error) {
      console.error('Error al obtener el último hilo:', error.message);
      res.status(500).json({
        message: 'Error al obtener el último hilo.',
        detalles: error.message,
      });
    }
  };
  