/**
 * Пример конфигурации API
 * 
 * Скопируйте этот файл в config.ts и настройте под вашу сеть
 */

// Для веб-версии (браузер)
export const WEB_API_URL = 'http://localhost:8000/api';

// Для мобильных устройств (Android/iOS)
// ⚠️ ВАЖНО: Замените на IP адрес вашего компьютера в локальной сети!
// 
// Как узнать IP адрес:
// - Windows: откройте cmd и выполните `ipconfig`, найдите IPv4 адрес
// - Mac/Linux: откройте терминал и выполните `ifconfig` или `ip addr`
// 
// Пример: если ваш IP адрес 192.168.1.100, то:
export const MOBILE_API_URL = 'http://192.168.1.100:8000/api';

// Для продакшена
export const PRODUCTION_API_URL = 'https://your-api-domain.com/api';
