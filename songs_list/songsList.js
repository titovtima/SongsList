let htmlList = document.querySelector('#songs_list');
let addNewSong = document.querySelector('#add_new_song');
let addSongByIdContainer = document.querySelector('#add_song_by_id_container');
let addSongById = document.querySelector('#add_song_by_id');
let songIdToAdd = document.querySelector('#song_id_to_add');
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

let songsListId;
let editMode = false;
let songsListData;
function getSongListIdFromURL() {
    let urlParts = window.location.toString().split('?')[0].split('/');
    let ind = urlParts.findIndex(value => value === 'songs_list');
    if (urlParts.length > ind + 1 && urlParts[ind + 1].length > 0) {
        songsListId = urlParts[ind + 1];
    }
    if (!songsListId)
        songsListId = 'new';
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
    songListScroll.style.maxHeight = window.innerHeight - 210 + 'px';
}

let loadAllSongs = fetch(SONGS_DATA_PATH + 'songs.json')
    .then(response => response.json());

let loadSongsLists = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())
    .then(response => {
        songsListData = response[songsListId];
    });

Promise.all([loadAllSongs, loadSongsLists, userCookiePromise]).then(response => {
    let listToShow = response[0];
    if (!songsListData) {
        songsListData = {
            'name': 'Новый список',
            'users_read': [ User.currentUser.login ],
            'users_write': [ User.currentUser.login ],
            'songs_ids': [ ]
        }
    }
    let songsIdToInclude = songsListData.songs_ids;
    for (let id in listToShow)
        if (!songsIdToInclude.includes(id))
            delete listToShow[id];
    loadSongsList(listToShow);
});

let songsList = [];
function loadSongsList(list) {
    listNameHeader.innerHTML = songsListData.name;
    listNameInput.value = songsListData.name;
    let pageTitle = document.querySelector('title');
    pageTitle.innerHTML = songsListData.name;

    songsList = [];
    for (let id in list) {
        pushSongToSongList(id, list[id].name);
    }

    addNewSong.href = `/song?id=new&edit=true`;

    loadSongsTexts().then(() => {
        searchSongInput.placeholder = 'Поиск песни';
    });
}

function pushSongToSongList(songId, songName) {
    htmlList.innerHTML = "";
    console.log('push song, id=', songId);
    let ref = document.createElement('a');
    ref.append(songName);
    ref.href = '/song/' + songId;
    ref.className = 'ref_to_song_in_table';
    let div = document.createElement('div');
    div.append(ref);
    songsList.push({name: songName, element: div, id: songId});
    songsList.sort(sortSongs);
    for (let song of songsList)
        htmlList.append(song.element);
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
async function loadSongsTexts() {
    let loadings = [];
    songsList.forEach(song => {
        loadings.push(loadSongText(song.id));
    });
    await Promise.all(loadings);
}

async function loadSongText(songId) {
    fetch(SONGS_DATA_PATH + songId + '.json')
        .then(response => response.json())
        .then(result => {
            let text_parts = result.text;
            let song_words = "";
            text_parts.forEach(part => song_words += part.text + " ");
            songsTexts[songId] = song_words;
        });
}

function searchSongsByText(text) {
    let words = text.trim().toLowerCase().split(' ');
    return songsList.filter(song => {
        if (words.every(word => song.name.toLowerCase().includes(word)))
            return true
        else
        if (songsTexts[song.id])
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
    addSongByIdContainer.style.display = 'block';
    saveListButton.style.display = 'block';
    usersListContainer.style.display = 'block';
    usersReadInput.value = songsListData.users_read.toString();
    usersWriteInput.value = songsListData.users_write.toString();

    listNameHeader.addEventListener('click', handlerClickOnHeader);

    editButton.style.backgroundImage = 'url("/assets/edit_on.png")';
}

function checkEditPermission() {
    return User.currentUser && songsListData.users_write && songsListData.users_write.includes(User.currentUser.login);
}

function turnOffEditMode() {
    editMode = false;
    addNewSong.style.display = 'none';
    addSongByIdContainer.style.display = 'none';
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
    if (usersWrite.length === 0) {
        alert('Нельзя сделать список без редакторов');
        return;
    }
    let listData = {
        'id': songsListId,
        'name': listNameInput.value.trim(),
        'users_read': usersRead,
        'users_write': usersWrite,
        'songs_ids': songsList.map(value => value.id),
        'user': User.currentUser.login,
        'password': User.currentUser.password
    };
    fetch('/songs_list/' + songsListId, {
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

userCookiePromise.then(() => {
    editButton.onclick = () => {
        if (editMode) {
            saveList();
        } else {
            loadSongsLists.then(() => {
                if (checkEditPermission())
                    switchToEditMode();
                else
                    alert('Нет доступа к редактированию');
            });
        }
    }
});

saveListButton.onclick = () => {
    saveList();
}

addSongById.onclick = () => {
    let songId = songIdToAdd.value;
    if (!songId) {
        alert('Не удалось найти песню');
        return;
    }
    if (songsList.some(value => value.id === songId)) {
        alert('Песня уже есть в списке');
        return;
    }
    fetch(SONGS_DATA_PATH + songId + '.json')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Не удалось найти песню\nили нет прав доступа');
                return new Promise(resolve => resolve(false));
            }
        })
        .then(response => {
            if (response) {
                pushSongToSongList(songId, response.name);
                loadSongText(songId);
            }
        });
}
