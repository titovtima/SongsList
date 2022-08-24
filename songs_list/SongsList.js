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
        songs_list.push({name: list[id].name, element: div, id: id});
    }
    songs_list.sort(sort_songs);
    for (let song of songs_list)
        html_list.append(song.element);

    add_song.href = `/song?id=${max_id+1}&edit=true`;

    load_songs_texts();
}

function sort_songs(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

function search_songs_by_name(name) {
    let words = name.trim().toLowerCase().split(' ');
    return songs_list.filter(song => words.every(word => song.name.toLowerCase().includes(word)));
}

let songs_text = {};
let songs_text_loaded = false;
async function load_songs_texts() {
    songs_list.forEach(song => {
        console.log('Loading song text ', song);
        fetch(songs_data_path + song.id + '.json')
            .then(response => response.json())
            .then(result => {
                let text_parts = result.text;
                let song_words = "";
                text_parts.forEach(part => song_words += part.text + " ");
                console.log(song_words);
                songs_text[song.id] = song_words;
            })
            .then(result => {
                songs_text_loaded = true;
            });
    });
}

function search_songs_by_text(text) {
    console.log('texts loaded: ', songs_text_loaded);
    let words = text.trim().toLowerCase().split(' ');
    return songs_list.filter(song => {
        if (words.every(word => song.name.toLowerCase().includes(word)))
            return true
        else
            if (songs_text_loaded)
                return words.every(word => songs_text[song.id].toLowerCase().includes(word));
            else return false;
    });
}

let search_input = document.querySelector('#song_search');
search_input.oninput = () => {
    search_input.style.width = '500px';
    search_input.style.width =
        Math.max(500, Math.min(window.innerWidth - 80, search_input.scrollWidth + 5)) + 'px';
    let new_list = search_songs_by_text(search_input.value);
    html_list.innerHTML = "";
    for (let song of new_list)
        html_list.append(song.element);
}
