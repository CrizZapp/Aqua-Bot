import axios from 'axios';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Inicializamos la interfaz de lectura de la terminal
const rl = readline.createInterface({ input, output });

// Función auxiliar para hacer el ping
// Función auxiliar para hacer el ping con detección de servidores dormidos
async function ejecutarPing(url) {
    try {
        const response = await axios.get(url, { timeout: 15000 }); // 15 segundos de tolerancia
        console.log(`\n🟢 [${new Date().toLocaleTimeString()}] ¡Página activa! Estado: ${response.status} -> ${url}`);
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            
            // Códigos típicos de Render/Heroku cuando están levantando el contenedor
            if (status === 502 || status === 503 || status === 504) {
                console.log(`\n⏳ [${new Date().toLocaleTimeString()}] ¡Señal enviada! El servidor estaba dormido (Estado ${status}) y se está despertando... -> ${url}`);
            } else {
                // Otros errores HTTP reales (404, 500 interno, etc.)
                console.error(`\n❌ [${new Date().toLocaleTimeString()}] Error de servidor (Estado ${status}): ${error.message} -> ${url}`);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            // Si tarda mucho, es la confirmación de que está arrancando desde cero
            console.log(`\n⏳ [${new Date().toLocaleTimeString()}] El servidor está tardando en responder. ¡Se está despertando! -> ${url}`);
        } else {
            // Errores de conexión (URL mal escrita, sin internet, etc.)
            console.error(`\n🔴 [${new Date().toLocaleTimeString()}] Error de red: ${error.message}`);
        }
    }
}

// Opción 1: Múltiples pings cada 40 segundos
async function modoBuclePing() {
    const cantidadStr = await rl.question('🔢 Cantidad de veces: ');
    const cantidad = parseInt(cantidadStr, 10);

    if (isNaN(cantidad) || cantidad <= 0) {
        console.log('⚠️ Por favor, introduce un número válido mayor a 0.');
        return;
    }

    const link = await rl.question('🔗 Link: ');

    console.log(`\n🚀 Iniciando ciclo. Se enviarán ${cantidad} pings a ${link} (uno cada 40 segundos).`);
    
    let pingsRealizados = 0;

    // Primer ping inmediato
    await ejecutarPing(link);
    pingsRealizados++;

    // Si solo quería 1, terminamos temprano
    if (pingsRealizados >= cantidad) {
        console.log(`\n✅ Ciclo completado para: ${link}`);
        return;
    }

    // Configurar el intervalo para los pings restantes
    const intervalo = setInterval(async () => {
        await ejecutarPing(link);
        pingsRealizados++;

        if (pingsRealizados >= cantidad) {
            clearInterval(intervalo);
            console.log(`\n\x1b[32m✅ Ciclo completado con éxito para: ${link}\x1b[0m`);
        }
    }, 40 * 1000); // 40 segundos
}

// Opción 2: Un solo ping inmediato
async function modoRevivir() {
    const link = await rl.question('🔗 Link: ');
    console.log(`\n⏳ Intentando revivir la página...`);
    await ejecutarPing(link);
}

// Menú principal interactivo
async function menuPrincipal() {
    while (true) {
        console.log('\n=========================================');
        console.log('         🤖 BOT SERVER SUITE CLI         ');
        console.log('=========================================');
        console.log(' 1️⃣  Hacer ping a una página (Bucle)');
        console.log(' 2️⃣  Revivir una página (1 solo ping)');
        console.log(' 3️⃣  Salir');
        console.log('=========================================');
        
        const opcion = await rl.question('👉 Selecciona una opción: ');

        switch (opcion.trim()) {
            case '1':
                await modoBuclePing();
                // Nota: El menú volverá a aparecer inmediatamente. El bucle de 40s
                // se ejecutará en segundo plano mientras puedes seguir usando el menú.
                break;
            case '2':
                await modoRevivir();
                break;
            case '3':
                console.log('\n👋 ¡Saliendo del sistema! Hasta luego.');
                rl.close();
                process.exit(0);
            default:
                console.log('⚠️ Opción no válida. Elige 1, 2 o 3.');
        }
    }
}

// Arrancar la aplicación
menuPrincipal();
