const upload = async (m, { conn, from }) => {

    const msg = m.quoted || m;
    const mime = msg.mimetype || msg.mediaType || "";

    if (!/image/.test(mime)) {
        return m.reply("❌ Responde a una imagen o envíala junto al comando.");
    }

    try {
        const buffer = await msg.download();
        const base64 = `data:${mime};base64,${buffer.toString("base64")}`;

        const res = await fetch("https://yoru-box.onrender.com/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: base64,
                name: `img_${Date.now()}.png`
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const buttons = [
            {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 Copiar enlace",
                    copy_code: json.url
                })
            }
        ];

        const texto = "✅ *Imagen subida correctamente.*\n\nPulsa el botón de abajo para copiar el enlace.";
        const footer = "Yoru Box ⚡ | 𝑬𝐜𝐥𝐢𝔭𝒔𝖆 𝘽o̾t̆̈";
        
        const imgUrl = json.url; 

        await m.sendButton(texto, footer, buttons, imgUrl);

    } catch (e) {
        console.error(e);
        m.reply("❌ Error al subir la imagen.");
    }

};

upload.command = ["tourl", "imgurl", "upload"];

export default upload;
