const express = require('express');
const app = express();
const fs = require('fs');
const songs_data_path = __dirname + '/songs_data/';
const users_data_path = __dirname + '/users/';
const errors_log_file = __dirname + '/errors_log.txt';

const host = 'localhost';
const http_port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(__dirname));

function isMobile(req) {
    let userAgent = req.headers["user-agent"];
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

app.get("/transpose", (req, res) => {
    res.sendFile(__dirname + '/transpose/main.html');
});

app.get('/songs', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/songs/songs-mobile.html');
    else
        res.sendFile(__dirname + '/songs/songs.html');
});

app.get('/songs_list/:songListId', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/songs_list/songsList-mobile.html');
    else
        res.sendFile(__dirname + '/songs_list/songsList.html');
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
        res.sendFile(__dirname + '/song/song-mobile.html');
    else
        res.sendFile(__dirname + '/song/song.html');
});

app.get('/settings', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/settings_page/settingsPage-mobile.html');
    else
        res.sendStatus(404);
        // res.sendFile(__dirname + '/settings_page/settingsPage.html');
});

app.get('/user', (req, res) => {
    if (isMobile(req))
        res.sendFile(__dirname + '/user_page/userPage-mobile.html');
    else
        res.sendStatus(404);
        // res.sendFile(__dirname + '/user_page/userPage.html');
});

app.get('/guess_interval', (req, res) => {
    res.sendFile(__dirname + '/guess_interval/index.html');
});

app.use('/auth/login', (req, res) => {
    try {
        // throw new Error('I want to throw an error');
        let user = req.body.user;
        let password = req.body.password;
        let userData = checkAuth(password, user);
        if (userData) {
            userData.login = user;
            res.json(userData);
        } else {
            res.sendStatus(403);
        }
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e.toString() + '\n\n', err => {});
    }
});

app.use('/auth/reg', (req, res) => {
    try {
        let user = req.body.user;
        let password = req.body.password;
        let fileData = JSON.parse(fs.readFileSync(users_data_path + 'users.json', 'utf-8'));
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
            fs.writeFile(users_data_path + 'users.json', JSON.stringify(newFileData), err => {
                if (err) {
                    let time = new Date();
                    fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + err + '\n\n', e => {});
                    res.sendStatus(500);
                } else
                    res.sendStatus(200);
            })
        }
    } catch (e) {
        let time = new Date();
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', err => {});
    }
});

function checkAuth(password, user) {
    const n = 2472942968189431706898462913067925658209124041544162680908145890301107704237n;
    const e = 5281668766765633818307894358032591567n;

    let fileData = JSON.parse(fs.readFileSync(users_data_path + 'users.json','utf-8'));
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
            'Song data:\n' + JSON.stringify(song_data) + '\n\n', err => {
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
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', err => {});
    }
});

let maxSongsListId = 1;
let songsListsData;
fs.readFile(songs_data_path + 'songs_lists.json', 'utf-8', (err, data) => {
    if (err) throw err;
    songsListsData = JSON.parse(data);
    console.log(songsListsData);
    while (songsListsData[maxSongsListId.toString()]) maxSongsListId++;
});

app.post('/songs_list/:songsListId', (req, res) => {
    try {
        let reqData = req.body;
        console.log(reqData);
        if (!checkAuth(reqData.password, reqData.user)) {
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
        fs.appendFile(errors_log_file, 'Date: ' + time.toString() + '\n' + e + '\n\n', err => {});
    }
});

app.get("/", (req, res) => {
    res.redirect(301, '/songs');
});

app.listen(http_port, host);
