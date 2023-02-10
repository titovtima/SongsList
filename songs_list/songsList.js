let htmlList = document.querySelector('#songs_list');
let addSongByIdContainer = document.querySelector('#add_song_by_id_container');
let addSongById = document.querySelector('#add_song_by_id');
let songIdToAdd = document.querySelector('#song_id_to_add');
let songListScroll = document.querySelector('#song_list_scroll');
let searchSongInput = document.querySelector('#song_search');
let saveListButton = document.querySelector('#save_list_button');
let listNameHeader = document.querySelector('#list_name');
let listNameInput = document.querySelector('#input_list_name');
let usersListContainer = document.querySelector('#users_lists_container');
let usersReadInput = document.querySelector('#users_read_input');
let usersWriteInput = document.querySelector('#users_write_input');
let editButton = document.querySelector('#edit_button');
let sendButtonLine = document.querySelector('#send_button_line');

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

visitHistory.songs_list = songsListId;
setVisitHistoryCookie();

if(isMobile) {
    addCssFiles(['/general-mobile.css']);
}

let loadAllSongs = fetch(SONGS_DATA_PATH + 'songs.json')
    .then(response => response.json());

let loadSongsLists = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())
    .then(response => {
        songsListData = response[songsListId];
    });

let allSongsList;
Promise.all([loadAllSongs, loadSongsLists, userCookiePromise]).then(response => {
    allSongsList = response[0];
    if (songsListId === 'new') {
        songsListData = {
            'name': 'Новый список',
            'users_read': [User.currentUser.login],
            'users_write': [User.currentUser.login],
            'songs_ids': []
        }
    }
    if (!songsListData || !songsListData.users_read || !songsListData.users_write || !User.currentUser ||
        (!songsListData.users_read.includes(User.currentUser.login) &&
            !songsListData.users_write.includes(User.currentUser.login))) {
        songsListData = {
            'name': 'Список не найден',
            'users_read': [],
            'users_write': [],
            'songs_ids': []
        };
    }
    loadSongsWithIds();
});

function loadSongsWithIds(songsIds = songsListData.songs_ids) {
    let listToShow = {};
    for (let id in allSongsList)
        if (songsIds.includes(id))
            listToShow[id] = allSongsList[id];
    loadSongsList(listToShow);
}

let songsList = [];
function loadSongsList(list = songsListData.songs_ids) {
    listNameHeader.innerHTML = songsListData.name;
    listNameInput.value = songsListData.name;
    let pageTitle = document.querySelector('title');
    pageTitle.innerHTML = songsListData.name;

    songsList = [];
    for (let id in list) {
        pushSongToSongList(id, list[id].name);
    }

    loadSongsTexts().then(() => {
        searchSongInput.placeholder = 'Поиск песни';
    });

    updateElementMaxHeightToPageBottom(songListScroll, mainScrollMarginToBottom);
}

function pushSongToSongList(songId, songName) {
    htmlList.innerHTML = "";
    let ref = document.createElement('a');
    ref.append(songName);
    ref.href = '/song/' + songId;
    ref.className = 'ref_to_song_in_table';
    let deleteCross = document.createElement('span');
    deleteCross.className += ' delete_song_cross';
    deleteCross.onclick = () => {
        songsListData.songs_ids = songsListData.songs_ids.filter(value => value !== songId);
        loadSongsWithIds();
    }
    let div = document.createElement('div');
    div.style.whiteSpace = 'nowrap';
    div.append(deleteCross);
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

let editStyleElement = document.createElement('style');
editStyleElement.innerHTML =
    "#add_new_song, #add_song_by_id_container, #save_list_button, #users_lists_container " +
    " { display: block }\n" +
    ".delete_song_cross { display: inline-block }\n" +
    "#edit_button { background-image: url(\"/assets/edit_on.png\") }";
function switchToEditMode() {
    editMode = true;
    usersReadInput.value = songsListData.users_read.toString();
    usersWriteInput.value = songsListData.users_write.toString();
    document.body.append(editStyleElement);

    listNameHeader.addEventListener('click', handlerClickOnHeader);

    updateElementMaxHeightToPageBottom(songListScroll, mainScrollMarginToBottom + sendButtonLine.scrollHeight);
}

function checkEditPermission() {
    return User.currentUser && songsListData.users_write && songsListData.users_write.includes(User.currentUser.login);
}

function turnOffEditMode() {
    editMode = false;
    document.body.removeChild(editStyleElement);

    listNameHeader.removeEventListener('click', handlerClickOnHeader);

    updateElementMaxHeightToPageBottom(songListScroll, mainScrollMarginToBottom);
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
            return response.text();
        } else {
            alert('Ошибка при отправке на сервер');
        }
    }).then(response => {
        if (response === songsListId) {
            songsListData = listData;
            turnOffEditMode();
        } else {
            document.location.href = '/songs_list/' + response;
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
                songsListData.songs_ids.push(songId);
                addSongReadersAndWriters(songId, response);
                loadSongText(songId);
            }
        });
}

async function addSongReadersAndWriters(songId, songData = null) {
    if (!songData)
        songData = await fetch(SONGS_DATA_PATH + songId + '.json')
            .then(response => response.json())
    if (!songData.private)
        return;
    for (let user of songsListData.users_read)
        if (!songData.users_read.includes(user))
            songData.users_read.push(user);
    for (let user of songsListData.users_write)
        if (!songData.users_write.includes(user))
            songData.users_write.push(user);
    fetch('/song/' + songId + '?edit=true', {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(songData)
    });
}
