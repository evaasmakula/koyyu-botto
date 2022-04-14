console.log('✨ Bot is starting...')

const { default: botConnect, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@adiwajshing/baileys")
const { state, saveState } = useSingleFileAuthState(`./session.json`)
const handler = require('./lib/index')
const Boom = require('@hapi/boom')
const pino = require('pino')
const fs = require('fs')
require('dotenv').config()
require('colors')

const botName = process.env.BOT_NAME


/**
 * Throw an error and do domething
 * @param {string} reason reason of error
 * @param {callback} cb exit status or restart resver
 */
function throwErr(reason, cb) {
    console.log(`💥 ${reason}`.red)
    cb()
}


async function start() {
    const { version, isLatest } = await fetchLatestBaileysVersion()

    console.log('🧪 Baileys version \t:', version.toString().green)
    console.log('🧬 Baileys is latest \t:', isLatest ? 'Yes'.green : 'No'.yellow)

    const conn = botConnect({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['Clive', 'Safari', '1.0.0'],
        auth: state,
        version
    })

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            let reason = Boom.boomify(lastDisconnect?.error)?.output?.statusCode

            if (reason === DisconnectReason.badSession) { throwErr("Bad Session File, Please Delete Session and Scan Again", process.exit) }
            else if (reason === DisconnectReason.connectionClosed) { throwErr("Connection closed, Reconnecting....", start) }
            else if (reason === DisconnectReason.connectionLost) { throwErr("Connection Lost from Server, Reconnecting...", start) }
            else if (reason === DisconnectReason.connectionReplaced) { throwErr("Connection Replaced, Another New Session Opened, Please Close Current Session First", process.exit) }
            else if (reason === DisconnectReason.loggedOut) { throwErr("Device Logged Out, Please Delete Session And Scan Again.", process.exit) }
            else if (reason === DisconnectReason.restartRequired) { throwErr("Restart Required, Restarting...", start) }
            else if (reason === DisconnectReason.timedOut) { throwErr("Connection TimedOut, Reconnecting...", start) }
            else { throwErr(`Unknown DisconnectReason: ${reason} | ${connection}`, process.exit) }
        }
    })

    conn.ev.on('creds.update', saveState)

    conn.ev.on('messages.upsert', async chatUpdate => {
        try {
            let m = chatUpdate.messages[0]

            if (!m.message) return

            m.message = (Object.keys(m.message).includes('ephemeralMessage')) ? m.message.ephemeralMessage.message : m.message

            //  Blocked message types
            if (m.key && m.key.remoteJid === 'status@broadcast') return // block status updates
            if (m.key.id.startsWith('BAE5') && m.key.id.length === 16 || m.key.fromMe) return // Block from me and BAE5 messages

            fs.writeFileSync('./log.json', JSON.stringify(m, null, 2))
            
            console.log(`📬 new message from ${m.key.remoteJid}`.gray)

            await handler(conn, m)

        } catch (err) {
            throwErr(err, process.exit)
        }
    })

    console.log('🚀 Bot ready to go!'.green)
}

start()


