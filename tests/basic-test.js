// Импортируем зависимости
import http from 'k6/http';
import { check } from 'k6';
import * as config from '../config.js';

// Определяем опции (этапы)
export const options = {
  vus: 1,
  iterations: 1,
}

// Определяем функцию инициализации сценария
export default function () {
  // Формируем Get-запрос
  const req1 = {
    // Определяем метод и endpoint
    method: 'GET',
    url: config.API_URL + config.API_GET,
    // В параметрах определяем тип контента и передаём токен
    params: {
      headers: {
        'Content-Type': 'text/html',
        'token': 'test',
      },
    },
  };

  // Получаем токен из Get запроса и записываем его в константу
  const token = req1.params.headers.token;

  // Формируем Post-запрос
  const req2 = {
    // Определяем метод и endpoint
    method: 'POST',
    url: config.API_URL + config.API_POST,
    // Передаём полученный из Get-запроса токен в тело Post-запроса
    body: {
      token,
    },
    // В параметрах определяем тип контента
    params: {
      headers: { 'Content-Type': 'application/json' },
    },
  };

  // Пакетируем Get и Post HTTP-запросы вместе
  const responses = http.batch([req1, req2]);

  // Проверяем авторизацию (соответствие полученного токена и токена из файла config.js)
  check(responses[1], {
    'Authorization OK': (res) => JSON.parse(res.body).data === config.TOKEN,
  });

  // Получаем URL для последующего вывода его в консоли
  const getUrl = JSON.parse(responses[0].body).url;

  // Выводим в консоли URL (для удобства чтения, сделал вывод URL зелёным цветом)  
  console.info(`\x1b[42m\x1b[33m URL: ${getUrl}`);
}