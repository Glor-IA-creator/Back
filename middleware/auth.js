import jwt from 'jsonwebtoken';

// Middleware para validar el token
export const validarJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token, acceso denegado' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.usuario = decoded; // Decodifica y almacena el token en req.usuario
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
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
