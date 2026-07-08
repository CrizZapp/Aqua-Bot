import fetch from "node-fetch";

async function fetchBuf(url, ms = 180000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function getFbInfo(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  try {
    // API y Token actualizados para Facebook
    const apiUrl = `https://natsu-api.darkcore.xyz/api/facebook?token=Natsu-32626af3ca7fbbed&url=${encodeURIComponent(url)}`;
    
    const res = await fetch(apiUrl, {
      method: 'GET', 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
      signal: ctrl.signal,
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    
    // Verificamos si la API devuelve estado exitoso
    if (!data.status) return null;

    // Algunas APIs de FB separan en calidades (HD/SD) o usan 'url', probamos encontrar la mejor
    const videoUrl = data.url || data.hd || data.sd || data.videoUrl;
    
    if (!videoUrl) return null;
    
    return { 
        title: (data.title || data.info?.title || '').trim(), 
        videoUrl: videoUrl 
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const fb = async (m, { sender, from, usedPrefix, command, args, conn }) => {
    const text = args.join(" ").trim();

    if (!text) {
        return m.reply(`⚠️ *Formato incorrecto.*\nUso: ${usedPrefix}${command} <link de Facebook>`);
    }

    try {
        await conn.sendMessage(from, { react: { text: '🕒', key: m.key } });

        const info = await getFbInfo(text);

        if (!info || !info.videoUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return await m.reply("❌ *No se encontró video en este enlace, el formato no es compatible o el post es privado.*");
        }

        let txt = `「✦」*Facebook Download*\n\n`;
        if (info.title) {
            txt += `> 📝 *Descripción:* ${info.title}\n`;
        }
        txt += `> 🜸 *Link original:* ${text}`;

        const videoBuf = await fetchBuf(info.videoUrl);

        if (videoBuf) {
            await conn.sendMessage(from, {
                video: videoBuf,
                caption: txt,
                mimetype: 'video/mp4'
            }, { quoted: m });
            
            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            await m.reply('❌ *Falló la descarga del video.*');
        }

    } catch (e) {
        console.error(e);
        await m.reply("❌ *Error interno al procesar el comando.*");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {});
    }
};

fb.command = ["fb", "facebook"];

export default fb;
