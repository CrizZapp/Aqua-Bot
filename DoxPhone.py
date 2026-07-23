import { exec } from "child_process";

export async function execute(sock, m, numero) {
    const sender = m.key.remoteJid;

    const pasosHacker = [
        "[+] Iniciando escaneo...",
        "[+] Analizando estructura...",
        "[+] Consultando base de datos local..."
    ];

    let msgRef = await sock.sendMessage(sender, { text: pasosHacker[0] }, { quoted: m });

    for (let i = 1; i < pasosHacker.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await sock.sendMessage(sender, { text: pasosHacker[i], edit: msgRef.key });
    }

    const parseTarget = numero.startsWith("+") ? numero : `+${numero}`;

    exec(`python3 DoxPhone.py "${parseTarget}"`, async (error, stdout, stderr) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (error || stdout.includes("ERROR_FORMATO") || stdout.includes("ERROR_NUMERO")) {
            await sock.sendMessage(sender, { 
                text: "❌ Número inválido o mal formateado.", 
                edit: msgRef.key 
            });
            return;
        }

        // Envolvemos el reporte en ``` para que WhatsApp use fuente fija y no se deforme
        const reporteWhatsApp = "```\n" + stdout.trim() + "\n```";

        await sock.sendMessage(sender, { text: reporteWhatsApp, edit: msgRef.key });
    });
}
