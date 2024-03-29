let headerStartFontSize, headerMinFontSize;

if(isMobile) {
    headerMinFontSize = 40;
    headerStartFontSize = 75;
}

let mainScroll = document.querySelector('#main_scroll');
updateElementMaxHeightToPageBottom(mainScroll, mainScrollMarginToBottom);

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

let mainContent = document.querySelector('.main_content');

let songData = undefined;
let songWasPrivate = false;

const urlParams = new URLSearchParams(window.location.search);
let songId;
function getSongIdFromUrl() {
    let urlParts = window.location.toString().split('?')[0].split('/');
    let ind = urlParts.findIndex(value => value === 'song');
    if ((urlParts.length > ind + 1) && urlParts[ind + 1].length > 0) {
        songId = urlParts[ind + 1];
    } else {
        songId = urlParams.get('id');
    }
    if (!songId)
        songId = 'new';
}
getSongIdFromUrl();

function loadSong(data) {
    songData = data;
    checkEditPermission();
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
            let chords = MusicTheory.chordsTextFromPlainText(part.chords);
            MusicTheory.changeChordsTextNotation(chords, settings.notation);
            part.chords = MusicTheory.chordsTextToString(chords);
            new SongPart('chords', part);
        }

    if (data.text_chords)
        for (let part of data.text_chords) {
            let text_chords = MusicTheory.chordsTextFromPlainText(part.text_chords);
            MusicTheory.changeChordsTextNotation(text_chords, settings.notation, true);
            part.text_chords = MusicTheory.chordsTextToString(text_chords);
            new SongPart('text_chords', part);
        }

    if (data.text_notes) {
        makeLinksInString(textNotesView, data.text_notes, 'https://');
    }

    songWasPrivate = data.private;

    addKeyChooseLine();
    setView();
    fitHeaderFontSize();
    let interval = setInterval(() => {
        updateMainContentHeight();
        if (edit_mode) {
            updateTextInnerButtons();
            updateChordsInnerButtons();
            updateTextChordsInnerButtons();
        }
    }, 1000);
    // setTimeout(() => clearInterval(interval), 20000);
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
        if (update_song_data) {
            this.data = data;
            songData[this.type][this.part_num] = data;
        }
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
            song_parts[this.type + '_parts'].splice(this.part_num, 1);
            songData[this.type].splice(this.part_num, 1);
            for (let id = this.part_num; id < song_parts[this.type + '_parts'].length; id++) {
                song_parts[this.type + '_parts'][id].part_num--;
            }
            if (this.type === 'text') {
                redrawSongText();
            }
            if (this.type === 'chords') {
                redrawSongChords();
            }
            if (this.type === 'text_chords') {
                redrawSongTextChords();
            }
            // updateMainContentHeight();
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
                songData[this.type].splice(n-1, 2, songData[this.type][n], songData[this.type][n-1]);
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
            if (this.part_num < song_parts[this.type + '_parts'].length - 1) {
                let n = this.part_num;
                this.part_num = n + 1;
                song_parts[this.type + '_parts'].splice(n, 2,
                    song_parts[this.type + '_parts'][n+1], song_parts[this.type + '_parts'][n]);
                song_parts[this.type + '_parts'][n].part_num = n;
                songData[this.type].splice(n, 2, songData[this.type][n+1], songData[this.type][n]);
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
    song_parts.text_chords_parts.forEach(value => value.updateInnerButtonsPositions());
}

if (!headerMinFontSize) {
    headerMinFontSize = 30;
}
if (!headerStartFontSize) {
    headerStartFontSize = 60;
}
function fitHeaderFontSize(start_size = headerStartFontSize, min_size = headerMinFontSize) {
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

header.style.maxWidth = window.innerWidth - 20 + 'px';
input_song_name.style.maxWidth = window.innerWidth - 20 + 'px';

function updateMainContentHeight() {
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
    mainContent.style.height = main_height + 'px';
    text_column.style.height = '100%';
    chords_column.style.height = '100%';
    text_chords_column.style.height = '100%';
}

function fitTextareaHeight(elem) {
    elem.style.height = '0';
    elem.style.height = elem.scrollHeight + 2 + 'px';
    if (mainContent.contains(elem))
        updateMainContentHeight();
}

function checkClickCoordsNotButton(event) {
    let t = event.target;
    return !t.className.includes('song_part_button');
}

let privateSettingsLine = document.querySelector('#private_settings_line');
let privateCheckbox = document.querySelector('#private_checkbox');
let usersListContainer = document.querySelector('#users_lists_container');
let usersReadInput = document.querySelector('#users_read_input');
let usersWriteInput = document.querySelector('#users_write_input');
let textNotesView = document.querySelector('#text_notes_view');
let textNotesInput = document.querySelector('#text_notes_input');
let textNotesContainer = document.querySelector('#text_notes_container');
let sendSongForm = document.querySelector('#send_song');

function switchToEditMode() {
    ym(88797016,'reachGoal','edit_song');
    edit_mode = true;
    if (isMobile) {
        mainScrollMarginToBottom += 130;
        updateElementMaxHeightToPageBottom(mainScroll, mainScrollMarginToBottom);
    }

    let edit_button = document.querySelector('#edit_button');
    edit_button.style.backgroundImage = "url('/assets/edit_on.png')";

    let inputElements = document.querySelectorAll('.input:not(#input_song_name)');
    inputElements.forEach(value => value.style.display = 'block');
    updateMainContentHeight();

    let addText = document.querySelector('#add_text');
    let addChords = document.querySelector('#add_chords');
    let addTextChords = document.querySelector('#add_text_chords');

    addText.onclick = () => {
        let newPart = {
            "name": '',
            "text": ''
        }
        new SongPart('text', newPart);
        song_parts.text_parts[song_parts.text_parts.length - 1].edit();
    }

    addChords.onclick = () => {
        let newPart = {
            "name": '',
            "chords": ''
        }
        new SongPart('chords', newPart);
        song_parts.chords_parts[song_parts.chords_parts.length - 1].edit();
    }

    addTextChords.onclick = () => {
        let newPart = {
            "name": '',
            "text_chords": ''
        }
        new SongPart('text_chords', newPart);
        song_parts.text_chords_parts[song_parts.text_chords_parts.length - 1].edit();
    }

    let inputSongNameForm = document.querySelector('#input_song_name_form');
    input_song_name.value = header.innerHTML;
    header.onclick = () => {
        input_song_name.value = header.innerHTML;
        header.style.display = 'none';
        input_song_name.style.display = 'block';
    }

    function updateSongName() {
        let name = input_song_name.value.trim();
        header.innerHTML = name;
        header.style.display = 'block';
        input_song_name.style.display = 'none';
        songData.name = name;
        fitHeaderFontSize();
    }

    inputSongNameForm.onsubmit = event => {
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

    privateSettingsLine.style.display = 'block';
    if (songData && songData.private)
        privateCheckbox.checked = true;
    updatePrivateSettingsLine();

    sendSongForm.onsubmit = event => {
        if (event)
            event.preventDefault();

        let forms = document.querySelectorAll('.edit_song_form');
        forms.forEach(value => {
            value.onsubmit();
        });

        songData.private = privateCheckbox.checked;
        let usersRead = usersReadInput.value.split(', ');
        usersRead = usersRead.map(value => value.split(',')).flat();
        usersRead = usersRead.map(value => value.split(' ')).flat().filter(value => value.length > 0);
        songData.users_read = usersRead;
        let usersWrite = usersWriteInput.value.split(', ');
        usersWrite = usersWrite.map(value => value.split(',')).flat();
        usersWrite = usersWrite.map(value => value.split(' ')).flat().filter(value => value.length > 0);
        songData.users_write = usersWrite;

        // let songDataToSend = fillSongData();

        if (songData.private && songData.users_write.length === 0) {
            alert('Нельзя сделать приватную песню без редакторов');
        } else {
            if (!songWasPrivate || !songData.private) {
                User.checkAdmin(authorized => {
                    if (authorized) {
                        sendSongToServer(songData);
                    }
                });
            } else {
                sendSongToServer(songData);
            }
        }
    }

    let handlerClickOutOfTextNotes = event => {
        if (event.target !== textNotesContainer && !textNotesContainer.contains(event.target)) {
            songData.text_notes = textNotesInput.value;
            makeLinksInString(textNotesView, songData.text_notes, 'https://');
            textNotesInput.style.display = 'none';
            textNotesView.style.display = 'block';
            document.removeEventListener('click', handlerClickOutOfTextNotes);
        }
    };

    textNotesView.onclick = () => {
        if (songData.text_notes)
            textNotesInput.value = songData.text_notes;
        textNotesView.style.display = 'none';
        textNotesInput.style.display = 'block';
        fitTextareaHeight(textNotesInput);

        document.addEventListener('click', handlerClickOutOfTextNotes);
    };

    textNotesView.style.minHeight = '100px';
    textNotesInput.style.minHeight = '100px';

    textNotesInput.oninput = () => {
        fitTextareaHeight(textNotesInput);
    }

    setEditButtonUrl();
}

function makeLinksInString(elem, string, linkStart) {
    let index = string.indexOf(linkStart);
    let endLink = 0;
    let result = '';
    elem.innerHTML = '';
    while (index !== -1) {
        result += string.substring(endLink, index);
        elem.append(string.substring(endLink, index));
        endLink = string.split('').findIndex((value, ind) =>
            ind >= index + linkStart.length && [' ', ',', ';', ')', '(', '\n'].some(it => it === value));
        if (endLink === -1)
            endLink = string.length;
        let linkString = string.substring(index, endLink);
        let link = document.createElement('a');
        link.append(linkString);
        link.href = linkString;
        link.target = '_blank';
        elem.append(link);
        result += '<a>' + string.substring(index, endLink) + '</a>';
        index = string.indexOf(linkStart, endLink);
    }
    elem.append(string.substring(endLink));
    result += string.substring(endLink);
    return result;
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
        ym(88797016,'reachGoal','save_song');
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
        cookie = ['text'];

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
        cookie = ['text'];
        // if (cookie.includes('text')) {
        //     cookie = cookie.filter(value => value !== 'text');
        // } else {
        //     cookie = cookie.filter(value => value !== 'text_chords');
        //     cookie.push('text');
        // }
        //
        // console.log('change view cookie to', cookie.join('|'));
        document.cookie = `songs_view=${cookie.join('|')}`;
        changePageSplit();
    }

    chords_view_button.onclick = () => {
        cookie = ['chords'];
        // if (cookie.includes('chords')) {
        //     cookie = cookie.filter(value => value !== 'chords');
        // } else {
        //     cookie = cookie.filter(value => value !== 'text_chords');
        //     cookie.push('chords');
        // }
        //
        // console.log('change view cookie to', cookie.join('|'));
        document.cookie = `songs_view=${cookie.join('|')}`;
        changePageSplit();
    }

    text_chords_view_button.onclick = () => {
        cookie = ['text_chords'];
        // if (cookie.includes('text_chords')) {
        //     cookie = cookie.filter(value => value !== 'text_chords');
        // } else {
        //     cookie = ['text_chords'];
        // }
        //
        // console.log('change view cookie to', cookie.join('|'));
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

let keyBackground = '/assets/key_background.png';
let keyBackgroundOn = '/assets/key_background_on.png';

if (colorTheme === 'dark') {
    keyBackground = '/assets/key_background_dark.png';
    keyBackgroundOn = '/assets/key_background_on_dark.png';
}

let current_key = null;
function addKeyChooseLine() {
    if (!songData) return;

    let origin_key = null;
    if (songData.key)  {
        origin_key = MusicTheory.keyFromName(songData.key);
    }
    current_key = origin_key;
    let keys = [];

    if (edit_mode || !origin_key || origin_key.mode === '') {
        keys.push('C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B');
    }
    if (edit_mode || !origin_key || origin_key.mode === 'm') {
        keys.push('Am', 'B♭m', 'Bm', 'Cm', 'C♯m', 'Dm', 'D♯m', 'Em', 'Fm', 'F♯m', 'Gm', 'G♯m');
    }
    // keys = keys.map(value => MusicTheory.keyFromName(value));

    let keys_buttons_images = {};
    keys.forEach(key => keys_buttons_images[key] = []);

    document.querySelectorAll('.key_choose_container').forEach(container => {
        if (!origin_key && !edit_mode) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';

        keys.forEach(key_name => {
            let key = MusicTheory.keyFromName(key_name);
            let notation_key_name = MusicTheory.keyName(key, settings.notation);
            let button = document.createElement('div');
            button.className += ' key_choose_button';
            let img = document.createElement('img');
            img.src = keyBackground;
            img.className += ' key_choose_image';
            keys_buttons_images[key_name].push(img);
            button.append(img);
            let text = document.createElement('h4');
            text.innerHTML = notation_key_name;
            text.className += ' key_choose_text';
            button.append(text);
            container.append(button);

            button.onclick = () => {
                current_key = key;
                if (!origin_key) {
                    origin_key = current_key;
                    songData.key = MusicTheory.keyName(current_key);
                    img.src = keyBackgroundOn;
                } else if (MusicTheory.keyName(origin_key) === key_name && edit_mode) {
                    origin_key = null;
                    current_key = null;
                    img.src = keyBackground;
                } else {
                    song_parts.chords_parts.forEach(part => {
                        let chords_text = MusicTheory.chordsTextFromPlainText(part.data.chords, settings.notation);
                        try {
                            let new_chords = MusicTheory.chordsTextToString(
                                MusicTheory.transposeChordsText(chords_text, origin_key, current_key));
                            part.addData({
                                "name": part.data.name,
                                "chords": new_chords
                            }, edit_mode);
                        } catch (e) {
                        }
                    });
                    song_parts.text_chords_parts.forEach(part => {
                        let chords_text = MusicTheory.chordsTextFromPlainText(part.data.text_chords, settings.notation);
                        try {
                            let new_chords = MusicTheory.chordsTextToString(
                                MusicTheory.transposeChordsText(chords_text, origin_key, current_key, true));
                            part.addData({
                                "name": part.data.name,
                                "text_chords": new_chords
                            }, edit_mode);
                        } catch (e) {
                        }
                    });
                    if (edit_mode) {
                        origin_key = current_key;
                        songData.key = MusicTheory.keyName(current_key);
                    }
                }
                for (let k of keys) {
                    keys_buttons_images[k].forEach(img => img.src = keyBackground)
                }
                if (current_key) {
                    keys_buttons_images[key_name].forEach(img => img.src = keyBackgroundOn);
                }
            };

            if (origin_key && MusicTheory.keyName(origin_key) === key_name)
                img.src = keyBackgroundOn;
        });
    });
    updateMainContentHeight();
}

let settings_button = document.querySelector('#settings_button');
if (!isMobile)
    settings_button.onclick = () => { showSettingsWindow(); }

function showSettingsWindow() {
    let overlay = document.querySelector('#overlay');
    let settings_window = document.querySelector('#settings_window');
    overlay.style.display = 'block';
    settings_window.style.display = 'block';

    let notation_form = document.querySelector('#notation_form');
    notation_form.notation.value = settings.notation;
    let English_notation_text = document.querySelector('#English_notation_text');
    let German_notation_text = document.querySelector('#German_notation_text');
    English_notation_text.addEventListener('click', () => { notation_form.notation.value = 'English'; });
    German_notation_text.addEventListener('click', () => { notation_form.notation.value = 'German'; });

    let exit_settings_window = document.querySelector('#exit_settings_window');
    exit_settings_window.onclick = () => {
        setSetting('notation', notation_form.notation.value);
        overlay.style.display = 'none';
        settings_window.style.display = 'none';
        window.location.reload();
    }
}

privateCheckbox.addEventListener('click', () => {
    updatePrivateSettingsLine();
});

function updatePrivateSettingsLine() {
    if (privateCheckbox.checked) {
        usersListContainer.style.display = 'block';
        if (songData && songData.users_read) {
            usersReadInput.value = songData.users_read.toString();
        } else {
            usersReadInput.value = [];
        }
        if (songData && songData.users_write) {
            usersWriteInput.value = songData.users_write.toString();
        } else {
            if (User.currentUser)
                usersWriteInput.value = User.currentUser.login;
        }
    } else {
        User.checkAdmin(authorized => {
            if (authorized) {
                usersListContainer.style.display = 'none';
            } else {
                privateCheckbox.checked = true;
            }
        })
    }
}

function checkEditPermission() {
    if (urlParams.get('edit')) {
        if (songData.private) {
            if (User.currentUser && songData.users_write && songData.users_write.includes(User.currentUser.login)) {
                switchToEditMode();
            } else {
                alert('Нет доступа к редактированию');
                let urlNoEdit = new URL(document.location.href);
                urlNoEdit.searchParams.delete('edit')
                document.location.href = urlNoEdit.toString();
            }
        } else {
            User.checkAdmin(authorized => {
                if (authorized) {
                    switchToEditMode();
                } else {
                    let urlNoEdit = new URL(document.location.href);
                    urlNoEdit.searchParams.delete('edit')
                    document.location.href = urlNoEdit.toString();
                }
            });
        }
    }
}

let loadSongDataPromise = fetch(SONGS_DATA_PATH + 'song/' + songId + '.json')
Promise.all([loadSongDataPromise, userCookiePromise])
    .then(response => {
        if (response[0].ok) return response[0].json()
        else if (urlParams.has('edit')) {
            let newSongData = {
                "name": "Новая песня",
                "text": [],
                "chords": [],
                "text_chords": []
            }
            if (!User.isAdmin) {
                newSongData.private = true;
                newSongData.users_read = [User.currentUser.login];
                newSongData.users_write = [User.currentUser.login];
            }
            return Promise.resolve(newSongData)
        } else return Promise.resolve({
            "name": "Песня не найдена 😕",
            "text": [],
            "chords": [],
            "text_chords": []
        })
    })
    .then(response => {
        if (!response.private ||
            (response.users_read && User.currentUser && response.users_read.includes(User.currentUser.login)) ||
            (response.users_write && User.currentUser && response.users_write.includes(User.currentUser.login))
        ) {
            loadSong(response)
        } else {
            loadSong({
                "name": "Песня не найдена 😕",
                "text": [],
                "chords": [],
                "text_chords": []
            });
        }
    });

window.addEventListener('resize', () => {
    updateElementMaxHeightToPageBottom(mainScroll, mainScrollMarginToBottom);
});
