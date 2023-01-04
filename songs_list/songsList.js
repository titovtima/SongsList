const SONGS_DATA_PATH = '/songs_data/';

let htmlList = document.querySelector('#songs_list');
let addNewSong = document.querySelector('#add_new_song');
let addSongById = document.querySelector('#add_song_by_id');
let songListScroll = document.querySelector('#song_list_scroll');
songListScroll.style.maxHeight = window.innerHeight - 180 + 'px';
let searchSongInput = document.querySelector('#song_search');
let saveListButton = document.querySelector('#save_list_button');
let listNameHeader = document.querySelector('#list_name');
let listNameInput = document.querySelector('#input_list_name');
let usersListContainer = document.querySelector('#users_lists_container');
let usersReadInput = document.querySelector('#users_read_input');
let usersWriteInput = document.querySelector('#users_write_input');
let editButton = document.querySelector('#edit_button');

let songListId;
let editMode = false;
let songListData;
function getSongListIdFromURL() {
    let urlParts = window.location.toString().split('?')[0].split('/');
    let ind = urlParts.length - 1;
    let res;
    // while (!res && urlParts[ind] !== 'titovtima.ru') {
    while (!res && urlParts[ind] !== 'localhost:3000') {
        res = Number(urlParts[ind]);
        ind--;
    }
    if (res)
        songListId = res.toString();
}
getSongListIdFromURL();

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    let mobileCssList = ['/general-mobile.css'];
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
    .then(response => response.json());

let loadSongsLists = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())
    .then(response => {
        songListData = response[songListId];
    });

Promise.all([loadAllSongs, loadSongsLists]).then(response => {
    let listToShow = response[0];
    let songsIdToInclude = songListData.songs_ids;
    for (let id in listToShow)
        if (!songsIdToInclude.includes(id))
            delete listToShow[id];
    loadSongsList(listToShow);
});

let songsList = [];
function loadSongsList(list) {
    listNameHeader.innerHTML = songListData.name;
    listNameInput.value = songListData.name;
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

    addNewSong.href = `/song?id=new&edit=true`;

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

function updateListName() {
    listNameHeader.innerHTML = listNameInput.value.trim();
    listNameInput.value = listNameHeader.innerHTML;
    listNameHeader.style.display = 'block';
    listNameInput.style.display = 'none';
}

let handlerClickOutOfHeader = event => {
    let h = document.querySelector('header');
    let t = event.target;
    if (t !== h && !h.contains(t)) {
        updateListName();
        document.removeEventListener('click', handlerClickOutOfHeader);
    }
};

let handlerClickOnHeader = () => {
    listNameInput.value = listNameHeader.innerHTML;
    listNameHeader.style.display = 'none';
    listNameInput.style.display = 'block';
    document.addEventListener('click', handlerClickOutOfHeader);
};

function switchToEditMode() {
    editMode = true;
    addNewSong.style.display = 'block';
    addSongById.style.display = 'block';
    saveListButton.style.display = 'block';
    usersListContainer.style.display = 'block';
    usersReadInput.value = songListData.users_read.toString();
    usersWriteInput.value = songListData.users_write.toString();

    listNameHeader.addEventListener('click', handlerClickOnHeader);

    editButton.style.backgroundImage = 'url("/assets/edit_on.png")';
}

function checkEditPermission() {
    return User.currentUser && songListData.users_write && songListData.users_write.includes(User.currentUser.login);
}

function turnOffEditMode() {
    editMode = false;
    addNewSong.style.display = 'none';
    addSongById.style.display = 'none';
    saveListButton.style.display = 'none';
    usersListContainer.style.display = 'none';

    listNameHeader.removeEventListener('click', handlerClickOnHeader);

    editButton.style.backgroundImage = 'url("/assets/edit.png")';
}

function saveList() {
    let usersRead = usersReadInput.value.split(', ');
    usersRead = usersRead.map(value => value.split(' ')).flat();
    usersRead = usersRead.map(value => value.split(',')).flat().filter(value => value.length > 0);
    let usersWrite = usersWriteInput.value.split(', ');
    usersWrite = usersWrite.map(value => value.split(' ')).flat();
    usersWrite = usersWrite.map(value => value.split(',')).flat().filter(value => value.length > 0);
    let listData = {
        'id': songListId,
        'name': listNameInput.value.trim(),
        'users_read': usersRead,
        'users_write': usersWrite,
        'songs_ids': songsList.map(value => value.id),
        'user': User.currentUser.login,
        'password': encoder.encode(User.currentUser.password)
    };
    fetch('/songs_list/' + songListId, {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(listData)
    }).then(response => {
        if (response.ok) {
            turnOffEditMode();
        } else {
            alert('Ошибка при отправке на сервер');
        }
    })
}

editButton.onclick = () => {
    if (editMode) {
        saveList();
    } else {
        loadSongsLists.then(() => {
            if (checkEditPermission())
                switchToEditMode();
        });
    }
}

saveListButton.onclick = () => {
    saveList();
}
