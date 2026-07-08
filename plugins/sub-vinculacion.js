import { startSubBot } from "../subbot.js";

const serbot = async (m, { conn, args }) => {
    
    let number = args[0] ? args[0].replace(/[^0-9]/g, "") : m.sender.split("@")[0];
    
    const msg = await m.reply(`> *✧ VINCULACIÓN DE SUB BOT ✧*

> *Preparando codigo.*
> El bot esta listo y activo.
> Generando codigo de vinculación.
> ━━━━━━━━━━━━❂

> Instrucciones.
> ➪ 𝐀𝐛𝐫𝐞 “dispositivos vinculados",
> ➪ Presiona los tres puntitos,
> ➪ ingresa el codigo,
> ➪ Disfruta del bot.
> ━━━━━━━━━━━❂`);

    setTimeout(() => {
        conn.sendMessage(m.chat, {
            delete: msg.key
        });
    }, 60000);
    
    await startSubBot(conn, m, number);
};

serbot.command = ['serbot', 'jadibot', 'code'];

export default serbot;
