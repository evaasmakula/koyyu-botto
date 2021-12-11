
const fs = require('fs');
const axios = require("axios");
const PDFDocument = require("pdfkit");
const Genius = require("genius-lyrics");
const WSF = require("wa-sticker-formatter");
const NLP = require("@hiyurigi/nlp")("TextCorrection");
const menu = fs.readFileSync('./config/menu.txt', 'utf-8');
const config = JSON.parse(fs.readFileSync('./config/config.json', 'utf-8'));
const dictionary = JSON.parse(fs.readFileSync('./config/dictionary.json', 'utf-8'))

const { Brainly } = require("brainly-scraper-v2");
const { LatinKeAksara } = require("@sajenid/aksara.js");
const { proto, generateWAMessageFromContent, Mimetype } = require('@adiwajshing/baileys-md');

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
const questionAnswer = {};
const inPdfInput = [];

// Config basic setting
const prefix = config.prefix;


module.exports = async (conn, message) => {
    const senderNumber = message.key.remoteJid;
    // const sender = conn.contacts[senderNumber];
    const senderName = message.pushName || "eva"//sender?.notify || sender?.short || sender?.name || sender?.vname
    const imageMessage = message.message.imageMessage;
    const videoMessage = message.message.videoMessage;
    const stickerMessage = message.message.stickerMessage;
    const extendedTextMessage = message.message.extendedTextMessage;
    const buttons = message.message.templateButtonReplyMessage
    const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo;
    const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;
    let buttonMessages;
    if (buttons != undefined) { buttonMessages = buttons.selectedId }
    const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption || buttonMessages

    // handling command and parameter
    let command, parameter;
    if (textMessage) {

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

    // Sticker owner
    stickerOwner = parameter || senderName || conn.user.name

    // PDF HANDLER
    if (inPdfInput.includes(senderNumber)) {
        if (stickerMessage) return;

        const theButton = [
            { index: 1, quickReplyButton: { displayText: 'done', id: 'done' } },
            { index: 1, quickReplyButton: { displayText: 'cancel', id: 'cancel' } },
            cancel]
        const pdfButton = `Kirim *${prefix}done* jika sudah selesai\n*${prefix}cancel* untuk membatalkan\n\n_Maksimal 19 gambar ya kak 😥_`;

        if (command == `done` || buttonMessages == "done" || bufferImagesForPdf[senderNumber].length > 19) {
            const pdf = new PDFDocument({
                autoFirstPage: false
            });
            const bufferImages = bufferImagesForPdf[senderNumber];
            for (const bufferImage of bufferImages) {
                const image = pdf.openImage(bufferImage);
                pdf.addPage({
                    size: [image.width, image.height]
                });
                pdf.image(image, 0, 0);
            }

            const pathFile = ".temp/" + Math.floor(Math.random() * 1000000 + 1) + ".pdf";
            const file = fs.createWriteStream(pathFile);
            pdf.pipe(file)
            pdf.end()

            file.on("finish", () => {
                const file = fs.readFileSync(pathFile);
                conn.sendMessage(senderNumber, file, MessageType.document, {
                    mimetype: Mimetype.pdf,
                    filename: Math.floor(Math.random() * 1000000) + ".pdf",
                    quoted: message
                });
                fs.unlinkSync(pathFile);
                inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);
                delete bufferImagesForPdf[senderNumber];
            })

        } else if (command == `cancel` || buttonMessages == "cancel") {
            delete bufferImagesForPdf[senderNumber];
            inPdfInput.splice(inPdfInput.indexOf(senderNumber), 1);
            conn.sendMessage(senderNumber, { text: "Oke kak aku batalin ya " })

        } else if (imageMessage && imageMessage.mimetype == "image/jpeg") {
            const bufferImage = await conn.downloadMediaMessage(message);
            bufferImagesForPdf[senderNumber].push(bufferImage);

            const buttonMessage = {
                caption: `Yay ${bufferImagesForPdf[senderNumber].length} gambar sudah ditambahkan\n\n${pdfButton}`,
                footer: `${conn.user.name} ${prefix}pdf Command`,
                templateButtons: theButton,
                headerType: 1
            }

            conn.sendMessage(senderNumber, buttonMessage);
        } else {

            const buttonMessage = {
                caption: `Ups, pastikan kirimm gambar ya kak, perintah lain akan di disable ketika kamu sedang membuat PDF\n\n${pdfButton}`,
                footer: `${conn.user.name} ${prefix}pdf Command`,
                templateButtons: theButton,
                headerType: 1
            }

            conn.sendMessage(senderNumber, buttonMessage);

            return;
        }
    }

    switch (command || buttonMessages) {
        case "help":
        case "menu":
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


        case "pdf": {
            if (message.participant) {
                conn.sendMessage(senderNumber, { text: "Maaf kak, demi menghindari spam fitur ini hanya tersedia di Private Chat" });
                break;
            }

            if (imageMessage) {
                conn.sendMessage(senderNumber, { text: "Ups, Kirim tanpa gambar ya kak" });
                break;
            }

            inPdfInput.push(senderNumber);
            bufferImagesForPdf[senderNumber] = [];

            conn.sendMessage(senderNumber, { text: "Okey kak silahkan kirim satu-satu ya sesuai urutan dan jangan spam\n\n*maksimal 19 gambar ya*😊" });
            break;
        }

        case `stiker`: {
            if (quotedMessage) {
                message.message = quotedMessage;
            }

            if (!message.message.imageMessage || message.message.imageMessage.mimetype != "image/jpeg") {
                conn.sendMessage(senderNumber, { text: `Ups, gambarnya mana ya kak?\n\nUntuk video bisa menggunakan *${prefix}gifsticker* ya kak😊` });
                break;
            }

            const imagePath = await conn.downloadAndSaveMediaMessage(message, Math.floor(Math.random() * 1000000));
            const sticker = new WSF.Sticker("./" + imagePath, {
                crop: false,
                pack: "Stiker by: ",
                author: stickerOwner
            });

            await sticker.build();
            fs.unlinkSync(imagePath);
            const bufferImage = await sticker.get();
            conn.sendMessage(senderNumber, { sticker: (bufferImage), mimetype: 'image/webp' }, { quoted: message });
            break;
        }

        case "brainly":
            {
                if (!parameter) {
                    conn.sendMessage(senderNumber, { text: "Mau cari apa ya kak?\nJangan lupa soal nya ditulis juga ya 😊" })
                }

                brain.searchWithMT("id", parameter).then(res => {
                    let result = [];

                    for (let i = 0; i < res.length; i++) {
                        let question = res[i].question.content;
                        let answer = res[i].answers[0].content;

                        result.push({
                            title: `${question}\n\n`,
                            description: `${answer}`,
                            rowID: "row" + i
                        })
                    }

                    const sections = [
                        {
                            title: `${conn.user.name} ${prefix}brainly Command`,
                            rows: result
                        }
                    ]

                    const button = {
                        title: "Brainly Answe", //optional
                        description: "jawaban kamu sudah tersedia silahkan pilih yang sesuai dengan soal kamu 😊",
                        footerText: `${conn.user.name} ${prefix}brainly Command`, //optional
                        buttonText: 'Lihat Jawaban',
                        listType: 'SINGLE_SELECT',
                        sections: sections
                    }

                    const templateList = generateWAMessageFromContent(senderNumber, proto.Message.fromObject({ "listMessage": button }), {});
                    conn.relayMessage(senderNumber, templateList.message, { messageId: templateList.key.id });
                })
            }

        default:
            {
                console.log('new message received but not a command')
            }

    }
}