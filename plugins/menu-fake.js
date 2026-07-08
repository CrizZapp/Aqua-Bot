const menu = async (m, { usedPrefix }) => {
    const estadoFalso = {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "ADVERT",
            participant: "0@s.whatsapp.net"
        },
        message: {
            locationMessage: {
                degreesLatitude: -12.046374,
                degreesLongitude: -77.042793,
                name: "WhatsApp ✔️ • Estado",
                address: "📍 𝑬𝐜𝐥𝐢𝔭𝒔𝖆 𝘽o̾t̆̈"
            }
        }
    };


    const buttons = [
        {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
                title: "📂 𝕸𝖊𝖓𝖚́ 𝕯𝖊 𝕮𝖔𝖒𝖆𝖓𝖉𝖔𝖘",
                sections: [
                    {
                        title: "🌟 𝕻𝖗𝖎𝖓𝖈𝖎𝖕𝖆𝖑",
                        rows: [
                            { title: "📜 𝕸𝖊𝖓𝖚́ 𝖉𝖊 𝖆𝖞𝖚𝖉𝖆", description: "𝕸𝖚𝖊𝖘𝖙𝖗𝖆 𝖑𝖆 𝖑𝖎𝖘𝖙𝖆 𝖈𝖔𝖒𝖕𝖑𝖊𝖙𝖆.", id: `${usedPrefix}menu` }
                        ]
                    },
                    {
                        title: "⬇️ 𝕯𝖊𝖘𝖈𝖆𝖗𝖌𝖆𝖘",
                        rows: [
                            { title: "🎵 𝕻𝖑𝖆𝖞 𝕬𝖚𝖉𝖎𝖔", description: "𝕯𝖊𝖘𝖈𝖆𝖗𝖌𝖆 𝖒𝖚́𝖘𝖎𝖈𝖆 𝖞 𝖛𝖎𝖉𝖊𝖔𝖘.", id: `${usedPrefix}play` },
                            { title: "📘 𝕱𝖆𝖈𝖊𝖇𝖔𝖔𝖐", description: "𝕯𝖊𝖘𝖈𝖆𝖗𝖌𝖆 𝖛𝖎𝖉𝖊𝖔𝖘 𝖉𝖊 𝕱𝕭.", id: `${usedPrefix}fb` }
                        ]
                    }
                ]
            })
        },
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "📜 ☀️ 𝐌𝐞𝐧𝐮 𝐌𝐚𝐧𝐮𝐚𝐥 ☀️📜",
                id: `${usedPrefix}menutxt`
            })
        }
    ];

    
    const texto = `✿ *Hola, Soy Eclipsa Butterfly, Este es mi menu 🌗 𝟹𝟹 ✿*\n\n ֺ ˳ּ𑁍 ׁ 🌑 〫࣫〇ׁ┄─ׁ─ׁ┉─ׁ┉ׅ─˳ּ𑁍 ┉ׁ─ׅ─ׁ┉ׁ─ׁ┄〇 ׁ🌕 𑁍 ׁ ׅ\n \n✎˚₊· ͟͟͞͞➳❥ *Prefijo* : [ ${usedPrefix} ]\n✥˚₊· ͟͟͞͞➳❥ *Creador/a:* ✵ ☾Ƹ̵ 𝐘𝖔𝖗𝐮 𝕋𝐬𝐮𝚔i Ʒ☽ ✵\n*◤ Menu:* `;
    const footer = "🌙 𝑬𝐜𝐥𝐢𝔭𝒔𝖆 𝘽o̾t̆̈ 🌙";
    const imgUrl = "https://yoru-box.onrender.com/1783106706769";


        await m.sendButton(texto, footer, buttons, imgUrl, estadoFalso);
};

menu.command = ["menu", "help"];

export default menu;
