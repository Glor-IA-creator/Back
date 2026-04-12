import jwt from 'jsonwebtoken';

// Middleware para validar el token
export const validarJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    console.warn(`⛔ Auth sin token — ${req.method} ${req.originalUrl} — IP: ${req.ip}`);
    return res.status(401).json({ code: 'AUTH_MISSING', message: 'No se proporcionó un token, acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    let info = 'desconocido';
    try {
      const payload = JSON.parse(Buffer.from(token.split(' ')[1].split('.')[1], 'base64').toString());
      info = `${payload.nombre || 'sin nombre'} (ID: ${payload.id || '?'})`;
    } catch (_) { /* token malformado */ }

    const code = err.name === 'TokenExpiredError' ? 'AUTH_EXPIRED' : 'AUTH_INVALID';
    console.warn(`⛔ JWT rechazado — ${err.message} — usuario: ${info} — ${req.method} ${req.originalUrl}`);
    return res.status(401).json({ code, message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
export const verificarRol = (rolesPermitidos) => (req, res, next) => {
  const { rol } = req.usuario;

  if (!rolesPermitidos.includes(rol)) {
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
  }

  next();
};
