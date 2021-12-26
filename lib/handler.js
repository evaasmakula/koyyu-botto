/*
*   Quick search
*   Use "commandHandler" to quickly find the command
*   example: stickerHandler
*/
const fs = require('fs');
const axios = require("axios");
const ytdown = require("./ytdown.js");
const PDFDocument = require("pdfkit");
const scrapy = require("node-scrapy");
const deleteFile = require("./delete");
const Genius = require("genius-lyrics");
const WSF = require("wa-sticker-formatter");
const webpConverter = require("./webpconverter.js");
const NLP = require("@hiyurigi/nlp")("TextCorrection");
const menu = fs.readFileSync('./config/menu.txt', 'utf-8');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const dictionary = JSON.parse(fs.readFileSync('./config/dictionary.json', 'utf-8'))
const { writeFile } = require('fs/promises')
const { Brainly } = require("brainly-scraper-v2");
const { LatinKeAksara } = require("@sajenid/aksara.js");
const { proto, generateWAMessageFromContent, Mimetype, downloadContentFromMessage } = require('@adiwajshing/baileys-md');
const { url } = require('inspector');
const { title } = require('process');
const console = require('console');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Sorting your command
dictionary.sort(function (a, b) {
    return b.length - a.length;
});

// Basic package setting
const brain = new Brainly("id");
const v = new NLP(dictionary);
const Client = new Genius.Client("uO-XWa9PYgZn-t7UrNW_YTDlUrNCtMq8xmCxySRRGXP4QJ0mtFwoqi1z-ywdGmXj");
const bufferImagesForPdf = {};
const inPdfInput = [];

// Config basic setting
const prefix = config.prefix;
const watermark = config.watermark;


module.exports = async (conn, message) => {
    const senderNumber = message.key.remoteJid;
    const senderName = message.pushName || conn.user.name //sender?.notify || sender?.short || sender?.name || sender?.vname
    const buttonMessages = message.message?.templateButtonReplyMessage?.selectedId;
    const extendedTextMessage = message.message.extendedTextMessage;
    const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo;
    const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;
    const imageMessage = message.message.imageMessage;
    const videoMessage = message.message.videoMessage;
    const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption || buttonMessages

    // handling command and parameter
    let command, parameter;
    if (buttonMessages) {
        command = buttonMessages;
    } else if (textMessage) {

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
            }

            let result = v.TextCorrection({
                Needle: d,
                Threshold: 0.7,
                NgramsLength: 1
            });

            command = result[0].Key;

        }
    }

    console.log("New Command Executed: " + command);

    // Sticker owner
    stickerOwner = parameter || senderName || conn.user.name

    switch (command) {
        // menuHandle
        // helpHandler
        case "menu": case "help":
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

        // stickerHandler
        case "sticker":
            {
                if (quotedMessage) {
                    message.message = quotedMessage;
                }

                if (imageMessage) {
                    console.log("Understood > trying to execute command");
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

                    conn.sendMessage(senderNumber, { sticker: bufferImage, mimetype: 'image/webp' }, { quoted: message });
                    console.log("Message send, tring to delete file");
                    await deleteFile(imagePath);
                } else {
                    conn.sendMessage(senderNumber, { text: "ups maaf kak gambarnya mana ya kak?" })
                }
                break;
            }

        case "gifsticker":
            {
                if (quotedMessage) {
                    message.message = quotedMessage;
                }

                if (message.message.videoMessage.seconds > 8) {
                    conn.sendMessage(senderNumber, { text: "Hmm... maksimal 8 detik kak maaf ya 🥺" }, {
                        quoted: message
                    });
                    break;
                }

                if (videoMessage) {
                    console.log("Understood > trying to execute command");
                    // download stream
                    const stream = await downloadContentFromMessage(videoMessage, 'video')
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk])
                    }
                    // save to file
                    const imagePath = Math.floor(Math.random() * 10000) + ".mp4";
                    await writeFile("./" + imagePath, buffer)

                    console.log("media downloaded, trying to make a sticker");
                    const sticker = new WSF.Sticker("./" + imagePath, {
                        animated: true,
                        pack: "Sticker",
                        author: stickerOwner
                    });

                    console.log("building sticker");
                    await sticker.build();
                    console.log("sticker builded");
                    const bufferImage = await sticker.get();

                    conn.sendMessage(senderNumber, { sticker: bufferImage, mimetype: 'image/webp' }, { quoted: message });

                    await deleteFile(imagePath);
                } else {
                    conn.sendMessage(senderNumber, { text: "Ups maaf kak video atau gif nya mana ya kak?" })
                }
                break;
            }

        // toimgHandler
        case "toimg":
            {
                console.log(quotedMessage);

                if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
                    conn.sendMessage(senderNumber, { text: "Ups, stikernya mana ya kak?" }, {
                        quoted: message
                    });
                    break;
                }

                message.message = quotedMessage;

                const stream = await downloadContentFromMessage(message.message.stickerMessage, "image");
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                // save to file
                const imagePath = Math.floor(Math.random() * 10000000) + ".jpeg";
                await writeFile("./" + imagePath, buffer)

                conn.sendMessage(senderNumber, {
                    image: { url: "./" + imagePath },
                    caption: "Stiker sudah diubah menjadi gambar (✿◡‿◡)"
                }, { quoted: message })

                await deleteFile(imagePath);

                break;
            }
        // togifhandler
        case "togif":
            {
                console.log(quotedMessage);

                if (!quotedMessage || !quotedMessage.stickerMessage || quotedMessage.stickerMessage.mimetype != "image/webp") {
                    conn.sendMessage(senderNumber, { text: "Ups, stikernya mana ya kak?" }, {
                        quoted: message
                    });
                    break;
                }

                message.message = quotedMessage;

                const stream = await downloadContentFromMessage(message.message.stickerMessage, "image");
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }
                // save to file
                const imagePath = Math.floor(Math.random() * 10000000) + ".webp";
                const webpImage = "./" + imagePath;
                await writeFile(webpImage, buffer)

                const video = await webpConverter.webpToVideo(webpImage);

                conn.sendMessage(senderNumber, {
                    video: video,
                    caption: "Stiker sudah diubah menjadi Gif (✿◡‿◡)",
                    gifPlayback: true
                }, { quoted: message })

                await deleteFile(imagePath);

                break;
            }
        // BrainlyHandler
        case 'brainly':
            {
                if (quotedMessage) {
                    message.message = quotedMessage;
                } else if (!parameter) {
                    conn.sendMessage(senderNumber, { text: "Mau cari apa ya kak? silahkan diulangi ya kak 😊" }, { quoted: message });
                }

                brain.searchWithMT("id", parameter).then(res => {
                    let data = [];

                    for (var i = 0; i < res.length; i++) {
                        let question = res[i].question.content;
                        let answer = res[i].answers[0].content;

                        data.push({
                            title: `${question}\n\n`,
                            description: `Jawaban: ${answer}`,
                            rowId: "row" + i
                        });
                    }

                    const section = [{
                        title: watermark,
                        rows: data
                    }];

                    const buttons = {
                        buttonText: "Lihat Jawaban",
                        description: "Jawaban kamu sudah ada ditemukan\n\nSilahkan klik tombol dibawah (*/ω＼*).",
                        listType: 'SINGLE_SELECT',
                        sections: section
                    }

                    const templateList = generateWAMessageFromContent(message.key.remoteJid, proto.Message.fromObject({ "listMessage": buttons }), {});
                    conn.relayMessage(senderNumber, templateList.message, { messageId: templateList.key.id });

                }).catch(err => {
                    conn.sendMessage(senderNumber, "Maaf kak terjadi masalah, atau jawaban tidak ditemukan (┬┬﹏┬┬)", { quoted: message });
                    console.log(`[ERROR] ${err}`);
                })

                break;
            }

        // gempaHandler

        case "gempa":
            {
                const model = ['tr:nth-child(1) td'];
                fetch('https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg').then((res) => res.text()).then((body) => {
                    let result = scrapy.extract(body, model);

                    let waktu = result[1] || "Tidak ada data";
                    let lintang = result[2] || "Tidak ada data";
                    let bujur = result[3] || "Tidak ada data";
                    let magnitudo = result[4] || "Tidak ada data";
                    let kedalaman = result[5] || "Tidak ada data";
                    let lokasi = result[6] || "Tidak ada data";

                    const text = `informasi gempa terbaru:\n\nWaktu: *${waktu}*\nBujur: *${bujur}*\nLintang: *${lintang}*\nMagnitudo: *${magnitudo}*\nKedalaman: *${kedalaman}*\nLokasi: *${lokasi}*`;

                    conn.sendMessage(senderNumber, { text: text }, {
                        quoted: message
                    });
                });
                break;
            }

        // Yt handler
        case "yt":
        case "ytmp3":
            {
                if (quotedMessage) {
                    message.message = quotedMessage;
                }

                if (!parameter) {
                    conn.sendMessage(senderNumber, { text: "Ups Link nya mana ya kak, jangan sampai lupa ya link nya hehehe (/≧▽≦)/" }, { quoted: message });
                }

                const mp3 = await ytdown.ytmp3(parameter);
                const mp4 = await ytdown.yt(parameter);

                if (mp3.title == "Not Found" || mp4.title == "Not Found") {
                    conn.sendMessage(senderNumber, { text: "Ups, Mohon maaf kami tidak bisa mendownload video kamu (┬┬﹏┬┬)" }, { quoted: message });
                } else {

                    const theButton = [
                        { index: 1, urlButton: { displayText: 'Download MP3', url: mp3.link } },
                        { index: 2, urlButton: { displayText: 'Download MP4', url: mp4.link } },
                    ]

                    const buttonMessage = {
                        caption: mp3.title,
                        footer: conn.user.name,
                        image: { url: 'https://i.ibb.co/gDK9pXt/wp.png' },
                        templateButtons: theButton,
                        headerType: 4
                    }

                    conn.sendMessage(senderNumber, buttonMessage);
                }
                break;
            }


        default:
            {
                console.log('new message received but not a command')
            }

    }
}