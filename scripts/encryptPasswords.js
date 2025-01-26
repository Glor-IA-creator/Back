import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js'; // Ruta al modelo de Usuario
import db from '../database/db.js'; // Ruta a la conexión de la base de datos

(async () => {
    try {
      // Conectar a la base de datos
      await db.authenticate();
      console.log('Conexión exitosa con la base de datos.');
  
      // Obtener todos los usuarios
      const usuarios = await Usuario.findAll();
  
      for (const usuario of usuarios) {
        // Verificar si la contraseña ya está encriptada
        if (!usuario.password.startsWith('$2b$')) {
          // Encriptar la contraseña
          const hashedPassword = await bcrypt.hash(usuario.password, 10);
          usuario.password = hashedPassword;
  
          // Guardar los cambios
          await usuario.save();
          console.log(`Contraseña actualizada para el usuario: ${usuario.email}`);
        } else {
          console.log(`Contraseña ya encriptada: ${usuario.email}`);
        }
      }
  
      console.log('Proceso de encriptación completado.');
    } catch (error) {
      console.error('Error en el proceso de encriptación:', error); // Log completo del error
      process.exit(1);
    } finally {
      await db.close();
    }
  })();
  