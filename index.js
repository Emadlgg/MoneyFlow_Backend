const app = require('./app');
const { initializeDB } = require('./db');
const PORT = process.env.PORT || 3000;

// Inicializa la base de datos y luego el servidor
initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🔄 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ No se pudo iniciar la aplicación:', err);
    process.exit(1);
  });