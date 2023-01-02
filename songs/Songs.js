const SONGS_DATA_PATH = '/songs_data/';

let htmlList = document.querySelector('#songs_list');
let addSong = document.querySelector('#add_song');
let songListScroll = document.querySelector('#song_list_scroll');
songListScroll.style.maxHeight = window.innerHeight - 180 + 'px';
let searchSongInput = document.querySelector('#song_search');

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    let mobileCssList = ['Songs-mobile.css', '/general-mobile.css'];
    for (let link of mobileCssList) {
        let mobileCssLink = document.createElement("link");
        mobileCssLink.rel = "stylesheet";
        mobileCssLink.type = "text/css";
        mobileCssLink.href = link;
        let head = document.querySelector('head');
        head.append(mobileCssLink);
    }
}

let loadAllSongs = fetch(SONGS_DATA_PATH + 'songs.json')
    .then(response => response.json())
    .then(response => {
        let listToShow = response;
        let loadSongsPromises = [];
        for (let id in listToShow) {
            let promise = fetch(SONGS_DATA_PATH + id + '.json')
                .then(response => response.json())
                .then(result => {
                    if (result.private &&
                        !(result.users_read && User.currentUser && result.users_read.includes(User.currentUser.login))
                    ) {
                        delete listToShow[id];
                    } else {
                        let textParts = result.text;
                        let songWords = "";
                        textParts.forEach(part => songWords += part.text + " ");
                        songsTexts[id] = songWords;
                    }
                });
            loadSongsPromises.push(promise);
        }
        Promise.all(loadSongsPromises).then(result => {
            songsTextsLoaded = true;
            loadSongsList(listToShow);
        });
    });

let loadSongsLists = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())
    .then(response => showSongsListsInfo(response));

let songsList = [];
function loadSongsList(list) {
    songsList = [];
    htmlList.innerHTML = "";
    for (let id in list) {
        let ref = document.createElement('a');
        ref.append(list[id].name);
        ref.href = '/song?id=' + id;
        ref.className = 'ref_to_song_in_table';
        let div = document.createElement('div');
        div.append(ref);
        songsList.push({name: list[id].name, element: div, id: id});
    }
    songsList.sort(sortSongs);
    for (let song of songsList)
        htmlList.append(song.element);

    addSong.href = `/song?id=new&edit=true`;

    // loadSongsTexts().then(() => {
    searchSongInput.placeholder = 'Поиск песни';
    // });
}

function sortSongs(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

function searchSongsByName(name) {
    let words = name.trim().toLowerCase().split(' ');
    return songsList.filter(song => words.every(word => song.name.toLowerCase().includes(word)));
}

let songsTexts = {};
let songsTextsLoaded = false;
async function loadSongsTexts() {
    songsList.forEach(song => {
        console.log('Loading song text ', song);
        fetch(SONGS_DATA_PATH + song.id + '.json')
            .then(response => response.json())
            .then(result => {
                let text_parts = result.text;
                let song_words = "";
                text_parts.forEach(part => song_words += part.text + " ");
                // console.log(song_words);
                songsTexts[song.id] = song_words;
            })
            .then(result => {
                songsTextsLoaded = true;
            });
    });
}

function searchSongsByText(text) {
    console.log('texts loaded: ', songsTextsLoaded);
    let words = text.trim().toLowerCase().split(' ');
    return songsList.filter(song => {
        if (words.every(word => song.name.toLowerCase().includes(word)))
            return true
        else
            if (songsTextsLoaded)
                return words.every(word => songsTexts[song.id].toLowerCase().includes(word));
            else return false;
    });
}

searchSongInput.oninput = () => {
    searchSongInput.style.width = '500px';
    searchSongInput.style.width =
        Math.max(500, Math.min(window.innerWidth - 80, searchSongInput.scrollWidth + 5)) + 'px';
    let new_list = searchSongsByText(searchSongInput.value);
    htmlList.innerHTML = "";
    for (let song of new_list)
        htmlList.append(song.element);
}

let mainSongsListDisplay = document.querySelector('#main_songs_list_display');
let personalSongsLists = document.querySelector('#personal_songs_lists');
if (User.currentUser) {
    updatePersonalSongsListsPosition();
} else {
    personalSongsLists.style.display = 'none';
}

function updatePersonalSongsListsPosition() {
    if (window.innerWidth > 800) {
        personalSongsLists.style.width = '30%';
        mainSongsListDisplay.style.width = '70%';
        personalSongsLists.style.float = 'right';
        mainSongsListDisplay.style.width = 'right';
        personalSongsLists.style.height = '100%';
        mainSongsListDisplay.style.height = '100%';
    } else {
        personalSongsLists.style.height = '30%';
        mainSongsListDisplay.style.height = '70%';
        personalSongsLists.style.float = 'top';
        mainSongsListDisplay.style.float = 'top';
        personalSongsLists.style.width = '100%';
        mainSongsListDisplay.style.width = '100%';
    }
}

window.addEventListener('resize', () => {
    updatePersonalSongsListsPosition();
});

function showSongsListsInfo(data) {
    let user = User.currentUser;
    for (let listId in data) {
        let list = data[listId];
        let usersRead = list.users_read;
        if (!list.public && (!user || !usersRead.includes(user.login)))
            continue;
        let link = document.createElement('a');
        link.append(list.name);
        link.href = '/songs_list/' + listId;
        link.style.display = 'block';
        personalSongsLists.append(link);
    }
}