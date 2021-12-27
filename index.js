const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys-md")
const { state, saveState } = useSingleFileAuthState('./login.json');
const errorHandler = require("./lib/errorHandler");
const handler = require('./lib/handler.js');
const fs = require('fs');

const startSock = () => {
    const conn = makeWASocket({ printQRInTerminal: true, auth: state });

    conn.ev.on('messages.upsert', async m => {
        const message = m.messages[0];
        
        if(message.key.remoteJid == "status@broadcast"){
            return;
        };
        
        if (!message.key.fromMe && m.type === 'notify') {
            try {
                await handler(conn, message);
                console.log("[INFO] Message sended to recipient");
                
            } catch (err) {
                const error = err.message;
                console.log(error);
                await errorHandler(conn, message, error)
            };
            // await conn.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
        };
    })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? startSock()
                : console.log('+ connection closed')
        };
    })

    conn.ev.on('creds.update', saveState)

    return conn
}

startSock()