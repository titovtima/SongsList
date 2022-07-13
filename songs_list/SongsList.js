const songs_data_path = '/songs_data/';

let html_list = document.querySelector('#songs_list');
let add_song = document.querySelector('#add_song');
let main_scroll = document.querySelector('#main_scroll');
main_scroll.style.maxHeight = window.innerHeight - 100 + 'px';

fetch(songs_data_path + 'songs_list.json')
    .then(response => response.json())
    .then(response => load_songs_list(response));

let songs_list = [];
let max_id = 0;
function load_songs_list(list) {
    songs_list = [];
    for (let id in list) {
        max_id = Math.max(max_id, Number(id));
        let ref = document.createElement('a');
        ref.append(list[id].name);
        ref.href = '/song?id=' + id;
        ref.className = 'ref_to_song_in_table';
        let div = document.createElement('div');
        div.append(ref);
        songs_list.push({name: list[id].name, element: div});
    }
    songs_list.sort(sort_songs);
    for (let song of songs_list)
        html_list.append(song.element);

    add_song.href = `/song?id=${max_id+1}&edit=true`;
}

function sort_songs(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

function search_songs_by_name(name) {
    let new_list = songs_list.filter(
        (value, index, array) => value.name.toLowerCase().includes(name.trim().toLowerCase()));
    html_list.innerHTML = "";
    for (let song of new_list)
        html_list.append(song.element);
}

let search_input = document.querySelector('#song_search');
search_input.oninput = () => {
    search_input.style.width = '500px';
    search_input.style.width =
        Math.max(500, Math.min(window.innerWidth - 80, search_input.scrollWidth + 5)) + 'px';
    search_songs_by_name(search_input.value);
}
