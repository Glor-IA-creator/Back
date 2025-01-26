/* import express from 'express';
import {
    createThread,
    addMessage,
    runAssistant,
    listMessages,
    checkingStatus,
} from '../controllers/openaiController.js';

const router = express.Router();

// Crear un nuevo hilo
router.get('/thread', async (req, res) => {
    try {
        const thread = await createThread();
        res.json({ threadId: thread.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Enviar un mensaje y ejecutar el asistente
router.post('/message', async (req, res) => {
    const { message, threadId } = req.body;

    try {
        await addMessage(threadId, message);

        const run = await runAssistant(threadId);
        const runId = run.id;

        let pollingInterval = setInterval(() => {
            checkingStatus(res, threadId, runId, pollingInterval);
        }, 5000);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los mensajes de un hilo
router.get('/messages', async (req, res) => {
    const { threadId } = req.query;

    if (!threadId) {
        return res.status(400).json({ error: "Missing required parameter: 'threadId'" });
    }

    try {
        const messages = await listMessages(threadId);
        res.json({ threadId, messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
 */