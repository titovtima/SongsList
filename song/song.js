const songs_data_path = '/songs_data/';

const urlParams = new URLSearchParams(window.location.search);
const songNumber = urlParams.get('id');

let edit_mode = false;
let show_blocks = 'both';

let header = document.querySelector('#song_name');
let input_song_name = document.querySelector('#input_song_name');

let title = document.querySelector('title');

let chords_display = document.querySelector('#song_chords_display');
let text_display = document.querySelector('#song_text_display');

let chords_column = document.querySelector('#chords_column');
let text_column = document.querySelector('#text_column');

let text_parts = [];
let chords_parts = [];

if (urlParams.get('edit')) {
    show_admin_confirm('edit');
}

function fit_header_font_size(start_size = 60, min_size = 30) {
    let header_font_size = start_size;
    header.style.fontSize = header_font_size + 'px';
    header.style.whiteSpace = 'normal';
    header.style.overflowY = 'scroll';
    while (header.scrollHeight > header.clientHeight && header_font_size > min_size) {
        header_font_size -= 1;
        header.style.fontSize = header_font_size + 'px';
    }
    input_song_name.value = header.innerHTML;
    input_song_name.style.fontSize = header_font_size;
    header.style.whiteSpace = 'nowrap';
    input_song_name.style.whiteSpace = 'nowrap';
    header.style.overflowY = 'hidden';
    header.style.overflowX = 'auto';
}

header.style.maxWidth = window.innerWidth - 200 + 'px';
input_song_name.style.maxWidth = window.innerWidth - 200 + 'px';

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

function add_text_part(part) {
    let wrap_div = document.createElement('div');
    wrap_div.className = 'wrap_song_part_div';
    add_text_data_to_wrap_div(wrap_div, part);

    wrap_div.is_text = true;
    wrap_div.part_num = text_parts.length;
    wrap_div.innerButtons = [];
    text_parts.push(wrap_div);
    text_display.append(wrap_div);
    add_edit_buttons_to_song_part(wrap_div);
    add_textarea_for_song_part(wrap_div, 'text');
}

function add_text_data_to_wrap_div(wrap_div, text_data) {
    let part_text = wrap_div.display_part;
    if (!part_text) {
        part_text = document.createElement('pre');
        part_text.className = "song_text text display_song_part";
        part_text.style.marginBottom = '20px';
        wrap_div.display_part = part_text;
        wrap_div.append(part_text);
    }
    part_text.innerHTML = "";
    if (text_data.name && text_data.name !== "") {
        let part_header = document.createElement('b');
        part_header.append(text_data.name);
        part_text.append(part_header, '\n');
    }
    part_text.append(text_data.text);
    wrap_div.song_data = {
        "name": text_data.name,
        "text": text_data.text
    }
}

function add_chords_part(part) {
    let wrap_div = document.createElement('div');
    wrap_div.className = 'wrap_song_part_div';
    add_chords_data_to_wrap_div(wrap_div, part);

    wrap_div.is_chords = true;
    wrap_div.innerButtons = [];
    wrap_div.part_num = chords_parts.length;
    chords_parts.push(wrap_div);
    chords_display.append(wrap_div);
    add_edit_buttons_to_song_part(wrap_div);
    add_textarea_for_song_part(wrap_div, 'chords');
}

function add_chords_data_to_wrap_div(wrap_div, chords_data) {
    let part_chords = wrap_div.display_part;
    if (!part_chords) {
        part_chords = document.createElement('pre');
        part_chords.className = "song_chords text display_song_part";
        part_chords.style.marginBottom = '20px';
        wrap_div.display_part = part_chords;
        wrap_div.append(part_chords);
    }
    part_chords.innerHTML = "";
    if (chords_data.name && chords_data.name !== "") {
        let part_header = document.createElement('b');
        part_header.append(chords_data.name);
        part_chords.append(part_header, '\n');
    }
    part_chords.append(chords_data.chords);
    wrap_div.song_data = {
        "name": chords_data.name,
        "chords": chords_data.chords
    }
}

function add_edit_buttons_to_song_part(wrap_div) {
    add_delete_cross(wrap_div);
    add_move_up_arrow(wrap_div);
    add_move_down_arrow(wrap_div);
    update_main_content_height();
}

function add_textarea_for_song_part(wrap_div, type) {
    let edit_form = document.createElement('form');
    edit_form.style.display = 'none';
    edit_form.style.width = Math.max(text_column.clientWidth, chords_column.clientWidth) - 40 + 'px';
    let header_input = document.createElement('input');
    header_input.type = 'text';
    header_input.className = `edit_song_part song_${type} part_header`;
    let part_input = document.createElement('textarea');
    part_input.className = `edit_song_part song_${type}`;

    part_input.oninput = () => {
        fit_textarea_height(part_input);
    }

    let submit_button = document.createElement('input');
    submit_button.type = 'submit';
    submit_button.value = 'Сохранить';
    submit_button.className = 'edit_song_part';
    edit_form.header_input = header_input;
    edit_form.part_input = part_input;
    edit_form.append(header_input);
    edit_form.append(part_input);
    edit_form.append(submit_button);

    submit_button.onclick = () => {
        wrap_div.button_clicked = true;
    }
    edit_form.onsubmit = event => {
        if (event)
            event.preventDefault();
        if (!wrap_div.edited) return;

        let part_data = {
            "name": header_input.value.trim()
        }
        if (wrap_div.is_text) {
            part_data.text = part_input.value;
            add_text_data_to_wrap_div(wrap_div, part_data);
        }
        if (wrap_div.is_chords) {
            part_data.chords = part_input.value;
            add_chords_data_to_wrap_div(wrap_div, part_data);
        }
        wrap_div.display_part.style.display = 'block';
        wrap_div.edit_form.style.display = 'none';
        wrap_div.edited = false;
        if (wrap_div.is_text)
            update_text_inner_buttons();
        if (wrap_div.is_chords)
            update_chords_inner_buttons();
    }
    wrap_div.edit_form = edit_form;
    wrap_div.append(edit_form);

    if (edit_mode) {
        wrap_div.addEventListener('click', event => {
            if (check_click_coords_not_button(event)) edit_song_part(wrap_div);
        });
    }
}

function edit_song_part(part) {
    if (part.edited) return;
    part.edited = true;
    part.edit_form.header_input.value = part.song_data.name;
    if (part.is_text)
        part.edit_form.part_input.value = part.song_data.text;
    if (part.is_chords)
        part.edit_form.part_input.value = part.song_data.chords;
    part.display_part.style.display = 'none';
    part.edit_form.style.display = 'block';
    fit_textarea_height(part.edit_form.part_input);
    if (part.is_text)
        update_text_inner_buttons();
    if (part.is_chords)
        update_chords_inner_buttons();
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
    delete_cross.className = 'delete_song_part input pointer_over song_part_button';
    delete_cross.onclick = () => {
        parent.button_clicked = true;
        parent.remove();
        if (parent.is_text) {
            text_parts.splice(parent.part_num, 1);
            update_text_inner_buttons();
        }
        if (parent.is_chords) {
            chords_parts.splice(parent.part_num, 1);
            update_chords_inner_buttons();
        }
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
    arrow_up.className = 'move_song_part_up input pointer_over song_part_button';
    arrow_up.onclick = () => {
        parent.button_clicked = true;
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
    arrow_down.className = 'move_song_part_down input pointer_over song_part_button';
    arrow_down.onclick = () => {
        parent.button_clicked = true;
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
    let right = window.innerWidth;
    if (parent.is_text)
        right = text_column.getBoundingClientRect().right;
    if (parent.is_chords)
        right = chords_column.getBoundingClientRect().right;
    right -= 40;
    for (let but of parent.innerButtons) {
        but.style.top = parentPos.top + main_scroll.scrollTop + 'px';
        but.style.left = right - 20 * count + 'px';
        count++;
    }
}

function update_text_inner_buttons() {
    text_parts.forEach(value => update_inner_buttons_positions(value));
}

function update_chords_inner_buttons() {
    chords_parts.forEach(value => update_inner_buttons_positions(value));
}

// text_column.addEventListener('scroll', () => {
//     text_parts.forEach(value => update_inner_buttons_positions(value, text_column.scrollLeft));
// });
// chords_column.addEventListener('scroll', () => {
//     chords_parts.forEach(value => update_inner_buttons_positions(value, chords_column.scrollLeft));
// });

function update_main_content_height() {
    let main_content = document.querySelector('.main_content');
    let text_column = document.querySelector('#text_column');
    let chords_column = document.querySelector('#chords_column');
    text_column.style.height = '0';
    chords_column.style.height = '0';
    switch (show_blocks) {
        case 'both':
            main_content.style.height = Math.max(text_column.scrollHeight, chords_column.scrollHeight) + 'px';
            break;
        case 'text':
            main_content.style.height = text_column.scrollHeight + chords_column.clientHeight + 60 + 'px';
            break;
        case 'chords':
            main_content.style.height = chords_column.scrollHeight + text_column.clientHeight + 60 + 'px';
            break;
    }
    text_column.style.height = '100%';
    chords_column.style.height = '100%';
}

function find_cookies() {
    let cookies = {};
    document.cookie.split('; ').forEach(value => {
        let pair = value.split('=');
        cookies[pair[0]] = pair[1];
    });
    return cookies;
}

async function checkPassword(password, user = null) {
    let p = fetch('/auth', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            "password": password,
            "user": user
        })
    });
    let response = await p;
    if (response.ok) {
        document.cookie = `user=${user}; max-age=2500000; path=/; samesite=lax`;
        document.cookie = `password=${password}; max-age=2500000; path=/; samesite=lax`;
        return true;
    }
    return false;
}

async function show_admin_confirm(aim, data = null) {
    let overlay = document.querySelector('#overlay');
    let password_window = document.querySelector('#password_window');

    let pwd = find_cookies().password;
    if (pwd && await checkPassword(pwd)) {
        exit_password_window(true);
        return;
    }

    async function exit_password_window(authorized = false) {
        if (!password_window) return;
        if (authorized || await checkPassword(password_input.value)) {
            overlay.style.display = 'none';
            password_window.style.display = 'none';
            let jsonString = '{"correct_password_entered": true}';
            ym(88797016, 'params', JSON.parse(jsonString));
            if (aim === 'edit')
                switch_to_edit_mode();
            if (aim === 'send')
                send_song_to_server(data);
        } else {
            overlay.style.display = 'none';
            password_window.style.display = 'none';
            alert('Введён неверный пароль');
            if (password_window.aim === 'edit') {
                let url_no_edit = new URL(document.location.href);
                url_no_edit.searchParams.delete('edit')
                document.location.href = url_no_edit;
            }
        }
    }

    let password_input = document.querySelector('#password_input');
    let send_password = document.querySelector('#send_password');
    overlay.style.display = 'block';
    password_window.style.display = 'block';
    password_window.aim = aim;
    send_password.onsubmit = event => {
        if (event)
            event.preventDefault();
        document.removeEventListener('click', handler);

        exit_password_window();
    }

    let handler = event => {
        let t = event.target;
        if (t !== password_window && !password_window.contains(t))
            exit_password_window();
    }

    document.addEventListener('click', handler);
}

function fit_textarea_height(elem) {
    elem.style.height = '0';
    elem.style.height = elem.scrollHeight + 2 + 'px';
    update_main_content_height();
}

function check_click_coords_not_button(event) {
    let t = event.target;
    return !t.className.includes('song_part_button');
}

function switch_to_edit_mode() {
    edit_mode = true;
    let inputElements = document.querySelectorAll('.input:not(#input_song_name)');
    inputElements.forEach(value => value.style.display = 'block');
    update_main_content_height();

    let add_text = document.querySelector('#add_text');
    let add_chords = document.querySelector('#add_chords');

    add_text.onclick = () => {
        let new_part = {
            "name": '',
            "text": ''
        }
        add_text_part(new_part);
        edit_song_part(text_parts[text_parts.length - 1]);
    }

    add_chords.onclick = () => {
        let new_part = {
            "name": '',
            "chords": ''
        }
        add_chords_part(new_part);
        edit_song_part(chords_parts[chords_parts.length - 1]);
    }

    let input_song_name_form = document.querySelector('#input_song_name_form');
    input_song_name.value = header.innerHTML;
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
        if (event)
            event.preventDefault();
        update_song_name();
    }

    document.addEventListener('click', event => {
        let h = document.querySelector('header');
        let t = event.target;
        let on_header = t === h || h.contains(t);
        if (input_song_name.style.display === 'block' && !on_header)
            update_song_name();
    });

    for (let part of text_parts)
        part.addEventListener('click', event => {
            if (check_click_coords_not_button(event)) edit_song_part(part);
        });
    for (let part of chords_parts)
        part.addEventListener('click', event => {
            if (check_click_coords_not_button(event)) edit_song_part(part);
        });

    let send_song_form = document.querySelector('#send_song');
    send_song_form.onsubmit = event => {
        if (event)
            event.preventDefault();

        let forms = document.querySelectorAll('form:not(#send_song):not(#send_password)')
        forms.forEach(value => {
            value.onsubmit();
        })

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
    req.open('POST', document.URL, true);
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

function changing_page_split() {
    let text_part = document.querySelector('#text_page_split');
    let text_header = document.querySelector('#text_column_header');
    let chords_part = document.querySelector('#chords_page_split');
    let chords_header = document.querySelector('#chords_column_header');
    let both_part = document.querySelector('#both_page_split');
    let both_header = document.querySelector('#both_column_header');

    let text_content = document.querySelector('#no_header_text_column');
    let chords_content = document.querySelector('#no_header_chords_column');
    let main_content = document.querySelector('.main_content');

    text_header.addEventListener('click', () => {
        show_blocks = 'text';
        main_content.innerHTML = '';
        main_content.append(both_part);
        main_content.append(chords_part);
        main_content.append(text_part);
        chords_content.style.display = 'none';
        chords_part.style.height = chords_header.clientHeight + 20 + 'px';
        chords_part.style.width = '50%';
        both_part.style.height = both_header.clientHeight + 20 + 'px';
        both_part.style.display = 'block';
        text_content.style.display = 'block';
        text_part.style.width = '100%';
        text_part.style.height = 'max-content';
        update_text_inner_buttons();
        update_chords_inner_buttons();
        update_main_content_height();
    });

    chords_header.addEventListener('click', () => {
        show_blocks = 'chords';
        main_content.innerHTML = '';
        main_content.append(both_part);
        main_content.append(text_part);
        main_content.append(chords_part);
        text_part.style.height = text_header.clientHeight + 20 + 'px';
        text_part.style.width = '50%';
        text_content.style.display = 'none';
        both_part.style.height = both_header.clientHeight + 20 + 'px';
        both_part.style.display = 'block';
        chords_content.style.display = 'block';
        chords_part.style.width = '100%';
        chords_part.style.height = 'max-content';
        update_text_inner_buttons();
        update_chords_inner_buttons();
        update_main_content_height();
    });

    both_header.addEventListener('click', () => {
        show_blocks = 'both';
        main_content.innerHTML = '';
        main_content.append(both_part);
        main_content.append(text_part);
        main_content.append(chords_part);
        both_part.style.display = 'none';
        text_content.style.display = 'block';
        text_part.style.width = '50%';
        text_part.style.height = '100%';
        chords_content.style.display = 'block';
        chords_part.style.width = '50%';
        chords_part.style.height = '100%';
        update_text_inner_buttons();
        update_chords_inner_buttons();
        update_main_content_height();
    });
}

changing_page_split();

window.addEventListener('resize', () => {
    update_chords_inner_buttons();
    update_text_inner_buttons();
})
