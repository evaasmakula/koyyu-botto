const fs = require("fs");

module.exports = async (file) => {
    fs.unlink("./" + file, function (err) {
        if (err && err.code == 'ENOENT') {
            // file doens't exist
            console.info('\x1b[32m%s\x1b[0m%s', "[ERROR]", " File not found");
        } else if (err) {
            // other errors, e.g. maybe we don't have enough permission
            console.error('\x1b[32m%s\x1b[0m%s', "[ERROR]',' Can't delete file");
        } else {
            console.info(`File terhapus`);
        }
    });
}