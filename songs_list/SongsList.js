const songs_data_path = '/songs_data/';

let html_list = document.querySelector('#songs_list');

fetch(songs_data_path + 'songs_list.json')
    .then(response => response.json())
    .then(response => load_songs_list(response));

function load_songs_list(songs_list) {
    let list = [];
    for (let song of songs_list.songs) {
        let ref = document.createElement('a');
        ref.append(song.name);
        ref.href = '/song?id=' + song.id;
        ref.className = 'ref_to_song_in_table';
        let div = document.createElement('div');
        div.append(ref);
        list.push({name: song.name, element: div});
    }
    list.sort(sort_songs);
    for (let song of list)
        html_list.append(song.element);
}

function sort_songs(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}
