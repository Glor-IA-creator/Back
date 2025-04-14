import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';

dotenv.config();

/**
 * ✅ Obtener todos los usuarios
 */
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: { model: Rol, as: 'rol', attributes: ['nombre'] },
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
};

/**
 * ✅ Iniciar sesión
 */
export const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔍 Intentando iniciar sesión con:', email);

    // Buscar usuario por email e incluir su rol
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
    });

    if (!usuario) {
      console.warn('⚠️ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', usuario.nombre);

    // ✅ Verificar si el usuario está habilitado
    if (!usuario.enabled) {
      console.warn('⚠️ Usuario deshabilitado');
      return res.status(403).json({ message: 'Usuario deshabilitado. Contacte con un administrador.' });
    }

    // ✅ Comparar contraseñas
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      console.warn('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // ✅ Registrar la fecha del último acceso
    usuario.ultimo_acceso = new Date();
    await usuario.save();

    // ✅ Generar token de autenticación
    const token = jwt.sign(
      { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🔐 Token generado:', token);

    res.json({
      token,
      rol: usuario.rol.nombre,
      nombre: usuario.nombre,
      enabled: usuario.enabled,
      ultimo_acceso: usuario.ultimo_acceso,
    });

  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

/**
 * ✅ Obtener usuario actual
 */
export const obtenerUsuarioActual = async (req, res) => {
  try {
    const { id } = req.usuario;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id_usuario', 'nombre', 'email', 'enabled', 'ultimo_acceso', 'minutos_uso'],
      include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre,
      enabled: usuario.enabled,
      ultimo_acceso: usuario.ultimo_acceso,
      minutos_uso: usuario.minutos_uso,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario actual', error });
  }
};

/**
 * ✅ Registrar Tiempo de Uso al cerrar sesión
 */


/**
 * ✅ Crear un usuario (admin)
 */
export const crearUsuario = async (req, res) => {
  const { nombre, email, password, id_rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ 
      nombre, 
      email, 
      password: hashedPassword, 
      id_rol,
      ultimo_acceso: null,
      minutos_uso: 0
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear usuario', error });
  }
};
