const express = require('express');
const app = express();
const fs = require('fs');
const songs_data_path = __dirname + '/songs_data/';

const host = 'titovtima.ru';
const http_port = 80;
const https_port = 443;

// const host = 'localhost';
// const http_port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.post('/song', (req, res) => {
    console.log('post: ', req.body);
    console.log('url: ', req.url);
    let song_data = req.body;
    let url = new URL(req.url, 'https://' + host);
    if (!url.searchParams.has('id'))
        res.sendStatus(400);
    let song_id = url.searchParams.get('id');

    fs.writeFile(songs_data_path + song_id + '.json', JSON.stringify(song_data),  err => {
        if (err) res.sendStatus(500);
        fs.readFile(songs_data_path + 'songs_list.json','utf-8', (err1, data) => {
            let songs_list = JSON.parse(data);
            songs_list[song_id] = { "name": song_data.name };
            fs.writeFile(songs_data_path + 'songs_list.json', JSON.stringify(songs_list),  err2 => {
                if (err2)
                    res.sendStatus(500);
                res.sendStatus(200);
            });
        });
    });
});


app.get("/", (req, res) => {
    res.redirect(301, '/songs');
});
// app.get("/", (req, res) => {
//     res.sendFile(__dirname + '/main.html');
// });

const http_app = express();

http_app.use("/", (req, res) => {
    res.redirect(301, 'https://' + host + req.path);
});

http_app.listen(http_port, host);

const https = require('https');

https
    .createServer(
        {
            key: fs.readFileSync('/root/ssl/titovtima.key'),
            cert: fs.readFileSync('/root/ssl/titovtima.crt'),
        },
        app
    )
    .listen(https_port, host);
