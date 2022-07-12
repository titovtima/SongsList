const songs_data_path = '/songs_data/';

let list = document.querySelector('#songs_list');

fetch(songs_data_path + 'songs_list.json')
    .then(response => response.json())
    .then(response => load_songs_list(response));

function load_songs_list(songs_list) {
    for (let song of songs_list.songs) {
        let ref = document.createElement('a');
        ref.append(song.name);
        ref.href = '/song?id=' + song.id;
        ref.className = 'ref_to_song_in_table';
        ref.style.display = 'block';
        list.append(ref);
    }
}
