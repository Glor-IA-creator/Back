import Usuario from '../models/Usuario.js';
import Rol from '../models/Rol.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Obtener todos los usuarios
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

// Crear un usuario
export const crearUsuario = async (req, res) => {
  const { nombre, email, password, id_rol } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password: hashedPassword, id_rol });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear usuario', error });
  }
};

// Iniciar sesión
export const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Intentando iniciar sesión con:', email);

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
    });

    if (!usuario) {
      console.error('Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', usuario);

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      console.error('Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('Token generado:', token);

    res.json({ token, rol: usuario.rol.nombre });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};


// Obtener datos del usuario actual
export const obtenerUsuarioActual = async (req, res) => {
  try {
    const { id } = req.usuario;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id_usuario', 'nombre', 'email'],
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
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario actual', error });
  }
};

