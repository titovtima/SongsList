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

app.get('/guess_interval', (req, res) => {
    res.sendFile(__dirname + '/guess_interval/index.html');
});

app.use('/auth/login', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;
    let userData = checkAuth(password, user);
    if (userData)
        res.json(userData);
    else
        res.sendStatus(403);
});

app.use('/auth/reg', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;
    let fileData = JSON.parse(fs.readFileSync('users/users.json','utf-8'));
    let usersList = fileData.users;
    if (usersList.hasOwnProperty(user))
        res.sendStatus(403);
    else {
        usersList[user] = {
            'password': password
        }
        let newFileData = {
            'users': usersList
        };
        fs.writeFile('users/users.json', JSON.stringify(newFileData), err => {
            if (err)
                res.sendStatus(500);
            else
                res.sendStatus(200);
        })
    }
});

function checkAuth(password, user) {
    const n = 2472942968189431706898462913067925658209124041544162680908145890301107704237n;
    const e = 5281668766765633818307894358032591567n;

    let fileData = JSON.parse(fs.readFileSync('users/users.json','utf-8'));
    let usersList = fileData.users;
    if (usersList[user] && usersList[user].password === password)
        return usersList[user];
    return false;

    function quickPow(a, p, mod) {
        if (p === 0n) return 1n;
        if (p === 1n) return a % mod;

        let a2 = quickPow(a % mod, p/2n, mod);
        if (p % 2n === 0n) {
            return a2*a2 % mod;
        } else {
            return (a2*a2 % mod) * a % mod;
        }
    }

    function encodeRSA(string) {
        let num = 0n;
        string.split('').forEach((value, index) => {
            num += BigInt(value.charCodeAt(0) + index * 256);
            num %= n;
        });

        return quickPow(num, e, n);
    }
}

let songs_list;
let max_song_id = 1;
fs.readFile(songs_data_path + 'songs_list.json','utf-8', (err1, data) => {
    if (err1) throw err1;
    songs_list = JSON.parse(data);
    while (songs_list[max_song_id]) max_song_id++;
});

app.post('/song', (req, res) => {
    let url = new URL(req.url, 'https://' + host);
    if (!url.searchParams.has('edit')) {
        res.sendStatus(403);
        return;
    }
    if (!url.searchParams.has('id')) {
        res.sendStatus(400);
        return;
    }
    let song_id = url.searchParams.get('id');

    let song_data = req.body;

    if (song_id === 'new') {
        song_id = max_song_id;
        max_song_id++;
    }

    let time = new Date()
    fs.appendFile('songs_changes.txt', 'Get song from IP: ' + req.ip + '\n' +
        'Date: ' + time.toString() + '\n' +
        'Song id: ' + song_id + '\n' +
        'Song data:\n' + JSON.stringify(song_data) + '\n\n', err => {});

    fs.writeFile(songs_data_path + song_id + '.json', JSON.stringify(song_data),  err => {
        if (err) res.sendStatus(500);
        fs.readFile(songs_data_path + 'songs_list.json','utf-8', (err1, data) => {
            let songs_list = JSON.parse(data);
            songs_list[song_id] = { "name": song_data.name };
            fs.writeFile(songs_data_path + 'songs_list.json', JSON.stringify(songs_list),  err2 => {
                if (err2)
                    res.sendStatus(500);
                res.end(String(song_id));
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
