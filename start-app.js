// Скрипт для запуска приложения в среде Replit
import { spawn } from 'child_process';

function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] [start-app] ${message}`);
}

log('Запуск приложения...');

// Запускаем сервер
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('Ошибка запуска сервера:', error);
  process.exit(1);
});

// Обработка сигналов завершения
process.on('SIGINT', () => {
  log('Получен сигнал SIGINT, завершаем работу...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Получен сигнал SIGTERM, завершаем работу...');
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('close', (code) => {
  log(`Сервер завершил работу с кодом ${code}`);
  process.exit(code);
});