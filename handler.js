import chalk from "chalk";
import { serialize } from "./lib/Bmod.js";

export const handler = async (sock, rawM) => {
    if (!rawM || !rawM.message) return;

    const m = serialize(sock, rawM);

    const conn = sock;
    const from = m.chat;
    const sender = m.sender;

    const usedPrefix = "`";

    // Texto normal
    let body = m.text || "";

    // Si vino de un botón
    if (!body) {
        const params = rawM.message?.interactiveResponseMessage
            ?.nativeFlowResponseMessage?.paramsJson;

        if (params) {
            try {
                body = JSON.parse(params).id || "";
            } catch (e) {}
        }
    }

    if (!body.startsWith(usedPrefix)) return;

    const [cmdName, ...args] = body
        .slice(usedPrefix.length)
        .trim()
        .split(/\s+/);

    const command = cmdName.toLowerCase();

    if (!global.plugins || typeof global.plugins !== "object") return;

    const plugin = Object.values(global.plugins).find(p =>
        p.command &&
        (Array.isArray(p.command)
            ? p.command.includes(command)
            : p.command === command)
    );

    if (!plugin) return;

    try {
        await plugin(m, {
    conn,
    from,
    sender,
    usedPrefix,
    args,
    command,
    rawM
});
    } catch (e) {
        console.error(chalk.red(`[ERROR ${command}]`));
        console.error(e);
        await m.reply("Error ejecutando comando");
    }
};