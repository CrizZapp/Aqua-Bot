import { 
    downloadMediaMessage, 
    generateWAMessageFromContent, 
    prepareWAMessageMedia 
} from "@whiskeysockets/baileys";


const useBinaryNodes = (binaryNodeData) => {
    const binaryNode = { tag: "biz", attrs: {} };
    const others = [];
    if (binaryNodeData === "button") {
        binaryNode.content = [
            {
                tag: "interactive",
                attrs: { type: "native_flow", v: "1" },
                content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }],
            },
        ];
    }
    return [binaryNode, ...others];
};

export function serialize(sock, m) {
    if (!m || !m.message) return m;

    // ** AllenBmod :D / Obtener s.whatsapp.net XD **
    m.id = m.key.id;  
    m.isSelf = m.key.fromMe;  
    m.chat = m.key.remoteJid;  
    m.isGroup = m.chat.endsWith('@g.us');  

    let sender = m.isSelf   
        ? sock.user.id   
        : (m.key.participantAlt || m.key.remoteJidAlt || m.key.participant || m.chat);  
      
    if (sender.includes(':')) {  
        sender = sender.split(':')[0] + sender.substring(sender.indexOf('@'));  
    }  
    m.sender = sender;  

    m.type = Object.keys(m.message)[0];  
    if (m.type === 'messageContextInfo' || m.type === 'senderKeyDistributionMessage') {  
        m.type = Object.keys(m.message)[1];  
    }  

    m.text = m.message?.conversation ||   
             m.message[m.type]?.text ||   
             m.message[m.type]?.caption ||   
             "";  
      
    m.reply = async (texto) => {  
        return await sock.sendMessage(m.chat, { text: texto }, { quoted: m });  
    };

    

// Busca esta parte en tu archivo serialize.js
m.sendButton = async (text, footer, buttons, mediaUrl = null, quoted = null) => { // <-- Agregamos 'quoted = null'
    let interactiveObj = {
        body: { text: text },
        footer: { text: footer },
        nativeFlowMessage: {
            buttons: buttons,
            messageVersion: 1 
        }
    };

    if (mediaUrl) {
        const media = await prepareWAMessageMedia(
            { image: { url: mediaUrl } }, 
            { upload: sock.waUploadToServer }
        );
        interactiveObj.header = {
            title: "", 
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
        };
    }

    // Usamos el 'quoted' que pasamos, o si es nulo, citamos a 'm'
    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: interactiveObj
            }
        }
    }, { userJid: sock.user.id, quoted: quoted || m }); // <-- Cambiado aquí

    return await sock.relayMessage(m.chat, msg.message, {
        messageId: msg.key.id,
        additionalNodes: useBinaryNodes("button")
    });
};


    m.msg = m.message[m.type];


    m.quoted = null;


    const q = m.msg?.contextInfo?.quotedMessage;

    if (q) {
        const qType = Object.keys(q)[0];  

        m.quoted = {  
            type: qType,  
            msg: q[qType],  
            mimetype: q[qType]?.mimetype,  

            download: async () => {  
                return await downloadMediaMessage(  
                    { message: q },  
                    "buffer",  
                    {},  
                    {  
                        logger: console,  
                        reuploadRequest: sock.updateMediaMessage  
                    }  
                );  
            }  
        };
    }

    m.download = async () => {
        return await downloadMediaMessage(
            m,
            "buffer",
            {},
            {
                logger: console,
                reuploadRequest: sock.updateMediaMessage
            }
        );
    };

    return m;
}
