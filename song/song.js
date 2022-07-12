const songs_data_path = '/songs_data/';

const urlParams = new URLSearchParams(window.location.search);
const songNumber = urlParams.get('id');

let header = document.querySelector('#song_name');
let title = document.querySelector('title');

let chordsColumn = document.querySelector('.song_chords');
let textColumn = document.querySelector('.song_text');

fetch(songs_data_path + songNumber + '.json')
    .then(response => response.json())
    .then(response => load_song(response));

function load_song(song_data) {
    header.append(song_data.name);
    title.append(song_data.name);

    for (let part of song_data.text) {
        if (part.name) {
            let part_header = document.createElement('b');
            part_header.append(part.name);
            textColumn.append(part_header, '\n');
        }
        textColumn.append(part.text, '\n\n');
    }

    for (let part of song_data.chords) {
        if (part.name) {
            let part_header = document.createElement('b');
            part_header.append(part.name);
            chordsColumn.append(part_header, '\n');
        }
        chordsColumn.append(part.chords, '\n\n');
    }
}
