let htmlList = document.querySelector('#songs_list');
let addSong = document.querySelector('#add_song');
let songListScroll = document.querySelector('#song_list_scroll');
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
updateElementMaxHeightToPageBottom(songListScroll);

let loadAllSongs = fetch(SONGS_DATA_PATH + 'songs.json')
    .then(response => response.json());
Promise.all([loadAllSongs, userCookiePromise]).then(response => {
        let listToShow = response[0];
        let loadSongsPromises = [];
        for (let id in listToShow) {
            let promise = fetch(SONGS_DATA_PATH + id + '.json')
                .then(response => response.json())
                .then(result => {
                    if (result.private
                        && !(result.users_read && User.currentUser && result.users_read.includes(User.currentUser.login))
                        && !(result.users_write && User.currentUser && result.users_write.includes(User.currentUser.login))
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
        Promise.all(loadSongsPromises).then(() => {
            loadSongsList(listToShow);
        });
    });

let loadSongsLists = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())
Promise.all([loadSongsLists, userCookiePromise]).then(response => showSongsListsInfo(response[0]));

let songsList = [];
function loadSongsList(list) {
    songsList = [];
    htmlList.innerHTML = "";
    for (let id in list) {
        let ref = document.createElement('a');
        ref.append(list[id].name);
        ref.href = '/song/' + id;
        ref.className = 'ref_to_song_in_table';
        let div = document.createElement('div');
        div.append(ref);
        songsList.push({name: list[id].name, element: div, id: id});
    }
    songsList.sort(sortSongs);
    for (let song of songsList)
        htmlList.append(song.element);

    searchSongInput.placeholder = 'Поиск песни';
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

let mainSongsListDisplay = document.querySelector('#main_songs_list_display');
let personalSongsLists = document.querySelector('#personal_songs_lists');

function updatePersonalSongsListsPosition() {
    if (User.currentUser) {
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
}

userCookiePromise.then(() => {
    if (User.isAdmin || User.currentUser) {
        addSong.style.display = 'inline';
    }
    if (User.currentUser) {
        updatePersonalSongsListsPosition();
        personalSongsLists.style.display = 'block';
    }
});

window.addEventListener('resize', () => {
    updatePersonalSongsListsPosition();
});

function showSongsListsInfo(data) {
    let user = User.currentUser;
    for (let listId in data) {
        let list = data[listId];
        let usersRead = list.users_read;
        let usersWrite = list.users_write;
        if (!list.public && (!user || (!usersRead.includes(user.login) && !usersWrite.includes(user.login))))
            continue;
        let link = document.createElement('a');
        link.append(list.name);
        link.href = '/songs_list/' + listId;
        link.style.display = 'block';
        personalSongsLists.append(link);
    }
}
