let loadSongsListsPromise = fetch(SONGS_DATA_PATH + 'songs_lists.json')
    .then(response => response.json())

let mainList = document.querySelector('#songs_lists_list');

Promise.all([loadSongsListsPromise, userCookiePromise])
    .then(response => { showSongsListsInfo(response[0], mainList); });

function showSongsListsInfo(data, container) {
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
        link.className += ' ref_to_songs_list';
        container.append(link);
    }
}

visitHistory.songs_list = null;
setVisitHistoryCookie();

let addSongsList = document.querySelector('#add_songs_list');
let refToUserPage = document.querySelector('#ref_to_user_page');

userCookiePromise.then(() => {
    if (User.currentUser)
        addSongsList.style.display = 'block';
    else
        refToUserPage.style.display = 'block';
})
