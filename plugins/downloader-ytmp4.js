//Codigo Original De MediaHub Correccion V.2.0.0 No Eliminar Marca Ni Copiar Código, Adaptado Solo Para Sasuke Bot,Prohibido Copiar Si Quieren Arreglar Sus Bots Bug Usen Otros Codigos ..

import fetch from "node-fetch";
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE = 600 * 1024 * 1024;
const VIDEO_THRESHOLD = 70 * 1024 * 1024;
const HEAVY_FILE_THRESHOLD = 100 * 1024 * 1024;
const REQUEST_LIMIT = 3;
const REQUEST_WINDOW_MS = 10000;
const COOLDOWN_MS = 120000;
const TIMEOUT = 60000;
const MAX_ATTEMPTS = 3;

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const requestTimestamps = [];
let isCooldown = false;
let isProcessingHeavy = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeFilename = (filename) => filename.replace(/[<>:"/\\|?*]/g, '').slice(0, 100);

const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtime.getTime() > 10 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Archivo temporal eliminado: ${file}`);
      }
    });
  } catch (error) {
    console.error('❌ Error limpiando archivos temporales:', error.message);
  }
};

const isValidYouTubeUrl = (url) => {
  const patterns = [
    /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(?:https?:\/\/)?(?:www\.|m\.)?youtu\.be\/[\w-]+/,
    /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/[\w-]+/,
    /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/v\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
};

function formatSize(bytes) {
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  bytes = Number(bytes);
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

const getVideoInfo = async (url) => {
  try {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*watch\?v=))([^&?/\s]+)/)?.[1];
    if (!videoId) throw new Error('No se pudo extraer el ID del video');

    const infoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    try {
      const response = await axios.get(infoUrl, { timeout: 10000 });
      return {
        id: videoId,
        title: response.data.title || 'Video de YouTube',
        thumbnail: response.data.thumbnail_url || null,
        author: response.data.author_name || 'Desconocido'
      };
    } catch (error) {
      console.warn('⚠️ No se pudo obtener información del video');
      return { id: videoId, title: 'Video de YouTube', thumbnail: null, author: 'Desconocido' };
    }
  } catch (error) {
    throw new Error('URL de YouTube inválida');
  }
};

async function ytdl(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'Referer': 'https://id.ytmp3.mobi/',
    'Origin': 'https://id.ytmp3.mobi'
  };

  try {
    console.log('🔄 Iniciando conversión...');
    
    const initRes = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers, timeout: TIMEOUT });
    if (!initRes.ok) throw new Error(`Error en inicialización: ${initRes.status}`);
    
    const init = await initRes.json();
    if (!init?.convertURL) throw new Error('No se pudo inicializar');

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*watch\?v=))([^&?/\s]+)/)?.[1];
    if (!videoId) throw new Error('No se pudo extraer el ID del video');

    console.log(`📹 ID: ${videoId}`);

    const convertUrl = `${init.convertURL}&v=${videoId}&f=mp4&_=${Date.now()}`;
    const convertRes = await fetch(convertUrl, { headers, timeout: TIMEOUT });
    if (!convertRes.ok) throw new Error(`Error en conversión: ${convertRes.status}`);
    
    const convert = await convertRes.json();
    if (!convert?.downloadURL || !convert?.progressURL) throw new Error('No se obtuvieron URLs');

    console.log('🔄 Esperando conversión...');

    let info = null;
    let attempts = 0;
    const maxProgressAttempts = 10;

    while (attempts < maxProgressAttempts) {
      try {
        const progressRes = await fetch(convert.progressURL, { headers, timeout: 30000 });
        if (!progressRes.ok) throw new Error(`Error en progreso: ${progressRes.status}`);
        
        info = await progressRes.json();
        console.log(`📊 Progreso: ${info?.progress || 'Desconocido'}`);
        
        if (info?.progress === 3) {
          console.log('✅ Conversión completada');
          break;
        }
        
        attempts++;
        await wait(2000);
      } catch (progressError) {
        console.warn(`⚠️ Error progreso (intento ${attempts + 1}):`, progressError.message);
        attempts++;
        await wait(3000);
      }
    }

    if (!convert.downloadURL) throw new Error('No se obtuvo URL de descarga');

    return {
      url: convert.downloadURL,
      title: info?.title || 'Video de YouTube',
      duration: info?.duration || null,
      size: info?.size || null
    };
  } catch (error) {
    console.error('❌ Error en ytdl:', error.message);
    throw new Error(`Error de conversión: ${error.message}`);
  }
}

const downloadVideoFile = async (url, filename = 'video.mp4') => {
  try {
    console.log(`📥 Descargando: ${url.substring(0, 50)}...`);
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 120000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      maxRedirects: 10
    });

    const totalSize = parseInt(response.headers['content-length'] || '0', 10);
    console.log(`📊 Tamaño: ${formatSize(totalSize)}`);

    if (totalSize > MAX_FILE_SIZE) throw new Error(`Archivo muy grande: ${formatSize(totalSize)}`);

    const chunks = [];
    let downloadedSize = 0;
    let lastProgress = 0;

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        chunks.push(chunk);
        downloadedSize += chunk.length;
        
        if (totalSize > 0) {
          const progress = Math.floor((downloadedSize / totalSize) * 100);
          if (progress >= lastProgress + 10) {
            console.log(`📊 Descarga: ${progress}% (${formatSize(downloadedSize)})`);
            lastProgress = progress;
          }
        }
      });

      response.data.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`✅ Descarga completada: ${formatSize(buffer.length)}`);
        resolve(buffer);
      });

      response.data.on('error', (error) => {
        console.error('❌ Error descarga:', error.message);
        reject(error);
      });

      setTimeout(() => {
        response.data.destroy();
        reject(new Error('Timeout de descarga'));
      }, 300000);
    });
  } catch (error) {
    console.error('❌ Error en downloadVideoFile:', error.message);
    throw error;
  }
};

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
      console.log('🔄 Cooldown terminado');
    }, COOLDOWN_MS);
    return false;
  }
  return true;
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  cleanupTempFiles();

  if (!text?.trim()) {
    return conn.reply(m.chat, `🎥 *Uso*: ${usedPrefix}${command} <URL de YouTube>\n*Ejemplo*: ${usedPrefix}${command} https://youtube.com/watch?v=dQw4w9WgXcQ`, m);
  }

  if (!isValidYouTubeUrl(text.trim())) {
    await m.react('🔴');
    return conn.reply(m.chat, '🚫 URL de YouTube inválida.', m);
  }

  if (isCooldown || !checkRequestLimit()) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Demasiadas solicitudes. Espera 2 minutos.', m);
  }

  if (isProcessingHeavy) {
    await m.react('🔴');
    return conn.reply(m.chat, '⏳ Procesando archivo pesado. Espera.', m);
  }

  const videoUrl = text.trim();
  
  try {
    await m.react('🔍');
    
    console.log(`🔍 Obteniendo info: ${videoUrl}`);
    const videoInfo = await getVideoInfo(videoUrl);
    console.log(`📹 Video: ${videoInfo.title}`);

    const initialMessage = `🎬 *${videoInfo.title}*\n👤 *Canal*: ${videoInfo.author}\n🔄 *Estado*: Preparando...\n⏳ Procesando...`;
    await conn.reply(m.chat, initialMessage, m);
    await m.react('🔄');

    let downloadData = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${MAX_ATTEMPTS}`);
        downloadData = await ytdl(videoUrl);
        if (downloadData?.url) {
          console.log('✅ URL obtenida');
          break;
        }
      } catch (error) {
        console.error(`❌ Intento ${attempt} falló:`, error.message);
        if (attempt === MAX_ATTEMPTS) throw new Error('No se pudo obtener URL de descarga.');
        await wait(2000);
      }
    }

    if (!downloadData?.url) throw new Error('No se obtuvo URL válida.');

    let fileSize = 0;
    try {
      const headResponse = await axios.head(downloadData.url, { timeout: 15000, maxRedirects: 5 });
      fileSize = parseInt(headResponse.headers['content-length'] || '0', 10);
      console.log(`📊 Tamaño: ${formatSize(fileSize)}`);

      if (fileSize > MAX_FILE_SIZE) throw new Error(`Archivo muy grande (${formatSize(fileSize)}). Max: ${formatSize(MAX_FILE_SIZE)}`);

      if (fileSize > HEAVY_FILE_THRESHOLD) {
        isProcessingHeavy = true;
        await conn.reply(m.chat, '📦 Archivo pesado. Tardará más...', m);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo verificar tamaño:', error.message);
    }

    await m.react('📥');

    console.log('📥 Descargando...');
    const videoBuffer = await downloadVideoFile(downloadData.url, sanitizeFilename(downloadData.title));

    if (!videoBuffer || videoBuffer.length === 0) throw new Error('Descarga vacía.');

    const actualSize = videoBuffer.length;
    const isSmallVideo = actualSize < VIDEO_THRESHOLD;

    console.log(`📊 Descargado: ${formatSize(actualSize)}`);
    console.log(`📤 Enviando como: ${isSmallVideo ? 'Video' : 'Documento'}`);

    await m.react('📤');

    const caption = `🎬 *${downloadData.title}*\n👤 *Canal*: ${videoInfo.author}\n⚖️ *Tamaño*: ${formatSize(actualSize)}\n🔗 *URL*: ${videoUrl}\n> © MediaHub™ Codigo Con Licencia Para Sasuke`;

    await conn.sendFile(
      m.chat,
      videoBuffer,
      `${sanitizeFilename(downloadData.title)}.mp4`,
      caption,
      m,
      null,
      {
        mimetype: 'video/mp4',
        asDocument: !isSmallVideo,
        filename: `${sanitizeFilename(downloadData.title)}.mp4`
      }
    );

    await m.react('🟢');
    isProcessingHeavy = false;
    console.log('🎉 Completado');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await m.react('🔴');
    isProcessingHeavy = false;

    const getErrorMessage = (error) => {
      const msg = error.message.toLowerCase();
      if (msg.includes('network') || msg.includes('getaddrinfo')) return '🌐 Sin conexión.';
      if (msg.includes('timeout')) return '⏱️ Timeout. Intenta de nuevo.';
      if (msg.includes('403') || msg.includes('forbidden')) return '🚫 Acceso denegado.';
      if (msg.includes('429') || msg.includes('rate limit')) return '🚦 Demasiadas solicitudes.';
      if (msg.includes('404') || msg.includes('not found')) return '❓ Video no encontrado.';
      if (msg.includes('demasiado grande') || msg.includes('muy grande')) return '📦 Archivo muy pesado.';
      if (msg.includes('inválida')) return '🔗 URL inválida.';
      if (msg.includes('privado') || msg.includes('private')) return '🔒 Video privado.';
      if (msg.includes('edad') || msg.includes('age')) return '🔞 Restricción de edad.';
      return `🚨 Error: ${error.message}`;
    };

    await m.reply(getErrorMessage(error));
  }
};

handler.help = ['ytmp4 <URL>'];
handler.command = ['ytmp4'];
handler.tags = ['descargas'];
handler.diamond = true;

export default handler;
