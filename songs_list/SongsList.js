const SONGS_DATA_PATH = '/songs_data/';

let htmlList = document.querySelector('#songs_list');
let addSong = document.querySelector('#add_song');
let songListScroll = document.querySelector('#song_list_scroll');
songListScroll.style.maxHeight = window.innerHeight - 180 + 'px';
let searchSongInput = document.querySelector('#song_search');

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    let mobileCssList = ['SongList-mobile.css', '/general-mobile.css'];
    for (let link of mobileCssList) {
        let mobileCssLink = document.createElement("link");
        mobileCssLink.rel = "stylesheet";
        mobileCssLink.type = "text/css";
        mobileCssLink.href = link;
        let head = document.querySelector('head');
        head.append(mobileCssLink);
    }
}

fetch(SONGS_DATA_PATH + 'songs_list.json')
    .then(response => response.json())
    .then(response => loadSongsList(response));

let songsList = [];
let maxId = 0;
function loadSongsList(list) {
    songsList = [];
    for (let id in list) {
        maxId = Math.max(maxId, Number(id));
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

    loadSongsTexts().then(() => {
        searchSongInput.placeholder = 'Поиск песни';
    });
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
                console.log(song_words);
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
