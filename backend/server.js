require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
// Habilitamos CORS para permitir peticiones desde Vercel
app.use(cors());

// Configuración de la base de datos (PostgreSQL / Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint de prueba de conexión
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Tijuana en Acción Backend Operational' });
});

/**
 * ==========================================
 * Endpoints Públicos: CRUD de Reportes
 * ==========================================
 */

// OBTENER TODOS LOS REPORTES (Convertimos GEOMETRY PostGIS a Lat/Lng)
app.get('/api/reportes', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        categoria, 
        subcategoria, 
        descripcion, 
        estado, 
        prioridad,
        updated_at,
        ST_Y(coordenadas) as lat, 
        ST_X(coordenadas) as lng 
      FROM reportes
      ORDER BY updated_at DESC;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ error: 'Fallo al consultar base de datos espacial.' });
  }
});

// CREAR NUEVO REPORTE CIUDADANO (Geolocalizado)
app.post('/api/reportes', async (req, res) => {
  const { categoria, subcategoria, descripcion, lat, lng } = req.body;
  if (!categoria || !subcategoria || !descripcion || !lat || !lng) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o coordenadas.' });
  }

  try {
    // Insertamos transformando Lat/Long nativos de JS al SRID 4326 de PostGIS para querys de radar
    const query = `
      INSERT INTO reportes (categoria, subcategoria, descripcion, coordenadas)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING id, subcategoria, estado;
    `;
    // Nota: El Trigger automatizado en Supabase asignará el Estado y la Prioridad automáticamente.
    const result = await pool.query(query, [categoria, subcategoria, descripcion, lng, lat]);
    
    res.status(201).json({
      message: 'Reporte ingresado correctamente.',
      reporte: result.rows[0]
    });
  } catch (error) {
    console.error('Error insertando reporte:', error);
    res.status(500).json({ error: 'Error del servidor al procesar la denuncia.' });
  }
});

/**
 * ==========================================
 * Panel de Autoridad y Mantenimiento: Purga
 * ==========================================
 * Este endpoint es exclusivo para uso del administrador del sistema.
 * Objetivo: Limpiar de la base de datos todos los reportes con 
 * estatus "Resuelto" cuya última actualización sea mayor a 7 días.
 * 
 * NOTA: En un entorno de producción real, este endpoint debe ir detrás de 
 * un middleware de autenticación que verifique roles (ej. Admin Sindicatura).
 */
app.delete('/api/admin/purge', async (req, res) => {
  // Simulando validación sencilla (ej. via header)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_PURGE_TOKEN}`) {
    return res.status(403).json({ error: 'Acceso denegado. Credenciales inválidas.' });
  }

  try {
    // Consulta SQL para eliminar reportes Resueltos antiguos
    // Retorna los id's eliminados para trazabilidad
    const purgeQuery = `
      DELETE FROM reportes 
      WHERE estado = 'Resuelto' 
        AND updated_at < NOW() - INTERVAL '7 days'
      RETURNING id, subcategoria, updated_at;
    `;
    
    const result = await pool.query(purgeQuery);
    
    res.status(200).json({
      message: 'Operación de purga completada con éxito.',
      borrados_count: result.rowCount,
      registros_borrados: result.rows
    });
  } catch (error) {
    console.error('Error durante la purga de datos:', error);
    res.status(500).json({ error: 'Fallo interno en el servidor.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor Tijuana en Acción corriendo en el puerto ${PORT}`);
});
