
const fs = require('fs');
const axios = require("axios");
const PDFDocument = require("pdfkit");
const Genius = require("genius-lyrics");
const WSF = require("wa-sticker-formatter");
const NLP = require("@hiyurigi/nlp")("TextCorrection");
const menu = fs.readFileSync('./config/menu.txt', 'utf-8');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const dictionary = JSON.parse(fs.readFileSync('./config/dictionary.json', 'utf-8'))

const { writeFile } = require('fs/promises')
const { Brainly } = require("brainly-scraper-v2");
const { LatinKeAksara } = require("@sajenid/aksara.js");
const { proto, generateWAMessageFromContent, Mimetype, downloadContentFromMessage } = require('@adiwajshing/baileys-md');

// Sorting your command
dictionary.sort(function (a, b) {
    return b.length - a.length;
});

// Basic package setting
const brain = new Brainly("id");
const v = new NLP(dictionary);
const ytregex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
const Client = new Genius.Client("uO-XWa9PYgZn-t7UrNW_YTDlUrNCtMq8xmCxySRRGXP4QJ0mtFwoqi1z-ywdGmXj");
const bufferImagesForPdf = {};
const inPdfInput = [];

// Config basic setting
const prefix = config.prefix;


module.exports = async (conn, message) => {
    const senderNumber = message.key.remoteJid;
    const senderName = message.pushName || conn.user.name //sender?.notify || sender?.short || sender?.name || sender?.vname
    const buttonMessages = message.message?.templateButtonReplyMessage?.selectedId;
    const extendedTextMessage = message.extendedTextMessage;
    const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo
    const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;
    const imageMessage = message.message.imageMessage
    const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption // || videoMessage && videoMessage.caption || buttonMessages

    // handling command and parameter
    let command, parameter;
    if(buttonMessages){
        command = buttonMessages;
    }else if (textMessage) {

        let a = textMessage.trim().split("\n");
        let b = "";

        b += a[0].split(" ").slice(1).join(" ");
        b += a.slice(1).join("\n")
        parameter = b.trim();

        // Prefix check
        c = a[0].split(" ")[0]
        pre = c.charAt(0);

        // Command check
        d = c.substring(1);

        if (pre == prefix) {
            if (!d) {
                let e = parameter.split(" ")
                d = e[0];

                parameter = parameter.split(" ").slice(1).join(" ");
            } else {
                let result = v.TextCorrection({
                    Needle: d,
                    Threshold: 0.7,
                    NgramsLength: 1
                });

                command = result[0].Key;
            }
        }
    }

    console.log(parameter);

    console.log("New Command Executed: " + command);

    // Sticker owner
    stickerOwner = parameter || senderName || conn.user.name

    switch (command) {
        case "menu":
        case "help":
            {
                const theButton = [
                    { index: 1, urlButton: { displayText: 'Facebook', url: 'https://facebook.com/evaasmakula' } },
                    { index: 2, urlButton: { displayText: 'Source Code', url: 'https://github.com/evaasmakula/md-bots' } },
                ]

                const buttonMessage = {
                    caption: menu,
                    footer: conn.user.name,
                    image: { url: 'https://i.ibb.co/gDK9pXt/wp.png' },
                    templateButtons: theButton,
                    headerType: 4
                }

                conn.sendMessage(senderNumber, buttonMessage);
                break;
            }

        case "sticker":
            {
                if (quotedMessage) {
                    message.message = quotedMessage;
                }

                if (imageMessage) {
                    // download stream
                    const stream = await downloadContentFromMessage(imageMessage, 'image')
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk])
                    }
                    // save to file
                    const imagePath = Math.floor(Math.random() * 10000000) + ".jpeg";
                    await writeFile("./" + imagePath, buffer)

                    const sticker = new WSF.Sticker("./" + imagePath, {
                        crop: false,
                        pack: "Sticker",
                        author: stickerOwner
                    });

                    await sticker.build();
                    const bufferImage = await sticker.get();

                    // conn.sendMessage(senderNumber, await sticker.toMessage())
                    await conn.sendMessage(senderNumber, { sticker: bufferImage, mimetype: 'image/webp' }, { quoted: message });

                    fs.unlink("./" + imagePath, function(err) {
                        if(err && err.code == 'ENOENT') {
                            // file doens't exist
                            console.info("File doesn't exist, won't remove it.");
                        } else if (err) {
                            // other errors, e.g. maybe we don't have enough permission
                            console.error("Error occurred while trying to remove file");
                        } else {
                            console.info(`removed`);
                        }
                    });
                } else {
                    conn.sendMessage(senderNumber, { text: "ups maaf kak gambarnya mana ya kak?" })
                }
                break;
            }

        default:
            {
                console.log('new message received but not a command')
            }

    }
}