import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import figlet from "figlet";
import chalk from "chalk";
import { exec } from "child_process";
import readline from "readline";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { resumeSubBots } from "./subbot.js"; //nada

const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = baileys;

const makeWASocket = baileys.default;

const ok = chalk.green;
const info = chalk.cyan;
const warn = chalk.yellow;

global.plugins = {};
const pluginsDir = path.resolve("./plugins");

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, ans => {
    rl.close();
    resolve(ans);
  }));
};



async function loadPlugin(file) {
    try {
        const pluginPath = pathToFileURL(path.join(pluginsDir, file)).href;
        const module = await import(`${pluginPath}?update=${Date.now()}`);
        global.plugins[file] = module.default || module;
    } catch (e) {
        console.error(chalk.red(`[ERROR] ${file}`), e);
    }
}

async function loadPlugins() {
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
        return;
    }
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));
    for (const file of files) {
        await loadPlugin(file);
    }
}

function watchPlugins() {
    fs.watch(pluginsDir, async (eventType, filename) => {
        if (filename && filename.endsWith(".js")) {
            const filePath = path.join(pluginsDir, filename);
            if (fs.existsSync(filePath)) {
                await loadPlugin(filename);
                console.log(info(`Plugin recargado: ${filename}`));
            } else {
                delete global.plugins[filename];
                console.log(warn(`Plugin eliminado: ${filename}`));
            }
        }
    });
}



async function startBot() {
  console.clear();

  // 1. 
  // 2. 
const logo = figlet.textSync("Eclipsa\nBot", {
  font: "ANSI Shadow"
});

console.log(chalk.hex("#2E8B57")(logo));


  // 3. 
  await loadPlugins();
  watchPlugins();

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

 


  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  if (!sock.authState.creds.registered) {
    console.log(chalk.magenta("\n┌──────────────────────────────┐"));
    console.log(chalk.magenta("│      VINCULACIÓN WHATSAPP     │"));
    console.log(chalk.magenta("└──────────────────────────────┘\n"));

    let number = await question(info("➤ Número de WhatsApp: "));
    number = number.replace(/[^0-9]/g, "");

    console.log(warn("\n⏳ Generando código...\n"));

    const code = await sock.requestPairingCode(number);

    console.log(chalk.green("┌──────────────────────────────┐"));
    console.log(chalk.green("│        CÓDIGO GENERADO        │"));
    console.log(chalk.green("├──────────────────────────────┤"));
    console.log(chalk.white("│  " + code + "  │"));
    console.log(chalk.green("└──────────────────────────────┘\n"));
  }

    sock.ev.on("messages.upsert", async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;

   
    try {
        const { handler } = await import(`./handler.js?update=${Date.now()}`);
        await handler(sock, m, chatUpdate);
    } catch (error) {
        console.error(chalk.red("[ERROR EN HANDLER]"), error);
    }
  });




  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
      else process.exit(0);
    }

    if (connection === "open") {
      console.log(ok("Bot conectado correctamente"));
      exec("rm -rf tmp && mkdir tmp");
      resumeSubBots(sock); //
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();
