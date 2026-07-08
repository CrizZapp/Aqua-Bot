import { isOwner } from "../config.js";
import { exec } from "child_process";
import { promisify } from "util";

// Convertimos 'exec' a una promesa para usar async/await
const execPromise = promisify(exec);

const pullRepo = async (m, { args, usedPrefix, command, conn, from }) => {
  // 1. OBTENER ID DEL USUARIO
  const senderId = m.sender || m.key?.participant || m.key?.remoteJid;
  const id = senderId.split("@")[0];

  // 2. VERIFICAR SI ES OWNER
  if (!isOwner(id).check) {
    return await conn.sendMessage(
      from, 
      { text: "⛔ Solo owners tienen acceso a este comando." }, 
      { quoted: m }
    );
  }

  // 3. VERIFICAR ARGUMENTOS
  if (args.length < 2) {
    const usoMsg = `⚠️ *Uso incorrecto.*\n\nFormato: *${usedPrefix}${command} <nombre_carpeta> <link_repo>*\nEjemplo: *${usedPrefix}${command} Abrahaham https://github.com/CrizZapp/Abram-Bot.git*`;
    return await conn.sendMessage(from, { text: usoMsg }, { quoted: m });
  }

  const folderName = args[0];
  const repoLink = args[1];

  // 4. SEGURIDAD: Evitar inyección de comandos en el nombre de la carpeta
  if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
    return await conn.sendMessage(
      from, 
      { text: "⚠️ El nombre de la carpeta contiene caracteres inválidos. Usa solo letras, números, guiones o guiones bajos." }, 
      { quoted: m }
    );
  }

  // Comprobar que realmente es un enlace
  if (!repoLink.startsWith("http")) {
    return await conn.sendMessage(
      from, 
      { text: "⚠️ Por favor, ingresa un enlace válido (https://...)." }, 
      { quoted: m }
    );
  }

  // 5. AVISO DE CLONACIÓN
  const waitMsg = `⏳ Clonando el repositorio...\n\n🔗 Repo: ${repoLink}\n📂 Carpeta destino: \`${folderName}\``;
  await conn.sendMessage(from, { text: waitMsg }, { quoted: m });
  await conn.sendMessage(from, { react: { text: '🕒', key: m.key } });

  // 6. EJECUTAR GIT CLONE
  try {
    // Ejecuta "git clone <link> <carpeta>" en la terminal
    await execPromise(`git clone ${repoLink} ${folderName}`);
    
    const successMsg = `✅ *¡Éxito!*\n\nEl repositorio se ha clonado correctamente dentro de la carpeta \`${folderName}\`.`;
    await conn.sendMessage(from, { text: successMsg }, { quoted: m });
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    
  } catch (error) {
    console.error(`[ERROR PULL]`, error);
    const errorMsg = `❌ Ocurrió un error al intentar clonar el repositorio:\n\n_${error.message}_`;
    await conn.sendMessage(from, { text: errorMsg }, { quoted: m });
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } }).catch(() => {});
  }
};

pullRepo.command = ["pull"];

export default pullRepo;
