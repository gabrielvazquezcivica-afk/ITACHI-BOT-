//Codigo Original De MediaHub Correccion V.2.0 No Eliminar Marca Ni Copiar Código, Adaptado Solo Para Sasuke Bot

import fetch from "node-fetch";
import axios from 'axios';

const VIDEO_THRESHOLD = 80 * 1024 * 1024;
const HEAVY_FILE_THRESHOLD = 100 * 1024 * 1024;
const REQUEST_LIMIT = 2;
const REQUEST_WINDOW_MS = 10000;
const COOLDOWN_MS = 120000;

const requestTimestamps = [];
let isCooldown = false;
let isProcessingHeavy = false;

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0'
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

const isValidYouTubeUrl = (url) =>
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url);

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  bytes = Number(bytes);
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.head(url, {
        headers: { 'User-Agent': getRandomUserAgent() },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: status => status < 500
      });
      
      const size = parseInt(response.headers['content-length'], 10);
      if (size && !isNaN(size)) return size;
      
      const rangeResponse = await axios.get(url, {
        headers: { 
          'User-Agent': getRandomUserAgent(),
          'Range': 'bytes=0-0'
        },
        timeout: 5000,
        maxRedirects: 5,
        validateStatus: status => status < 500
      });
      
      const contentRange = rangeResponse.headers['content-range'];
      if (contentRange) {
        const totalSize = contentRange.split('/')[1];
        if (totalSize && totalSize !== '*') {
          const parsedSize = parseInt(totalSize, 10);
          if (!isNaN(parsedSize)) return parsedSize;
        }
      }
      
      return null;
    } catch (e) {
      if (i === retries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
}

async function ytdl(url) {
  const headers = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': getRandomUserAgent(),
    'sec-ch-ua': '"Chromium";v="132", "Not A(Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    referer: 'https://id.ytmp3.mobi/',
    'referrer-policy': 'strict-origin-when-cross-origin'
  };

  try {
    const initRes = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers });
    if (!initRes.ok) throw new Error('Fallo al inicializar la solicitud');
    const init = await initRes.json();

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
    if (!videoId) throw new Error('ID de video no encontrado');

    const convertRes = await fetch(`${init.convertURL}&v=${videoId}&f=mp4&_=${Date.now()}`, { headers });
    if (!convertRes.ok) throw new Error('Fallo al convertir el video');
    const convert = await convertRes.json();

    let info;
    for (let i = 0; i < 3; i++) {
      const progressRes = await fetch(convert.progressURL, { headers });
      if (!progressRes.ok) throw new Error('Fallo al obtener el progreso');
      info = await progressRes.json();
      if (info.progress === 3) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!info || !convert.downloadURL) throw new Error('No se pudo obtener la URL de descarga');
    return { url: convert.downloadURL, title: info.title || 'Video sin título' };
  } catch (e) {
    throw new Error(`Error en la descarga: ${e.message}`);
  }
}

const checkRequestLimit = () => {
  const now = Date.now();
  requestTimestamps.push(now);
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > REQUEST_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= REQUEST_LIMIT) {
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
      requestTimestamps.length = 0;
    }, COOLDOWN_MS);
    return false;
  }
  return true;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `👉 Uso: ${usedPrefix}${command} https://youtube.com/watch?v=iQEVguV71sI`, m);
  }

  if (!isValidYouTubeUrl(text)) {
    await m.react('🔴');
    return m.reply('🚫 Enlace de YouTube inválido');
  }

  if (isCooldown || !checkRequestLimit()) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Demasiadas solicitudes rápidas. Por favor, espera 2 minutos.', m);
  }
  if (isProcessingHeavy) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Espera, estoy procesando un archivo pesado.', m);
  }

  await m.react('📀');
  try {
    const { url, title } = await ytdl(text);
    const size = await getSize(url);

    if (!size) {
      await m.react('⚠️');
      const buffer = await (await fetch(url, { headers: { 'User-Agent': getRandomUserAgent() } })).buffer();
      const caption = `*💌 ${title}*\n> ⚖️ Peso: Desconocido\n> 🌎 URL: ${text}`;
      
      await conn.sendFile(
        m.chat,
        buffer,
        `${title}.mp4`,
        caption,
        m,
        null,
        {
          mimetype: 'video/mp4',
          asDocument: false,
          filename: `${title}.mp4`
        }
      );
      
      await m.react('🟢');
      return;
    }

    if (size > HEAVY_FILE_THRESHOLD) {
      isProcessingHeavy = true;
      await conn.reply(m.chat, 'Archivo Pesado Puede Tardar Un Poco Por Favor Espera', m);
    }

    await m.react('✅️');
    const caption = `*💌 ${title}*\n> ⚖️ Peso: ${formatSize(size)}\n> 🌎 URL: ${text}`;
    const isSmallVideo = size < VIDEO_THRESHOLD;

    const buffer = await (await fetch(url, { headers: { 'User-Agent': getRandomUserAgent() } })).buffer();
    await conn.sendFile(
      m.chat,
      buffer,
      `${title}.mp4`,
      caption,
      m,
      null,
      {
        mimetype: 'video/mp4',
        asDocument: !isSmallVideo,
        filename: `${title}.mp4`
      }
    );

    await m.react('🟢');
    isProcessingHeavy = false;
  } catch (e) {
    await m.react('🔴');
    await m.reply(`❌ Error: ${e.message || 'No se pudo procesar la solicitud'}`);
    isProcessingHeavy = false;
  }
};

handler.help = ['ytmp4 <URL>'];
handler.command = ['ytmp4'];
handler.tags = ['descargas'];
handler.diamond = true;

export default handler;
