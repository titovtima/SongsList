const songs_data_path = '/songs_data/';

const urlParams = new URLSearchParams(window.location.search);
const songNumber = urlParams.get('id');

let edit_mode = false;
if (urlParams.get('edit')) {
    show_admin_confirm('edit');
}

let header = document.querySelector('#song_name');
let input_song_name = document.querySelector('#input_song_name');

function fit_header_font_size(start_size = 60, min_size = 30) {
    let header_font_size = start_size;
    header.style.fontSize = header_font_size + 'px';
    header.style.whiteSpace = 'normal';
    header.style.overflowY = 'scroll';
    while (header.scrollHeight > header.clientHeight && header_font_size > min_size) {
        header_font_size -= 1;
        header.style.fontSize = header_font_size + 'px';
    }
    input_song_name.style.fontSize = header_font_size;
    header.style.whiteSpace = 'nowrap';
    input_song_name.style.whiteSpace = 'nowrap';
    header.style.overflowY = 'hidden';
    header.style.overflowX = 'auto';
}

header.style.maxWidth = window.innerWidth - 200 + 'px';
input_song_name.style.maxWidth = window.innerWidth - 200 + 'px';

let title = document.querySelector('title');

let chords_display = document.querySelector('#song_chords_display');
let text_display = document.querySelector('#song_text_display');

let chords_column = document.querySelector('#chords_column');
let text_column = document.querySelector('#text_column');

fetch(songs_data_path + songNumber + '.json')
    .then(response => {
        if (response.ok) return response.json()
        else if (urlParams.has('edit')) return Promise.resolve({
            "name": "Новая песня",
            "text": [],
            "chords": []
        })
        else return Promise.resolve({
                "name": "Песня не найдена 😕",
                "text": [],
                "chords": []
        })
    })
    .then(response => load_song(response));

function load_song(data) {
    header.append(data.name);
    title.append(data.name);

    for (let part of data.text) {
        add_text_part(part)
    }

    for (let part of data.chords) {
        add_chords_part(part)
    }

    fit_header_font_size();
}

let text_parts = [];
let chords_parts = [];

function add_text_part(part) {
    let wrap_div = document.createElement('div');
    wrap_div.className = 'wrap_song_part_div';
    let part_text = document.createElement('pre');
    part_text.className = "song_text text display";
    part_text.style.marginBottom = '20px';
    if (part.name && part.name !== "") {
        let part_header = document.createElement('b');
        part_header.append(part.name);
        part_text.append(part_header, '\n');
    }
    part_text.append(part.text);
    wrap_div.append(part_text);
    wrap_div.song_data = {
        "name": part.name,
        "text": part.text
    }

    wrap_div.is_text = true;
    wrap_div.innerButtons = [];
    wrap_div.part_num = text_parts.length;
    text_parts.push(wrap_div);
    text_display.append(wrap_div);
    add_delete_cross(wrap_div);
    add_move_up_arrow(wrap_div);
    add_move_down_arrow(wrap_div);
    update_main_content_height();
}

function add_chords_part(part) {
    let wrap_div = document.createElement('div');
    wrap_div.className = 'wrap_song_part_div';
    let part_chords = document.createElement('pre');
    part_chords.className = "song_chords text display";
    part_chords.style.marginBottom = '20px';
    if (part.name && part.name !== "") {
        let part_header = document.createElement('b');
        part_header.append(part.name);
        part_chords.append(part_header, '\n');
    }
    part_chords.append(part.chords);
    wrap_div.append(part_chords);
    wrap_div.song_data = {
        "name": part.name,
        "chords": part.chords
    }

    wrap_div.is_chords = true;
    wrap_div.innerButtons = [];
    wrap_div.part_num = chords_parts.length;
    chords_parts.push(wrap_div);
    chords_display.append(wrap_div);
    add_delete_cross(wrap_div);
    add_move_up_arrow(wrap_div);
    add_move_down_arrow(wrap_div);
    update_main_content_height();
}

function redraw_song_text() {
    text_display.innerHTML = "";
    for (let part of text_parts) {
        text_display.append(part);
        update_inner_buttons_positions(part);
    }
    update_main_content_height();
}

function redraw_song_chords() {
    chords_display.innerHTML = "";
    for (let part of chords_parts) {
        chords_display.append(part);
        update_inner_buttons_positions(part);
    }
    update_main_content_height();
}

function add_delete_cross(parent) {
    let delete_cross = document.createElement('a');
    delete_cross.className = 'delete_song_part input pointer_over';
    delete_cross.onclick = () => {
        parent.remove();
        if (parent.is_text)
            text_parts.splice(parent.part_num, 1);
        if (parent.is_chords)
            chords_parts.splice(parent.part_num, 1);
        update_main_content_height();
    }
    if (edit_mode)
        delete_cross.style.display = 'block';
    parent.innerButtons.push(delete_cross);
    parent.append(delete_cross);
    update_inner_buttons_positions(parent);
}

function add_move_up_arrow(parent) {
    let arrow_up = document.createElement('a');
    arrow_up.className = 'move_song_part_up input pointer_over';
    arrow_up.onclick = () => {
        if (parent.part_num > 0) {
            let n = parent.part_num;
            parent.part_num = n-1;
            if (parent.is_text) {
                text_parts.splice(n - 1, 2, text_parts[n], text_parts[n - 1]);
                text_parts[n].part_num = n;
                redraw_song_text();
            }
            if (parent.is_chords) {
                chords_parts.splice(n - 1, 2, chords_parts[n], chords_parts[n - 1]);
                chords_parts[n].part_num = n;
                redraw_song_chords();
            }
        }
    }
    if (edit_mode)
        arrow_up.style.display = 'block';
    parent.innerButtons.push(arrow_up);
    parent.append(arrow_up);
    update_inner_buttons_positions(parent);
}

function add_move_down_arrow(parent) {
    let arrow_down = document.createElement('a');
    arrow_down.className = 'move_song_part_down input pointer_over';
    arrow_down.onclick = () => {
        if (parent.is_text) {
            if (parent.part_num < text_parts.length - 1) {
                let n = parent.part_num;
                parent.part_num = n + 1;
                text_parts.splice(n, 2, text_parts[n+1], text_parts[n]);
                text_parts[n].part_num = n;
                redraw_song_text();
            }
        }
        if (parent.is_chords) {
            if (parent.part_num < chords_parts.length - 1) {
                let n = parent.part_num;
                parent.part_num = n + 1;
                chords_parts.splice(n, 2, chords_parts[n+1], chords_parts[n]);
                chords_parts[n].part_num = n;
                redraw_song_chords();
            }
        }
    }
    if (edit_mode)
        arrow_down.style.display = 'block';
    parent.innerButtons.push(arrow_down);
    parent.append(arrow_down);
    update_inner_buttons_positions(parent);
}

function update_inner_buttons_positions(parent) {
    let parentPos = parent.getBoundingClientRect();
    let count = 0;
    for (let but of parent.innerButtons) {
        but.style.top = parentPos.top + 5 + main_scroll.scrollTop + 'px';
        but.style.left = parentPos.right - 10 - 20 * count + 'px';
        count++;
    }
}

function update_main_content_height() {
    let main_content = document.querySelector('.main_content');
    let text_column = document.querySelector('#text_column');
    let chords_column = document.querySelector('#chords_column');
    text_column.style.height = '0';
    chords_column.style.height = '0';
    main_content.style.height = Math.max(text_column.scrollHeight, chords_column.scrollHeight) + 'px';
    text_column.style.height = '100%';
    chords_column.style.height = '100%';
}

function show_admin_confirm(aim, data = null) {
    let overlay = document.querySelector('#overlay');
    let password_window = document.querySelector('#password_window');

    function exit_password_window() {
        document.removeEventListener('click', handler);
        if (!password_window) return;
        overlay.style.display = 'none';
        password_window.style.display = 'none';
        if (password_window.aim === 'edit') {
            let url_no_edit = new URL(document.location.href);
            url_no_edit.searchParams.delete('edit')
            document.location.href = url_no_edit;
        }
    }

    let password_input = document.querySelector('#password_input');
    let send_password = document.querySelector('#send_password');
    overlay.style.display = 'block';
    password_window.style.display = 'block';
    password_window.aim = aim;
    send_password.onsubmit = event => {
        event.preventDefault();

        overlay.style.display = 'none';
        password_window.style.display = 'none';
        if (password_input.value.toLowerCase() === 'jesus') {
            if (aim === 'edit')
                switch_to_edit_mode();
            if (aim === 'send')
                send_song_to_server(data);
        } else {
            alert('Введён неверный пароль');
            exit_password_window();
        }
    }

    let handler = event => {
        if (password_window.style.display === 'block') {
            let pwinPos = password_window.getBoundingClientRect();
            if (event.clientX > pwinPos.right + 5 || event.clientX < pwinPos.left - 5
                || event.clientY < pwinPos.top - 5 || event.clientY > pwinPos.bottom + 5) {
                exit_password_window();
            }
        }
    }

    document.addEventListener('click', handler);
}

function switch_to_edit_mode() {
    edit_mode = true;
    let inputElements = document.querySelectorAll('.input:not(#input_song_name)');
    inputElements.forEach(value => value.style.display = 'block');
    update_main_content_height();

    let add_text_label = document.querySelector('#input_text_label');
    let add_text = document.querySelector('#input_text');
    let add_chords_label = document.querySelector('#input_chords_label');
    let add_chords = document.querySelector('#input_chords');
    let add_text_form = document.querySelector('#add_text');
    let add_chords_form = document.querySelector('#add_chords');

    add_text.oninput = () => {
        add_text.style.height = '0';
        add_text.style.height = add_text.scrollHeight + 2 + 'px';
        update_main_content_height();
    }

    add_chords.oninput = () => {
        add_chords.style.height = '0';
        add_chords.style.height = add_text.scrollHeight + 1 + 'px';
        update_main_content_height();
    }

    add_text_form.onsubmit = event => {
        event.preventDefault();
        let new_part = {
            "name": add_text_label.value.trim(),
            "text": add_text.value
        }
        console.log('submit new text', new_part);
        add_text_label.value = "";
        add_text.value = "";
        add_text.style.height = '0';
        add_text_part(new_part);
    }

    add_chords_form.onsubmit = event => {
        event.preventDefault();
        let new_part = {
            "name": add_chords_label.value.trim(),
            "chords": add_chords.value
        }
        console.log('submit new chords', new_part);
        add_chords_label.value = "";
        add_chords.value = "";
        add_chords.style.height = '0';
        add_chords_part(new_part);
    }

    let input_song_name_form = document.querySelector('#input_song_name_form');
    header.onclick = () => {
        input_song_name.value = header.innerHTML;
        header.style.display = 'none';
        input_song_name.style.display = 'block';
    }

    function update_song_name() {
        header.innerHTML = input_song_name.value.trim();
        header.style.display = 'block';
        input_song_name.style.display = 'none';
        fit_header_font_size();
    }

    input_song_name_form.onsubmit = event => {
        event.preventDefault();
        update_song_name();
    }

    document.addEventListener('click', event => {
        if (input_song_name.style.display === 'block' && event.clientY > 120)
            update_song_name();
    });

    let send_song_form = document.querySelector('#send_song');
    send_song_form.onsubmit = event => {
        event.preventDefault();

        let song_data = {
            "name": header.innerHTML,
            "text": [],
            "chords": []
        };
        for (let elem of text_display.children) {
            song_data.text.push(elem.song_data);
        }
        for (let elem of chords_display.children) {
            song_data.chords.push(elem.song_data);
        }

        show_admin_confirm('send', song_data);
    }

    set_edit_button_url();
}

function send_song_to_server(song_data) {
    let req = new XMLHttpRequest();
    req.open('POST', document.URL, true, null, 'jesus');
    req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    console.log('song_data posted: ', song_data);
    req.send(JSON.stringify(song_data));

    req.onload = () => {
        if (req.status == 200){
            let url = new URL(document.URL);
            url.searchParams.delete('edit');
            document.location.href = url.toString();
        } else {
            alert('Не удалось сохранить песню');
        }
    }
}

function set_edit_button_url() {
    let url = new URL(document.URL);
    if (edit_mode)
        url.searchParams.delete('edit');
    else
        url.searchParams.set('edit', 'true');
    let edit_button = document.querySelector('#edit_button');
    edit_button.href = url;
}

set_edit_button_url();
