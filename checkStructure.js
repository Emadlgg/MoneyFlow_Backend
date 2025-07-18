const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estructura del proyecto Backend...\n');

const checkFile = (filePath, description) => {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
};

const checkDir = (dirPath, description) => {
  const exists = fs.existsSync(dirPath);
  console.log(`${exists ? '📁' : '❌'} ${description}: ${dirPath}`);
  return exists;
};

console.log('📋 ESTRUCTURA REQUERIDA:');
console.log('='.repeat(40));

// Verificar directorios
checkDir('services', 'Directorio de servicios');
checkDir('tests', 'Directorio de tests');
checkDir('tests/services', 'Directorio de tests de servicios');

console.log('\n📄 ARCHIVOS DE SERVICIOS:');
console.log('-'.repeat(40));

// Verificar servicios
checkFile('services/authService.js', 'Servicio de autenticación');
checkFile('services/transactionService.js', 'Servicio de transacciones');

console.log('\n🧪 ARCHIVOS DE TESTS:');
console.log('-'.repeat(40));

// Verificar tests
checkFile('tests/setup.js', 'Configuración de tests');
checkFile('tests/basic.test.js', 'Tests básicos');
checkFile('tests/services/supabase.test.js', 'Tests de Supabase');
checkFile('tests/services/authService.test.js', 'Tests del servicio de auth');
checkFile('tests/services/transactionService.test.js', 'Tests del servicio de transacciones');

console.log('\n🚫 VERIFICAR QUE NO EXISTAN AQUÍ:');
console.log('-'.repeat(40));

// Verificar que no estén en lugares incorrectos
const wrongPlace1 = fs.existsSync('services/authService.test.js');
const wrongPlace2 = fs.existsSync('services/transactionService.test.js');

console.log(`${wrongPlace1 ? '❌' : '✅'} ${wrongPlace1 ? 'MOVER' : 'Correcto'}: services/authService.test.js`);
console.log(`${wrongPlace2 ? '❌' : '✅'} ${wrongPlace2 ? 'MOVER' : 'Correcto'}: services/transactionService.test.js`);

if (wrongPlace1 || wrongPlace2) {
  console.log('\n🔧 COMANDOS PARA ARREGLAR:');
  if (wrongPlace1) console.log('move services\\authService.test.js tests\\services\\');
  if (wrongPlace2) console.log('move services\\transactionService.test.js tests\\services\\');
}

console.log('\n' + '='.repeat(40));
console.log('🎯 Para continuar: npm test');