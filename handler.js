global.doxWait = global.doxWait || {};

export async function handler(sock, m, chatUpdate) {
    const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
    const sender = m.key.remoteJid;
    const participant = m.key.participant || sender; 

    if (!body) return;

    // Si el usuario ya había escrito "dox", este mensaje se toma como el número
    if (global.doxWait[participant]) {
        const numeroIngresado = body.trim();

        if (global.plugins["dox.js"]) {
            await global.plugins["dox.js"].execute(sock, m, numeroIngresado);
        } else {
            await sock.sendMessage(sender, { text: "❌ Error: Plugin dox.js no cargado." }, { quoted: m });
        }

        delete global.doxWait[participant];
        return;
    }

    // Comando principal para iniciar
    if (body.toLowerCase() === "dox") {
        global.doxWait[participant] = true;
        await sock.sendMessage(sender, { 
            text: "Ingresa el número:\nEjemplo: +523313002435 o 523313002435" 
        }, { quoted: m });
        return;
    }
}
