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
    { id: 'asst_Xx06oeSiJnLTHeK2fJHcbxzF', name: 'Matías Ríos', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/rsptuyevsarr3mzqc5ny.png', description: 'Psicólogo clínico con enfoque en ansiedad.' },
    { id: 'asst_rT3d64PKjIP2YCJzQLIKD9zD', name: 'Gloria', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/cenk1mh6mk067bqc7m2t.png', description: 'Especialista en terapias cognitivo-conductuales.' },
    { id: 'asst_gUECq24wTRwPkmitA18WOChZ', name: 'Alejandro López', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/gxl328leuugmfywbkrlt.png', description: 'Terapeuta especializado en adolescentes.' },
    { id: 'asst_B3TfdniT0pSxTOYRtrvC9lvC', name: 'Luis Fernández', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/nkw8ossvdckrwjbnqxtm.png', description: 'Especialista en psicoterapia humanista.' },
    { id: 'asst_NyQk1ZDUK5fkoQAUEKjsodTZ', name: 'Carlos Mendoza', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564022/spr6gt9besefwyd57wvk.png', description: 'Especialista en terapias cognitivo-conductuales.' },
    { id: 'asst_CVlAdD3yeSlGl3mBlDdTFIh8', name: 'José Ramírez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/a4jlurybskdwftw59poa.png', description: 'Terapeuta especializado en adolescentes.' },
    { id: 'asst_kyQLTBmPTvbIQTiSQlNtwNoH', name: 'Maria Gomez', image: 'https://res.cloudinary.com/df5lekmb6/image/upload/v1741564021/su5qnrj0hgpoyuy4j3to.png', description: 'Especialista en psicoterapia humanista.' },
];

const DEFAULT_ASSISTANT_ID = process.env.ASSISTANT_ID || assistants[0].id;

// --- FUNCIÓN AUXILIAR PARA POLLING SEGURO ---
// Esta función reemplaza al setInterval problemático
const esperarRespuestaDeAsistente = async (threadId, runId, res) => {
    try {
        let estado = "queued";
        let intentos = 0;
        const maxIntentos = 60; // Evitar bucles infinitos (aprox 3 minutos)

        while (estado !== "completed") {
            if (intentos >= maxIntentos) {
                return res.status(504).json({ message: "El asistente tardó demasiado en responder." });
            }

            // Esperar 2 segundos antes de volver a preguntar (Polling secuencial)
            await new Promise(resolve => setTimeout(resolve, 2000));

            const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
            estado = runObject.status;
            console.log(`Estado del asistente (${threadId}): ${estado}`);

            if (estado === "completed") {
                // ¡Listo! Obtenemos mensajes
                const messagesList = await openai.beta.threads.messages.list(threadId);
                const messages = messagesList.data.map(msg => msg.content[0]?.text?.value || "");
                return res.json({ messages });
            } else if (estado === "failed" || estado === "cancelled" || estado === "expired") {
                return res.status(500).json({
                    message: "El asistente falló al procesar la respuesta.",
                    detalles: runObject.last_error || "Error desconocido"
                });
            }

            intentos++;
        }
    } catch (error) {
        console.error("Error en el polling del asistente:", error.message);
        // Verificamos si la respuesta ya se envió para evitar el error ERR_HTTP_HEADERS_SENT
        if (!res.headersSent) {
            res.status(500).json({
                message: "Error interno al verificar el asistente.",
                detalles: error.message
            });
        }
    }
};


export const crearHilo = async (req, res) => {
    const { patientId } = req.body;

    if (!patientId) {
        return res.status(400).json({
            message: "El ID del paciente es obligatorio.",
        });
    }

    const assistant = assistants.find(asst => asst.id === patientId);
    if (!assistant) {
        return res.status(404).json({
            message: "El asistente seleccionado no existe.",
        });
    }

    try {
        console.log("Creando un nuevo hilo para el paciente:", patientId);
        const thread = await openai.beta.threads.create({});
        console.log("Nuevo hilo creado:", thread.id);

        await Thread.create({
            id_thread: thread.id,
            id_usuario: req.usuario.id,
            id_asistente: assistant.id,
            enabled: true,
        });

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


export const obtenerHistorialDeHilos = async (req, res) => {
    const userId = req.usuario.id;

    try {
        const history = await Thread.findAll({
            where: { id_usuario: userId },
            attributes: [
                'id_asistente',
                [Sequelize.fn('COUNT', Sequelize.col('id_thread')), 'interacciones'],
            ],
            group: ['id_asistente'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id_thread')), 'DESC']],
        });

        const assistantsData = history.map((entry) => {
            const assistant = assistants.find((asst) => asst.id === entry.id_asistente);
            return {
                id: entry.id_asistente,
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


// Agregar un mensaje al hilo y ejecutar un asistente (CORREGIDO)
export const agregarMensaje = async (req, res) => {
    const { threadId, mensaje, assistantId } = req.body;

    if (!threadId || !mensaje) {
        return res.status(400).json({
            message: "El threadId y el mensaje son obligatorios.",
        });
    }

    const selectedAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
    const selectedAssistant = assistants.find(asst => asst.id === selectedAssistantId);
    
    if (!selectedAssistant) {
        return res.status(404).json({
            message: "El asistente seleccionado no existe.",
        });
    }

    try {
        console.log(`Agregando mensaje al hilo: ${threadId}`);
        await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: mensaje,
        });

        console.log(`Ejecutando asistente (${selectedAssistant.name}) para el hilo: ${threadId}`);
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: selectedAssistantId,
        });
        
        // Usamos la nueva función de polling seguro en lugar de setInterval
        await esperarRespuestaDeAsistente(threadId, run.id, res);

    } catch (error) {
        console.error("Error al agregar el mensaje o ejecutar el asistente:", error.message);
        if (!res.headersSent) {
             res.status(500).json({
                message: "Error al agregar el mensaje o ejecutar el asistente.",
                detalles: error.message,
            });
        }
    }
};

// Ejecutar un asistente en un hilo (CORREGIDO)
export const ejecutarAsistente = async (req, res) => {
    const { threadId, assistantId } = req.body;

    if (!threadId) {
        return res.status(400).json({
            message: "El threadId es obligatorio.",
        });
    }

    const selectedAssistantId = assistantId || DEFAULT_ASSISTANT_ID;
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

        // Usamos la nueva función de polling seguro
        await esperarRespuestaDeAsistente(threadId, run.id, res);

    } catch (error) {
        console.error("Error al ejecutar el asistente:", error.message);
        if (!res.headersSent) {
            res.status(500).json({
                message: "Error al ejecutar el asistente.",
                detalles: error.message,
            });
        }
    }
};

export const obtenerMensajes = async (req, res) => {
    const { threadId } = req.query;

    if (!threadId) {
        return res.status(400).json({
            message: "El threadId es obligatorio.",
        });
    }

    try {
        const thread = await Thread.findOne({ where: { id_thread: threadId } });
        if (!thread) {
            return res.status(404).json({ message: 'Hilo no encontrado.' });
        }

        const assistant = assistants.find(asst => asst.id === thread.id_asistente);
        const user = await Usuario.findByPk(thread.id_usuario);

        console.log(`Obteniendo mensajes para el hilo: ${threadId}`);
        let allMessages = [];
        let afterCursor = null;

        do {
            const response = await openai.beta.threads.messages.list(threadId, {
                after: afterCursor,
                limit: 100,
                order: 'desc',
            });

            allMessages = allMessages.concat(response.data);
            afterCursor = response.data.length > 0 ? response.data[response.data.length - 1].id : null;
        } while (afterCursor);

        const formattedMessages = allMessages.map((msg) => {
            let senderName = msg.role;
            if (msg.role === 'assistant') {
                senderName = assistant?.name || 'Asistente desconocido';
            } else if (msg.role === 'user') {
                senderName = user?.nombre || user?.name || 'Usuario desconocido';
            }

            const content = msg.content?.[0]?.text?.value || msg.content?.[0]?.text || msg.content || "";

            return {
                sender: senderName,
                content: content,
            };
        });

        res.json({
            assistant: {
                id: assistant?.id || null,
                name: assistant?.name || 'Asistente desconocido'
            },
            user: {
                id: user?.id || null,
                name: user?.nombre || user?.name || 'Usuario desconocido'
            },
            messages: formattedMessages
        });
    } catch (error) {
        console.error("Error al obtener los mensajes:", error.message);
        res.status(500).json({
            message: "Error al obtener los mensajes del hilo.",
            detalles: error.message,
        });
    }
};

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

export const obtenerFechasDeHilosPorUsuarioYAsistente = async (req, res) => {
    const userId = req.usuario.id;
    const { assistantId } = req.query;

    if (!assistantId) {
        return res.status(400).json({ message: 'El ID del asistente es obligatorio.' });
    }

    try {
        const threads = await Thread.findAll({
            where: {
                id_usuario: userId,
                id_asistente: assistantId,
            },
            attributes: ['id_thread', 'fecha_creacion'],
            order: [['fecha_creacion', 'DESC']],
        });

        if (threads.length === 0) {
            return res.status(404).json({ message: 'No se encontraron hilos para este asistente con este usuario.' });
        }

        const formattedDates = threads.map((thread) => ({
            id: thread.id_thread,
            date: new Date(thread.fecha_creacion).toLocaleDateString('es-ES'),
        }));

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
        const ultimoHilo = await Thread.findOne({
            where: { id_usuario: userId },
            order: [['updatedAt', 'DESC']],
        });

        if (!ultimoHilo) {
            return res.status(404).json({ message: 'No se encontraron hilos para este usuario.' });
        }

        const { id_thread: threadId, id_asistente: assistantId, enabled } = ultimoHilo;
        const assistant = assistants.find((asst) => asst.id === assistantId);

        if (!assistant) {
            return res.status(404).json({ message: 'El asistente asociado al hilo no existe.' });
        }

        res.json({
            threadId,
            patientId: assistant.id,
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

export const obtenerUltimoHiloPorAsistente = async (req, res) => {
    const userId = req.usuario.id;
    const { assistantId } = req.query;

    if (!assistantId) {
        return res.status(400).json({ message: 'El ID del asistente es obligatorio.' });
    }

    try {
        const ultimoHilo = await Thread.findOne({
            where: {
                id_usuario: userId,
                id_asistente: assistantId,
            },
            order: [['updatedAt', 'DESC']],
        });

        if (!ultimoHilo) {
            return res.status(404).json({ message: 'No se encontraron hilos para este usuario con este asistente.' });
        }

        const { id_thread: threadId, enabled } = ultimoHilo;
        const assistant = assistants.find((asst) => asst.id === assistantId);

        if (!assistant) {
            return res.status(404).json({ message: 'El asistente asociado al hilo no existe.' });
        }

        res.json({
            threadId,
            patientId: assistant.id,
            name: assistant.name,
            image: assistant.image,
            description: assistant.description,
            enabled,
        });
    } catch (error) {
        console.error('Error al obtener el último hilo del asistente:', error.message);
        res.status(500).json({
            message: 'Error al obtener el último hilo del asistente.',
            detalles: error.message,
        });
    }
};
