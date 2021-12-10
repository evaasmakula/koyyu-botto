const prefix = '!';
module.exports = async (conn, message) => {
    const senderNumber = message.key.remoteJid;
    const imageMessage = message.message.imageMessage;
    const videoMessage = message.message.videoMessage;
    const stickerMessage = message.message.stickerMessage;
    const extendedTextMessage = message.message.extendedTextMessage;
    const buttons = message.message.buttonsResponseMessage
    const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo;
    const quotedMessage = quotedMessageContext && quotedMessageContext.quotedMessage;

    let buttonMessages;
    if (buttons != undefined) { buttonMessages = buttons.selectedDisplayText }

    const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption || buttonMessages

    let command, parameter;
    if (textMessage) {

        let a = textMessage.trim().split("\n");
        let preParam = "";

        c = a[0].split(" ")[0]

        preParam += a[0].split(" ").slice(1).join(" ");
        console.log(preParam);
        preParam += a.slice(1).join("\n")
        console.log(preParam);
        parameter = preParam.trim();
        prefixChar = c.charAt(0);
        theCommand = c.substring(1);

        if (prefixChar == prefix) {
            command = theCommand;
        }
    }


    switch (command) {
        case 'help':
            {
                conn.sendMessage(senderNumber, {text: 'hai'}, { quoted: message });
                break;
            }

        default:
            {
                console.log('new message received but not a command')
            }

    }
}