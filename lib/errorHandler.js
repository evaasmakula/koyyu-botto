const errButton = [
    { index: 1, urlButton: { displayText: 'Hubungi Admin', url: 'https://facebook.com/evaasmakula' } },
    { index: 2, urlButton: { displayText: 'Github Issue', url: 'https://github.com/evaasmakula/md-bots/issue' } },
]

module.exports = async (conn, message, err) => {
    const senderNumber = message.key.remoteJid;

    switch (err) {
        case "Cannot read properties of undefined (reading 'Key')":
            {
                const theButton = [
                    { index: 1, urlButton: { displayText: 'Hubungi Admin', url: 'https://facebook.com/evaasmakula' } },
                    { index: 2, quickReplyButton: { displayText: 'menu', id: 'menu' } },
                ]

                const buttonMessage = {
                    text: `Mohon maaf perintah yang kamu masukkan tidak ditemukan 😭\n\nSilahkan gunakan perintah lain ya atau kamu juga bisa menghubungi admin untuk penambahan fitur😊`,
                    footer: `${conn.user.name} ERROR MESSAGE`,
                    templateButtons: theButton,
                    headerType: 1
                }

                conn.sendMessage(senderNumber, buttonMessage);

                break;
            }

        case "connect ECONNREFUSED 127.0.0.1:80":
            {

                const buttonMessage = {
                    text: `Aduh 😭, maaf kak kami gabisa menghubungkan ke server.\n\nPerintah tadi pakai server eksternal untuk bisa digunakan dan dianya lagi galak sama mimin 😥\nSilahkan hubungi admin ya kak untuk perbaikan`,
                    footer: `${conn.user.name} ERROR MESSAGE`,
                    templateButtons: errButton,
                    headerType: 1
                }

                conn.sendMessage(senderNumber, buttonMessage);
                break;
            }

        case "Request failed with status code 500":
            {

                const buttonMessage = {
                    caption: `Uch, terjadi error kak\nAda kucing yang ngerusak server nya😭\n\nSilahkan hubungi admin ya kak agar segera diperbaiki`,
                    footer: conn.user.name,
                    image: { url: 'https://http.cat/500' },
                    templateButtons: errButton,
                    headerType: 4
                }

                conn.sendMessage(senderNumber, buttonMessage);
                break;
            }

        default:
            {
                const buttonMessage = {
                    text: `Mohon maaf terjadi masalah 😭\n\nsilahkan hubungi admin untuk penyelesaian atau perbaikan\n\n\nError Log:\n\u0060\u0060\u0060${error}\u0060\u0060\u0060`,
                    footer: `${conn.user.name} ERROR MESSAGE`,
                    templateButtons: errButton,
                    headerType: 1
                }

                conn.sendMessage(senderNumber, buttonMessage);

                break;
            }
    }
}