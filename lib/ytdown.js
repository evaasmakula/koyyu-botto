const request = require("request");
const ytregex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;


function ytmp3(parameter) {
    return new Promise((resolve, reject) => {
        try {
            if (ytregex.test(parameter)) {

                var match = parameter.match(ytregex);
                var result = (match && match[7].length == 11) ? match[7] : false;
                var links = 'https://freerestapi.herokuapp.com/api/ytmp3?url=https://www.youtube.com/watch?v=' + result;

                request.get(links, { json: true }, (error, response, body) => {
                    if (!error || response.statusCode == 200) {
                        resolve({
                            title: body.title,
                            link: body.url
                        })
                    }else{
                        resolve({
                            title: "Not Found"
                        })
                    }
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

function yt(parameter) {
    return new Promise((resolve, reject) => {
        try {
            if (ytregex.test(parameter)) {

                var match = parameter.match(ytregex);
                var result = (match && match[7].length == 11) ? match[7] : false;
                var links = 'https://freerestapi.herokuapp.com/api/ytmp4?url=https://www.youtube.com/watch?v=' + result;

                request.get(links, { json: true }, (error, response, body) => {
                    if (!error || response.statusCode == 200) {
                        resolve({
                            title: body.title,
                            link: body.url
                        })
                    }else{
                        resolve({
                            title: "Not Found"
                        })
                    }
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = { ytmp3, yt };