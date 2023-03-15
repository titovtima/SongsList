const express = require('express');
const app = express();
const fs = require('fs');
const songs_data_path = __dirname + '/songs_data/';
const users_data_file = __dirname + '/users.json';
const errors_log_file = __dirname + '/errors_log.txt';

const host = 'localhost';
const http_port = 3000;

const { Pool } = require('pg');

const dbPool = new Pool({
    host: 'localhost',
    user: 'songsserver',
    password: 'secret_password',
    database: 'songs',
    port: '5432',
});

class RSAEncoder {
    constructor() {
        this.n = 2472942968189431706898462913067925658209124041544162680908145890301107704237n;
        this.e = 5281668766765633818307894358032591567n;
    }

    quickPow(a, p, mod) {
        if (p === 0n) return 1n;
        if (p === 1n) return a % mod;

        let a2 = this.quickPow(a % mod, p/2n, mod);
        if (p % 2n === 0n) {
            return a2*a2 % mod;
        } else {
            return (a2*a2 % mod) * a % mod;
        }
    }

    encode(string) {
        let num = 0n;
        string.split('').forEach(char => {
            num *= BigInt(256);
            num += BigInt(char.charCodeAt(0));
            num %= this.n;
        });

        return this.quickPow(num, this.e, this.n).toString();
    }
}

let encoder = new RSAEncoder();

let usersList = {};

dbPool.query('select login, password from users;')
    .then(res => {
        for (let i = 0; i < res.rows.length; i++) {
            usersList[res.rows[i].login] = {
                login: res.rows[i].login,
                password: res.rows[i].password
            }
        }
        console.log('Connected to db');
    })
    .catch(err => {
        console.log('Connection to db failed', err);
        process.exit(1);
    });

async function checkAuth(login, password) {
    let encodedPassword = encoder.encode(password)
    return usersList[login] && usersList[login].password === encodedPassword;
}

async function changeUserPassword(login, newPassword) {
    let encodedPassword = encoder.encode(newPassword);
    if (!usersList || !usersList[login]) return false;
    try {
        await dbPool.query('update users set password=$1 where login=$2;', [encodedPassword, login]);
    } catch (err) {
        return false;
    }
    usersList[login].password = encodedPassword;
    delete usersList[login].passwordWasntChanged;
    let newFileData = { 'users': usersList };
    fs.writeFile(users_data_file, JSON.stringify(newFileData), err => {
        if (err) {
            let time = new Date();
            fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + err + '\n\n', _ => {});
        }
    });
}

async function createNewUser(login, password) {
    if (usersList.hasOwnProperty(login))
        return 400;
    let encodedPassword = encoder.encode(password);
    try {
        await dbPool.query('insert into users (login, password) values ($1, $2);', [login, encodedPassword]);
    } catch (err) {
        return 400;
    }
    usersList[login] = {
        login: login,
        password: encodedPassword
    }
    let newFileData = {
        'users': usersList
    };
    fs.writeFile(users_data_file, JSON.stringify(newFileData), err => {
        if (err) {
            let time = new Date();
            fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + err + '\n\n', _ => {});
        }
    });
    return 200;
}

function isMobile(req) {
    let userAgent = req.headers["user-agent"];
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use("/songs_data/", express.static(songs_data_path));
app.use("/songs_data/", express.static(songs_data_path + 'song/'));

app.get("/transpose", (req, res) => {
    res.sendFile(__dirname + '/static/transpose/main.html');
});

app.get('/songs', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/songs/songs-mobile.html');
    else
        res.sendFile(__dirname + '/static/songs/songs.html');
});

app.get('/songs_list/:songListId', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/songs_list/songsList-mobile.html');
    else
        res.sendFile(__dirname + '/static/songs_list/songsList.html');
});

app.get('/song', (req, res) => {
    let url = new URL(req.url, 'https://' + host);
    if (!url.searchParams.has('id')) {
        url.searchParams.set('id', 'new');
    }
    let newUrl = '/song/' + url.searchParams.get('id');
    url.searchParams.delete('id');
    newUrl += url.search + url.hash;
    res.redirect(301, newUrl);
});

app.get('/song/:songId', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/song/song-mobile.html');
    else
        res.sendFile(__dirname + '/static/song/song.html');
});

app.get('/settings', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/settings_page/settingsPage-mobile.html');
    else
        res.sendStatus(404);
        // res.sendFile(__dirname + '/settings_page/settingsPage.html');
});

app.get('/user', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/user_page/userPage-mobile.html');
    else
        res.sendStatus(404);
        // res.sendFile(__dirname + '/user_page/userPage.html');
});

app.get('/songs_lists_list', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/static/songs_lists_list/songsListsList-mobile.html');
    else
        res.sendStatus(404);
        // res.sendFile(__dirname + '/songs_lists_list/songsListsList.html');
});

app.get('/guess_interval', (req, res) => {
    res.sendFile(__dirname + '/static/guess_interval/index.html');
});

app.get('/auth/login', async (req, res) => {
    try {
        let authString = req.headers.authorization.slice(6);
        let decodedAuthString = decodeURI(atob(authString)).split(':');
        let login = decodedAuthString[0];
        let password = decodedAuthString[1];
        if (await checkAuth(login, password)) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e.toString() + '\n\n', _ => {});
        res.sendStatus(401);
    }
});

app.post('/auth/changePassword', async (req, res) => {
    let authString = req.headers.authorization.slice(6);
    let decodedAuthString = decodeURI(atob(authString)).split(':');
    let login = decodedAuthString[0];
    let password = decodedAuthString[1];
    if (await checkAuth(login, password)) {
        if (req.body.newPassword)
            await changeUserPassword(login, password);
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

app.post('/auth/reg', async (req, res) => {
    try {
        let login = req.body.login;
        let password = req.body.password;
        res.sendStatus(await createNewUser(login, password));
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', _ => {});
    }
});

let songs_list;
let max_song_id = 1;
fs.readFile(songs_data_path + 'songs.json','utf-8', (err1, data) => {
    if (err1) throw err1;
    songs_list = JSON.parse(data);
    while (songs_list[max_song_id]) max_song_id++;
});

app.post('/song/:songId', (req, res) => {
    try {
        let url = new URL(req.url, 'https://' + host);
        if (!url.searchParams.has('edit')) {
            res.sendStatus(403);
            return;
        }

        let songId = req.params.songId;
        let song_data = req.body;

        if (songId === 'new') {
            songId = max_song_id;
            max_song_id++;
        }

        let time = new Date();
        fs.appendFile('songs_changes.txt', 'Get song from IP: ' + req.ip + '\n' +
            'Date: ' + time.toString() + '\n' +
            'Song id: ' + songId + '\n' +
            'Song data:\n' + JSON.stringify(song_data) + '\n\n', _ => {
        });

        fs.writeFile(songs_data_path + songId + '.json', JSON.stringify(song_data), err => {
            if (err) res.sendStatus(500);
            fs.readFile(songs_data_path + 'songs.json', 'utf-8', (err1, data) => {
                let songs_list = JSON.parse(data);
                songs_list[songId] = {"name": song_data.name};
                fs.writeFile(songs_data_path + 'songs.json', JSON.stringify(songs_list), err2 => {
                    if (err2)
                        res.sendStatus(500);
                    res.end(String(songId));
                });
            });
        });
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', _ => {});
    }
});

let maxSongsListId = 1;
let songsListsData;
fs.readFile(songs_data_path + 'songs_lists.json', 'utf-8', (err, data) => {
    if (err) throw err;
    songsListsData = JSON.parse(data);
    while (songsListsData[maxSongsListId.toString()]) maxSongsListId++;
});

app.post('/songs_list/:songsListId', (req, res) => {
    try {
        let reqData = req.body;
        if (!checkAuth(reqData.user, reqData.password)) {
            res.sendStatus(403);
            return;
        }
        let fileData = JSON.parse(fs.readFileSync(songs_data_path + 'songs_lists.json', 'utf-8'));
        let list = fileData[reqData.id];
        if (list && !list.users_write.includes(reqData.user)) {
            res.sendStatus(403);
            return;
        }
        if (!reqData.name || !reqData.users_read || !reqData.users_write || !reqData.songs_ids) {
            res.sendStatus(400);
            return;
        }
        let songListId = reqData.id;
        console.log(songListId)
        if (songListId === 'new') {
            songListId = maxSongsListId.toString();
            maxSongsListId++;
            while (songsListsData[maxSongsListId.toString()]) maxSongsListId++;
        }
        fileData[songListId] = {
            'name': reqData.name,
            'users_read': reqData.users_read,
            'users_write': reqData.users_write,
            'songs_ids': reqData.songs_ids
        };
        fs.writeFile(songs_data_path + 'songs_lists.json', JSON.stringify(fileData), err => {
            if (err)
                res.sendStatus(500);
            else
                res.end(songListId);
        });
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', _ => {});
    }
});

app.get("/", (req, res) => {
    res.redirect(301, '/songs');
});

app.listen(http_port, host);
