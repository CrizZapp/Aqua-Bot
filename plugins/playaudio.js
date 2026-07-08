import axios from 'axios';

const handler = async (m, { conn, from, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*⚠️ Uso correcto del comando:*\n${usedPrefix + command} <texto de búsqueda>`);
    }

    const query = args.join(' ');
    await m.reply('> ⏳ *Buscando...* ');

    try {
        const apikey = 'AETHER-a33ab1e6b9649a3d876571ad';
        const apiBaseUrl = 'https://aetherapi-i7fc.onrender.com';
        
        // Identificar si el comando solicitado es de audio o video
        const audioCommands = ['playaudio', 'mp3', 'ytmp3'];
        const isAudio = audioCommands.includes(command);
        const endpoint = isAudio ? '/api/ytmp3' : '/api/ytmp4';
        
        const response = await axios.get(`${apiBaseUrl}${endpoint}`, {
            params: {
                query: query,
                apikey: apikey
            }
        });

        const data = response.data;

        if (!data.status) {
            return m.reply(`❌ Error: No se pudo procesar la solicitud.`);
        }

        const infoTexto = `
*⚡ ⫷ ⒶⒺⓉⒽⒺⓇ ⒹⓄⓌⓃⓁⓄⒶⒹ ⫸ ⚡*

> ✦ *𝑻𝒊́𝒕𝒖𝒍𝒐:* ${data.title}
> ✦ *𝑫𝒖𝒓𝒂𝒄𝒊𝒐́𝒏:* ${data.duration}s
> ✦ *𝑭𝒐𝒓𝒎𝒂𝒕𝒐:* ${data.format} (${data.quality})
> ☁️ *Api: AetherApi*
> https://aetherapi-i7fc.onrender.com`;


        await conn.sendMessage(from, { 
            image: { url: data.thumbnail }, 
            caption: infoTexto 
        }, { quoted: m });

        // 2. Enviar el archivo multimedia correspondiente
        if (isAudio) {
            await conn.sendMessage(from, { 
                audio: { url: data.download_url }, 
                mimetype: 'audio/mp4',
                fileName: `${data.title}.mp3`
            }, { quoted: m });
        } else {
            await conn.sendMessage(from, { 
                video: { url: data.download_url }, 
                mimetype: 'video/mp4',
                fileName: `${data.title}.mp4`
            }, { quoted: m });
        }

    } catch (error) {
        console.error(`Error en el comando ${command}:`, error);
        m.reply('❌ No se pudo descargar el contenido. Intenta más tarde.');
    }
};

handler.command = ['play', 'playaudio', 'mp3', 'ytmp3', 'mp4', 'ytmp4'];
export default handler;
