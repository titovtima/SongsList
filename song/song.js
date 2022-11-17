const songs_data_path = '/songs_data/';

const urlParams = new URLSearchParams(window.location.search);
const songNumber = urlParams.get('id');

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    let mobile_css_link = document.createElement("link");
    mobile_css_link.rel = "stylesheet";
    mobile_css_link.type = "text/css";
    mobile_css_link.href = "song-mobile.css";
    let head = document.querySelector('head');
    head.append(mobile_css_link);
}

let edit_mode = false;

let header = document.querySelector('#song_name');
let input_song_name = document.querySelector('#input_song_name');

let title = document.querySelector('title');

let text_display = document.querySelector('#song_text_display');
let chords_display = document.querySelector('#song_chords_display');
let text_chords_display = document.querySelector('#song_text_chords_display');

let text_column = document.querySelector('#text_column');
let chords_column = document.querySelector('#chords_column');
let text_chords_column = document.querySelector('#text_chords_column');

if (urlParams.get('edit')) {
    showAdminConfirm('edit');
}

fetch(songs_data_path + songNumber + '.json')
    .then(response => {
        if (response.ok) return response.json()
        else if (urlParams.has('edit')) return Promise.resolve({
            "name": "Новая песня",
            "text": [],
            "chords": [],
            "text_chords": []
        })
        else return Promise.resolve({
                "name": "Песня не найдена 😕",
                "text": [],
                "chords": [],
                "text_chords": []
        })
    })
    .then(response => loadSong(response));

let song_data = undefined;
function loadSong(data) {
    song_data = data;
    let name = data.name;
    if (!name) name = '';
    header.append(name);
    title.append(name);

    if (data.text)
        for (let part of data.text) {
            new SongPart('text', part);
        }

    if (data.chords)
        for (let part of data.chords) {
            new SongPart('chords', part);
        }

    if (data.text_chords)
        for (let part of data.text_chords) {
            new SongPart('text_chords', part);
        }

    addKeyChooseLine();
    setView();
    fitHeaderFontSize();
    updateMainContentHeight();
}

let song_parts = {
    "text_parts": [],
    "chords_parts": [],
    "text_chords_parts": []
}

class SongPart {
    constructor(type, data) {
        this.type = type;
        let wrap_div = document.createElement('div');
        wrap_div.className = 'wrap_song_part_div';
        this.wrap_div = wrap_div;
        this.part_num = song_parts[type + '_parts'].length;
        this.innerButtons = [];
        this.addData(data);
        song_parts[type + '_parts'].push(this);
        if (this.type === 'text')
            text_display.append(wrap_div);
        if (this.type === 'chords')
            chords_display.append(wrap_div);
        if (this.type === 'text_chords')
            text_chords_display.append(wrap_div);
        if (edit_mode) {
            this.addEditButtons();
            this.addTextarea();
        }
    }

    addData(data, update_song_data = true) {
        if (update_song_data)
            this.data = data;
        let display_part = this.wrap_div.display_part;
        if (!display_part) {
            display_part = document.createElement('pre');
            display_part.className = `song_${this.type} ${this.type} display_song_part`;
            display_part.style.marginBottom = '20px';
            this.wrap_div.display_part = display_part;
            this.wrap_div.append(display_part);
        }
        display_part.innerHTML = "";
        if (data.name && data.name !== "") {
            let part_header = document.createElement('b');
            part_header.append(data.name);
            display_part.append(part_header, '\n');
        }
        display_part.append(data[this.type]);
    }

    addEditButtons() {
        this.addDeleteCross();
        this.addMoveUpArrow();
        this.addMoveDownArrow();
        updateMainContentHeight();
    }

    addDeleteCross() {
        let delete_cross = document.createElement('a');
        delete_cross.className = 'delete_song_part input pointer_over song_part_button';
        delete_cross.onclick = () => {
            // this.button_clicked = true;
            this.wrap_div.remove();
            if (this.type === 'text') {
                song_parts.text_parts.splice(this.part_num, 1);
                updateTextInnerButtons();
            }
            if (this.type === 'chords') {
                song_parts.chords_parts.splice(this.part_num, 1);
                updateChordsInnerButtons();
            }
            if (this.type === 'text_chords') {
                song_parts.text_chords_parts.splice(this.part_num, 1);
                updateTextChordsInnerButtons();
            }
            updateMainContentHeight();
        }
        if (edit_mode)
            delete_cross.style.display = 'block';
        this.innerButtons.push(delete_cross);
        this.wrap_div.append(delete_cross);
        this.updateInnerButtonsPositions();
    }

    addMoveUpArrow() {
        let arrow_up = document.createElement('a');
        arrow_up.className = 'move_song_part_up input pointer_over song_part_button';
        arrow_up.onclick = () => {
            // this.button_clicked = true;
            if (this.part_num > 0) {
                let n = this.part_num;
                this.part_num = n-1;
                if (this.type === 'text') {
                    song_parts.text_parts.splice(n - 1, 2,
                        song_parts.text_parts[n], song_parts.text_parts[n - 1]);
                    song_parts.text_parts[n].part_num = n;
                    redrawSongText();
                }
                if (this.type === 'chords') {
                    song_parts.chords_parts.splice(n - 1, 2,
                        song_parts.chords_parts[n], song_parts.chords_parts[n - 1]);
                    song_parts.chords_parts[n].part_num = n;
                    redrawSongChords();
                }
                if (this.type === 'text_chords') {
                    song_parts.text_chords_parts.splice(n - 1, 2,
                        song_parts.text_chords_parts[n], song_parts.text_chords_parts[n - 1]);
                    song_parts.text_chords_parts[n].part_num = n;
                    redrawSongTextChords();
                }
            }
        }
        if (edit_mode)
            arrow_up.style.display = 'block';
        this.innerButtons.push(arrow_up);
        this.wrap_div.append(arrow_up);
        this.updateInnerButtonsPositions();
    }

    addMoveDownArrow() {
        let arrow_down = document.createElement('a');
        arrow_down.className = 'move_song_part_down input pointer_over song_part_button';
        arrow_down.onclick = () => {
            // this.button_clicked = true;
            if (parent.part_num < song_parts[this.type + '_parts'].length - 1) {
                let n = this.part_num;
                this.part_num = n + 1;
                song_parts[this.type + '_parts'].splice(n, 2,
                    song_parts[this.type + '_parts'][n+1], song_parts[this.type + '_parts'][n]);
                song_parts[this.type + '_parts'][n].part_num = n;
                if (this.type === 'text') {
                    redrawSongText();
                }
                if (this.type === 'chords') {
                    redrawSongChords();
                }
                if (this.type === 'text_chords') {
                    redrawSongTextChords();
                }
            }
        }
        if (edit_mode)
            arrow_down.style.display = 'block';
        this.innerButtons.push(arrow_down);
        this.wrap_div.append(arrow_down);
        this.updateInnerButtonsPositions();
    }

    addTextarea() {
        let edit_form = document.createElement('form');
        edit_form.style.display = 'none';
        edit_form.className += ' edit_song_form';
        edit_form.style.width = Math.max(text_column.clientWidth, chords_column.clientWidth,
            text_chords_column.clientWidth) - 40 + 'px';
        let header_input = document.createElement('input');
        header_input.type = 'text';
        header_input.className = `edit_song_part song_${this.type} part_header`;
        let part_input = document.createElement('textarea');
        part_input.className = `edit_song_part song_${this.type}`;

        part_input.oninput = () => {
            fitTextareaHeight(part_input);
        }

        let submit_button = document.createElement('input');
        submit_button.type = 'submit';
        submit_button.value = 'Сохранить';
        submit_button.className = 'edit_song_part button';
        edit_form.header_input = header_input;
        edit_form.part_input = part_input;
        edit_form.append(header_input);
        edit_form.append(part_input);
        edit_form.append(submit_button);

        submit_button.onclick = () => {
            // this.button_clicked = true;
        }
        edit_form.onsubmit = event => {
            if (event)
                event.preventDefault();
            if (!this.edited) return;

            let part_data = {
                "name": header_input.value.trim()
            }
            if (this.type === 'text') {
                part_data.text = part_input.value;
            }
            if (this.type === 'chords') {
                part_data.chords = part_input.value;
            }
            if (this.type === 'text_chords') {
                part_data.text_chords = part_input.value;
            }
            this.addData(part_data);
            this.wrap_div.display_part.style.display = 'block';
            this.edit_form.style.display = 'none';
            this.edited = false;
            if (this.type === 'text')
                updateTextInnerButtons();
            if (this.type === 'chords')
                updateChordsInnerButtons();
            if (this.type === 'text_chords')
                updateTextChordsInnerButtons();
        }
        this.edit_form = edit_form;
        this.wrap_div.append(edit_form);

        if (edit_mode) {
            this.wrap_div.addEventListener('click', event => {
                if (checkClickCoordsNotButton(event)) this.edit();
            });
        }
    }

    edit() {
        if (this.edited) return;
        this.edited = true;
        this.edit_form.header_input.value = this.data.name;
        if (this.type === 'text')
            this.edit_form.part_input.value = this.data.text;
        if (this.type === 'chords')
            this.edit_form.part_input.value = this.data.chords;
        if (this.type === 'text_chords')
            this.edit_form.part_input.value = this.data.text_chords;
        this.wrap_div.display_part.style.display = 'none';
        this.edit_form.style.display = 'block';
        fitTextareaHeight(this.edit_form.part_input);
        if (this.type === 'text')
            updateTextInnerButtons();
        if (this.type === 'chords')
            updateChordsInnerButtons();
        if (this.type === 'text_chords')
            updateTextChordsInnerButtons();
    }

    updateInnerButtonsPositions() {
        let count = 0;
        for (let but of this.innerButtons) {
            but.style.right = 5 + 20 * count + 'px';
            but.style.top = this.wrap_div.offsetTop + 'px';
            count++;
        }
    }
}

function redrawSongText() {
    text_display.innerHTML = "";
    for (let part of song_parts.text_parts) {
        text_display.append(part.wrap_div);
        part.updateInnerButtonsPositions();
    }
    updateMainContentHeight();
}

function redrawSongChords() {
    chords_display.innerHTML = "";
    for (let part of song_parts.chords_parts) {
        chords_display.append(part.wrap_div);
        part.updateInnerButtonsPositions();
    }
    updateMainContentHeight();
}

function redrawSongTextChords() {
    text_chords_display.innerHTML = "";
    for (let part of song_parts.text_chords_parts) {
        text_chords_display.append(part.wrap_div);
        part.updateInnerButtonsPositions();
    }
    updateMainContentHeight();
}

function updateTextInnerButtons() {
    song_parts.text_parts.forEach(value => value.updateInnerButtonsPositions());
}

function updateChordsInnerButtons() {
    song_parts.chords_parts.forEach(value => value.updateInnerButtonsPositions());
}

function updateTextChordsInnerButtons() {
    song_parts.chords_parts.forEach(value => value.updateInnerButtonsPositions());
}

function fitHeaderFontSize(start_size = 60, min_size = 30) {
    let header_font_size = start_size;
    header.style.fontSize = header_font_size + 'px';
    header.style.whiteSpace = 'normal';
    header.style.overflowY = 'scroll';
    while (header.scrollHeight > header.clientHeight && header_font_size > min_size) {
        header_font_size -= 1;
        header.style.fontSize = header_font_size + 'px';
    }
    input_song_name.value = header.innerHTML;
    input_song_name.style.fontSize = header_font_size + 'px';
    header.style.whiteSpace = 'nowrap';
    input_song_name.style.whiteSpace = 'nowrap';
    header.style.overflowY = 'hidden';
    header.style.overflowX = 'auto';
}

header.style.maxWidth = window.innerWidth - 200 + 'px';
input_song_name.style.maxWidth = window.innerWidth - 200 + 'px';

function updateMainContentHeight() {
    let main_content = document.querySelector('.main_content');
    let text_column = document.querySelector('#text_column');
    let chords_column = document.querySelector('#chords_column');
    let text_chords_column = document.querySelector('#text_chords_column');
    text_column.style.height = '0';
    chords_column.style.height = '0';
    text_chords_column.style.height = '0';
    let main_height = 0;
    main_height = Math.max(main_height, text_column.scrollHeight);
    main_height = Math.max(main_height, chords_column.scrollHeight);
    main_height = Math.max(main_height, text_chords_column.scrollHeight);
    main_content.style.height = main_height + 'px';
    text_column.style.height = '100%';
    chords_column.style.height = '100%';
    text_chords_column.style.height = '100%';
}

function findCookies() {
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

async function showAdminConfirm(aim, data = null) {
    let overlay = document.querySelector('#overlay');
    let password_window = document.querySelector('#password_window');

    let pwd = findCookies().password;
    if (pwd && await checkPassword(pwd)) {
        exitPasswordWindow(true);
        return;
    }

    async function exitPasswordWindow(authorized = false) {
        if (!password_window) return;
        if (authorized || await checkPassword(password_input.value)) {
            overlay.style.display = 'none';
            password_window.style.display = 'none';
            let jsonString = '{"correct_password_entered": true}';
            ym(88797016, 'params', JSON.parse(jsonString));
            if (aim === 'edit')
                switchToEditMode();
            if (aim === 'send')
                sendSongToServer(data);
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

        exitPasswordWindow();
    }

    let handler = event => {
        let t = event.target;
        if (t !== password_window && !password_window.contains(t))
            exitPasswordWindow();
    }

    document.addEventListener('click', handler);
}

function fitTextareaHeight(elem) {
    elem.style.height = '0';
    elem.style.height = elem.scrollHeight + 2 + 'px';
    updateMainContentHeight();
}

function checkClickCoordsNotButton(event) {
    let t = event.target;
    return !t.className.includes('song_part_button');
}

function switchToEditMode() {
    edit_mode = true;

    let edit_button = document.querySelector('#edit_button');
    edit_button.style.backgroundImage = "url('/assets/edit_on.png')";

    let inputElements = document.querySelectorAll('.input:not(#input_song_name)');
    inputElements.forEach(value => value.style.display = 'block');
    updateMainContentHeight();

    let add_text = document.querySelector('#add_text');
    let add_chords = document.querySelector('#add_chords');
    let add_text_chords = document.querySelector('#add_text_chords');

    add_text.onclick = () => {
        let new_part = {
            "name": '',
            "text": ''
        }
        new SongPart('text', new_part);
        song_parts.text_parts[song_parts.text_parts.length - 1].edit();
    }

    add_chords.onclick = () => {
        let new_part = {
            "name": '',
            "chords": ''
        }
        new SongPart('chords', new_part);
        song_parts.chords_parts[song_parts.chords_parts.length - 1].edit();
    }

    add_text_chords.onclick = () => {
        let new_part = {
            "name": '',
            "text_chords": ''
        }
        new SongPart('text_chords', new_part);
        song_parts.text_chords_parts[song_parts.text_chords_parts.length - 1].edit();
    }

    let input_song_name_form = document.querySelector('#input_song_name_form');
    input_song_name.value = header.innerHTML;
    header.onclick = () => {
        input_song_name.value = header.innerHTML;
        header.style.display = 'none';
        input_song_name.style.display = 'block';
    }

    function updateSongName() {
        header.innerHTML = input_song_name.value.trim();
        header.style.display = 'block';
        input_song_name.style.display = 'none';
        fitHeaderFontSize();
    }

    input_song_name_form.onsubmit = event => {
        if (event)
            event.preventDefault();
        updateSongName();
    }

    document.addEventListener('click', event => {
        let h = document.querySelector('header');
        let t = event.target;
        let on_header = t === h || h.contains(t);
        if (input_song_name.style.display === 'block' && !on_header)
            updateSongName();
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
            "chords": [],
            "text_chords": []
        };
        for (let part of song_parts.text_parts) {
            song_data.text.push(part.data);
        }
        for (let part of song_parts.chords_parts) {
            song_data.chords.push(part.data);
        }
        for (let part of song_parts.text_chords_parts) {
            song_data.text_chords.push(part.data);
        }
        if (current_key !== null)
            song_data.key = current_key.name;

        showAdminConfirm('send', song_data);
    }

    setEditButtonUrl();
    // addKeyChooseLine();
}

function sendSongToServer(song_data) {
    let req = new XMLHttpRequest();
    req.open('POST', document.URL, true);
    req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    console.log('song_data posted: ', song_data);
    req.send(JSON.stringify(song_data));

    req.onerror = () => {
        alert('Не удалось сохранить песню');
    }

    req.onload = () => {
        document.location.href = `/song/?id=${req.response}`;
    }
}

function setEditButtonUrl() {
    let url = new URL(document.URL);
    if (edit_mode)
        url.searchParams.delete('edit');
    else
        url.searchParams.set('edit', 'true');
    let edit_button = document.querySelector('#edit_button');
    edit_button.href = url;
}

setEditButtonUrl();

function setView() {
    let text_view_button = document.querySelector('#text_view_button');
    let chords_view_button = document.querySelector('#chords_view_button');
    let text_chords_view_button = document.querySelector('#text_chords_view_button');

    // document.cookie = 'songs_view=1; max-age=-1';
    let cookie = findCookies().songs_view;
    console.log('view cookie: ', cookie);
    if (!cookie)
        cookie = 'text_chords';

    cookie = cookie.split('|');

    if (!edit_mode && song_parts && (!song_parts.text_chords_parts || song_parts.text_chords_parts.length === 0)) {
        text_chords_view_button.style.display = 'none';
        cookie = cookie.filter(value => value !== 'text_chords');
    }

    if (cookie.length === 0)
        cookie = ['text', 'chords'];

    if (!edit_mode && song_parts) {
        if (!song_parts.text_parts || song_parts.text_parts.length === 0) {
            text_view_button.style.display = 'none';
            cookie = cookie.filter(value => value !== 'text');
        }
        if (!song_parts.chords_parts || song_parts.chords_parts.length === 0) {
            chords_view_button.style.display = 'none';
            cookie = cookie.filter(value => value !== 'chords');
        }
    }

    if (cookie.includes('text'))
        text_view_button.style.fontWeight = 'bold';
    if (cookie.includes('chords'))
        chords_view_button.style.fontWeight = 'bold';
    if (cookie.includes('text_chords'))
        text_chords_view_button.style.fontWeight = 'bold';

    function changePageSplit() {
        let text_part = document.querySelector('#text_page_split');
        let chords_part = document.querySelector('#chords_page_split');
        let text_chords_part = document.querySelector('#text_chords_page_split');

        let split_part = 100 / Math.max(cookie.length, 1) + '%';

        if (cookie.includes('text')) {
            text_part.style.display = 'block';
            text_part.style.width = split_part;
            text_view_button.style.fontWeight = 'bold';
            text_view_button.style.border = '2px solid black';
            text_view_button.style.margin = '0';
        } else {
            text_part.style.display = 'none';
            text_view_button.style.fontWeight = 'normal';
            text_view_button.style.border = 'none';
            text_view_button.style.margin = '2px';
        }

        if (cookie.includes('chords')) {
            chords_part.style.display = 'block';
            chords_part.style.width = split_part;
            chords_view_button.style.fontWeight = 'bold';
            chords_view_button.style.border = '2px solid black';
            chords_view_button.style.margin = '0';
        } else {
            chords_part.style.display = 'none';
            chords_view_button.style.fontWeight = 'normal';
            chords_view_button.style.border = 'none';
            chords_view_button.style.margin = '2px';
        }

        if (cookie.includes('text_chords')) {
            text_chords_part.style.display = 'block';
            text_chords_part.style.width = split_part;
            text_chords_view_button.style.fontWeight = 'bold';
            text_chords_view_button.style.border = '2px solid black';
            text_chords_view_button.style.margin = '0';
        } else {
            text_chords_part.style.display = 'none';
            text_chords_view_button.style.fontWeight = 'normal';
            text_chords_view_button.style.border = 'none';
            text_chords_view_button.style.margin = '2px';
        }

        updateMainContentHeight();
        // updateTextInnerButtons();
        // updateChordsInnerButtons();
        updateTextareaWidth();
    }

    text_view_button.onclick = () => {
        if (cookie.includes('text')) {
            cookie = cookie.filter(value => value !== 'text');
        } else {
            cookie = cookie.filter(value => value !== 'text_chords');
            cookie.push('text');
        }

        console.log('change view cookie to', cookie.join('|'));
        document.cookie = `songs_view=${cookie.join('|')}`;
        changePageSplit();
    }

    chords_view_button.onclick = () => {
        if (cookie.includes('chords')) {
            cookie = cookie.filter(value => value !== 'chords');
        } else {
            cookie = cookie.filter(value => value !== 'text_chords');
            cookie.push('chords');
        }

        console.log('change view cookie to', cookie.join('|'));
        document.cookie = `songs_view=${cookie.join('|')}`;
        changePageSplit();
    }

    text_chords_view_button.onclick = () => {
        if (cookie.includes('text_chords')) {
            cookie = cookie.filter(value => value !== 'text_chords');
        } else {
            cookie = ['text_chords'];
        }

        console.log('change view cookie to', cookie.join('|'));
        document.cookie = `songs_view=${cookie.join('|')}`;
        changePageSplit();
    }

    changePageSplit();
}

function updateTextareaWidth() {
    let elements = document.querySelectorAll('textarea');
    elements.forEach(value => {
        value.parentNode.style.width = value.parentNode.parentNode.parentNode.parentNode.clientWidth - 20 + 'px';
        fitTextareaHeight(value);
    });
}

let current_key = null;
function addKeyChooseLine() {
    if (!song_data) return;
    document.querySelectorAll('.key_choose_container').forEach(container => {
        let origin_key = null;
        if (!song_data.key) {
            if (!edit_mode) {
                container.style.display = 'none';
                return;
            }
        } else {
            origin_key = MusicTheory.keyFromName(song_data.key);
        }
        container.style.display = 'block';

        if (!origin_key && !edit_mode) {
            container.style.display = 'none';
            return;
        }
        current_key = origin_key;
        let keys = [];

        if (edit_mode || !origin_key || origin_key.mode === '') {
            keys.push('C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B');
        }
        if (edit_mode || !origin_key || origin_key.mode === 'm') {
            keys.push('Am', 'B♭m', 'Bm', 'Cm', 'C♯m', 'Dm', 'D♯m', 'Em', 'Fm', 'F♯m', 'Gm', 'G♯m');
        }

        let keys_buttons_images = {}
        keys.forEach(key => {
            let button = document.createElement('div');
            button.className += ' key_choose_button';
            let img = document.createElement('img');
            img.src = '/assets/key_background.png';
            img.className += ' key_choose_image';
            keys_buttons_images[key] = img;
            button.append(img);
            let text = document.createElement('h4');
            text.innerHTML = key;
            text.className += ' key_choose_text';
            button.append(text);
            container.append(button);

            button.onclick = () => {
                current_key = MusicTheory.keyFromName(key);
                if (!origin_key) {
                    origin_key = current_key;
                    img.src = '/assets/key_background_on.png';
                } else if (origin_key.name === key && edit_mode) {
                    origin_key = null;
                    current_key = null;
                    img.src = '/assets/key_background.png';
                } else {
                    song_parts.chords_parts.forEach(part => {
                        let chords_text = MusicTheory.chordsTextFromPlainText(part.data.chords);
                        try {
                            let new_chords = MusicTheory
                                .transposeChordsText(chords_text, origin_key, current_key).toString();
                            part.addData({
                                "name": part.data.name,
                                "chords": new_chords
                            }, edit_mode);
                        } catch (e) {
                        }
                    });
                    song_parts.text_chords_parts.forEach(part => {
                        let chords_text = MusicTheory.chordsTextFromPlainText(part.data.text_chords);
                        try {
                            let new_chords = MusicTheory
                                .transposeChordsText(chords_text, origin_key, current_key, true).toString();
                            part.addData({
                                "name": part.data.name,
                                "text_chords": new_chords
                            }, edit_mode);
                        } catch (e) {
                        }
                    });
                    for (let k in keys_buttons_images) {
                        keys_buttons_images[k].src = '/assets/key_background.png'
                    }
                    img.src = '/assets/key_background_on.png';
                    if (edit_mode)
                        origin_key = current_key;
                }
            };

            if (origin_key && key === origin_key.name)
                img.src = '/assets/key_background_on.png';
        });
    });
    updateMainContentHeight();
    // updateChordsInnerButtons();
    // updateTextChordsInnerButtons();
}

// window.addEventListener('resize', () => {
    // updateChordsInnerButtons();
    // updateTextInnerButtons();
// })
