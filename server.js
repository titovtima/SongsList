const express = require('express');
const app = express();

const host = 'titovtima.ru';
const http_port = 80;
const https_port = 443;

// const host = 'localhost';
// const http_port = 3000;

app.use("/", express.static(__dirname));

app.get("/transpose", (req, res) => {
    res.sendFile(__dirname + '/transpose/main.html');
});

app.get('/songs', (req, res) => {
    res.sendFile(__dirname + '/songs_list/SongsList.html');
});

app.get('/song', (req, res) => {
    res.sendFile(__dirname + '/song/Song.html');
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

const http_app = express();

http_app.use("/", (req, res) => {
    res.redirect(301, 'https://' + host + req.path);
});

http_app.listen(http_port, host);

const https = require('https');
const fs = require('fs');

https
    .createServer(
        {
            key: fs.readFileSync('/root/ssl/titovtima.key'),
            cert: fs.readFileSync('/root/ssl/titovtima.crt'),
        },
        app
    )
    .listen(https_port, host);
