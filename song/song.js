const songs_data_path = '/songs_data/';

const urlParams = new URLSearchParams(window.location.search);
const songNumber = urlParams.get('id');

let headerStartFontSize, headerMinFontSize;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    let mobile_css_link = document.createElement("link");
    mobile_css_link.rel = "stylesheet";
    mobile_css_link.type = "text/css";
    mobile_css_link.href = "song-mobile.css";
    let head = document.querySelector('head');
    head.append(mobile_css_link);
    headerMinFontSize = 40;
    headerStartFontSize = 75;
}

let admin = false;
let user;
getUserFromCookie();
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
            let chords = MusicTheory.chordsTextFromPlainText(part.chords);
            MusicTheory.changeChordsTextNotation(chords, settings.notation);
            part.chords = MusicTheory.chordsTextToString(chords);
            console.log(part.chords);
            new SongPart('chords', part);
        }

    if (data.text_chords)
        for (let part of data.text_chords) {
            let chords_text = MusicTheory.chordsTextFromPlainText(part.text_chords);
            MusicTheory.changeChordsTextNotation(chords_text, settings.notation, true);
            part.text_chords = MusicTheory.chordsTextToString(chords_text);
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

class RSAEncoder {
    constructor(n, e) {
        this.n = n;
        this.e = e;
    }

    quickPow(a, p, mod) {
        if (p === 0n) return 1n;
        if (p === 1n) return a % mod;

        let a2 = this.quickPow(a % mod, p / 2n, mod);
        if (p % 2n === 0n) {
            return a2 * a2 % mod;
        } else {
            return (a2 * a2 % mod) * a % mod;
        }
    }

    encode(string) {
        let num = 0n;
        string.split('').forEach((value, index) => {
            num += BigInt(value.charCodeAt(0) + index * 256);
            num %= this.n;
        });

        return this.quickPow(num, this.e, this.n).toString();
    }
}

let encoder = new RSAEncoder(
    2472942968189431706898462913067925658209124041544162680908145890301107704237n,
    5281668766765633818307894358032591567n);

let userButton = document.querySelector('#user_button');
let overlay = document.querySelector('#overlay');
let userWindow = document.querySelector('#user_window');
let userSection = document.querySelector('#user_section');
let logInSection = document.querySelector('#log_in_section');
let registrationSection = document.querySelector('#registration_section');

function getUserFromCookie() {
    let userCookie = findCookies().user;
    try {
        user = JSON.parse(userCookie);
    } catch (e) {
        user = null;
    }
    if (user) {
        let userButton = document.querySelector('#user_button');
        userButton.style.backgroundImage = 'url("/assets/user_green.png")';
    }
}

userButton.onclick = () => {
    overlay.style.display = 'block';
    userWindow.style.display = 'block';
    if (user) {
        let showUserLogin = document.querySelector('#show_user_login');
        showUserLogin.innerHTML = user.login;
        userSection.style.display = 'block';
        let logoutButton = document.querySelector('#logout_button');
        logoutButton.onclick = () => {
            user = null;
            document.cookie = 'user=null; max-age=-1; path=/; samesite=lax';
            userButton.style.backgroundImage = 'url("/assets/user.png")';
            userSection.style.display = 'none';
            showLogInWindow();
        }
    } else {
        userSection.style.display = 'none';
        showLogInWindow();
    }

    setTimeout(() => { document.addEventListener('click', handlerCloseUserWindowClick); }, 100);
}

let handlerCloseUserWindowClick = event => {
    let t = event.target;
    if (t !== userWindow && !userWindow.contains(t))
        exitUserWindow();
}

function exitUserWindow() {
    userWindow.style.display = 'none';
    overlay.style.display = 'none';
    userSection.style.display = 'none';
    logInSection.style.display = 'none';
    registrationSection.style.display = 'none';

    if (user) {
        userButton.style.backgroundImage = 'url("/assets/user_green.png")';
    } else {
        userButton.style.backgroundImage = 'url("/assets/user.png")';
    }

    document.removeEventListener('click', handlerCloseUserWindowClick);
}

function showLogInWindow() {
    overlay.style.display = 'block';
    userWindow.style.display = 'block';

    userSection.style.display = 'none';
    registrationSection.style.display = 'none';
    logInSection.style.display = 'block';

    let submitLogin = document.querySelector('#submit_user_login');
    submitLogin.onclick = () => {
        login();
    }

    async function login() {
        let loginInput = document.querySelector('#input_user_login');
        let passwordInput = document.querySelector('#input_user_password');
        let login = loginInput.value;
        let password = passwordInput.value;
        if (await checkUserPassword(password, login, true)) {
            exitUserWindow();
        } else {
            alert('Неверный логин или пароль');
            passwordInput.value = '';
        }
    }

    let registrationButton = document.querySelector('#registration_button');
    registrationButton.onclick = () => {
        console.log('registration button');
        logInSection.style.display = 'none';
        registrationSection.style.display = 'block';

        let submitRegistration = document.querySelector('#submit_user_registration');
        submitRegistration.onclick = () => {
            register();
        }
    }

    async function register() {
        let loginInput = document.querySelector('#input_new_user_login');
        let passwordInput = document.querySelector('#input_new_user_password');
        let repeatPasswordInput = document.querySelector('#input_new_user_repeat_password');
        let password = passwordInput.value;
        let repeatPassword = repeatPasswordInput.value;
        if (password !== repeatPassword) {
            alert('Пароли не совпадают');
            passwordInput.value = '';
            repeatPasswordInput.value = '';
            return;
        }
        let login = loginInput.value;
        let encodedPassword = encoder.encode(password);
        let p = fetch('/auth/reg', {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "password": encodedPassword,
                "user": login
            })
        });
        let response = await p;
        if (response.ok) {
            let userData = {
                'login': login,
                'password': password
            };
            user = userData;
            document.cookie = `user=${JSON.stringify(userData)}; max-age=2500000; path=/; samesite=lax`;
            exitUserWindow();
        } else {
            alert('Пользователь с таким логином уже существует');
            loginInput.value = '';
            passwordInput.value = '';
            repeatPasswordInput.value = '';
        }
    }
}

async function checkUserPassword(password, login, updateCookie = false) {
    let encodedPassword = encoder.encode(password);
    // console.log(encodedPassword);
    let p = fetch('/auth/login', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            "password": encodedPassword,
            "user": login
        })
    });
    let response = await p;
    if (response.ok) {
        let userData = await response.json();
        userData.login = login;
        if (updateCookie) {
            document.cookie = `user=${JSON.stringify(userData)}; max-age=2500000; path=/; samesite=lax`;
        }
        user = userData;
        return true;
    }
    return false;
}

function checkAdmin() {
    if ((user && user.admin) || admin) {
        admin = true;
        return true;
    }
    let password = findCookies().admin_password;
    if (checkAdminPassword(password)) {
        admin = true;
        return true;
    }
}

function checkAdminPassword(password, updateCookie = false) {
    if (password) {
        let lowerCasePassword = password.toLowerCase();
        let encodedLowerCasePassword = encoder.encode(lowerCasePassword);
        if (encodedLowerCasePassword === '256936898532198594958756561132414261138151402058674183683957539453558674134') {
            if (updateCookie)
                document.cookie = `admin_password=${password}; max-age=2500000; path=/; samesite=lax`;
            return true;
        }
    }
    return false;
}

let handlerClosePasswordWindowClick = event => {
    let t = event.target;
    if (t !== passwordWindow && !passwordWindow.contains(t))
        exitPasswordWindow();
}

let passwordWindow = document.querySelector('#password_window');
function showAdminConfirm(aim, data = null) {
    let overlay = document.querySelector('#overlay');
    let passwordWindow = document.querySelector('#password_window');
    let passwordInput = document.querySelector('#password_input');
    let sendPassword = document.querySelector('#send_password');
    overlay.style.display = 'block';
    passwordWindow.style.display = 'block';
    passwordWindow.aim = aim;
    sendPassword.onsubmit = event => {
        if (event)
            event.preventDefault();

        if (checkAdminPassword(passwordInput.value)) {
            exitPasswordWindow(aim, true, data);
            return true;
        } else {
            passwordInput.value = '';
            alert('Введён неверный пароль');
        }
    }

    document.addEventListener('click', handlerClosePasswordWindowClick);
}

function exitPasswordWindow(aim, authorized = false, data = null) {
    if (!passwordWindow) return;
    document.removeEventListener('click', handlerClosePasswordWindowClick);
    let passwordInput = document.querySelector('#password_input');
    if (authorized || checkAdminPassword(passwordInput.value, true)) {
        overlay.style.display = 'none';
        passwordWindow.style.display = 'none';
        let jsonString = '{"correct_admin_password_entered": true}';
        ym(88797016, 'params', JSON.parse(jsonString));
        if (aim === 'edit')
            switchToEditMode();
        if (aim === 'send')
            sendSongToServer(data);
    } else {
        overlay.style.display = 'none';
        passwordWindow.style.display = 'none';
        alert('Введён неверный пароль');
        if (passwordWindow.aim === 'edit') {
            let urlNoEdit = new URL(document.location.href);
            urlNoEdit.searchParams.delete('edit')
            document.location.href = urlNoEdit.toString();
        }
    }
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
    ym(88797016,'reachGoal','edit_song');
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

        let forms = document.querySelectorAll('form:not(#send_song):not(#send_password):not(#notation_form)')
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
            console.log(part);
            let chords = MusicTheory.chordsTextFromPlainText(part.data.chords, settings.notation);
            MusicTheory.changeChordsTextNotation(chords, 'English');
            part.data.chords = MusicTheory.chordsTextToString(chords);
            song_data.chords.push(part.data);
        }
        for (let part of song_parts.text_chords_parts) {
            let text_chords = MusicTheory.chordsTextFromPlainText(part.data.text_chords, settings.notation);
            MusicTheory.changeChordsTextNotation(text_chords, 'English', true);
            part.data.text_chords = MusicTheory.chordsTextToString(text_chords);
            song_data.text_chords.push(part.data);
        }
        if (current_key !== null)
            song_data.key = MusicTheory.keyName(current_key);

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

    let origin_key = null;
    if (song_data.key)  {
        origin_key = MusicTheory.keyFromName(song_data.key);
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
            img.src = '/assets/key_background.png';
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
                    img.src = '/assets/key_background_on.png';
                } else if (MusicTheory.keyName(origin_key) === key_name && edit_mode) {
                    origin_key = null;
                    current_key = null;
                    img.src = '/assets/key_background.png';
                } else {
                    song_parts.chords_parts.forEach(part => {
                        let chords_text = MusicTheory.chordsTextFromPlainText(part.data.chords, settings.notation);
                        console.log(chords_text);
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
                    for (let k of keys) {
                        keys_buttons_images[k].forEach(img => img.src = '/assets/key_background.png')
                    }
                    keys_buttons_images[key_name].forEach(img => img.src = '/assets/key_background_on.png');
                    if (edit_mode)
                        origin_key = current_key;
                }
            };

            console.log('origin_key: ', origin_key);
            if (origin_key && MusicTheory.keyName(origin_key) === key_name)
                img.src = '/assets/key_background_on.png';
        });
    });
    updateMainContentHeight();
    // updateChordsInnerButtons();
    // updateTextChordsInnerButtons();
}

let settings_button = document.querySelector('#settings_button');
settings_button.onclick = () => {
    showSettingsWindow();
}

let settings = {};
function setStartSettings() {
    // document.cookie = 'settings=a; max-age=-1';
    let cookie = findCookies().settings;
    if (cookie) {
        cookie.split('|').forEach(value => {
            let setting = value.split('_');
            settings[setting[0]] = setting[1];
        });
    }
    if (!settings.notation)
        settings.notation = 'English';
}
setStartSettings();

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
        changeNotationSystem(notation_form.notation.value);

        let settings_cookie_arr = [];
        for (let setting in settings)
            settings_cookie_arr.push(`${setting}_${settings[setting]}`);
        document.cookie = `settings=${settings_cookie_arr.join('|')}`;
        overlay.style.display = 'none';
        settings_window.style.display = 'none';
        window.location.reload();
    }
}

function changeNotationSystem(newNotation) {
    if (newNotation === settings.notation) return;
    settings.notation = newNotation;
}

checkAdmin();
if (urlParams.get('edit')) {
    if (!admin) {
        showAdminConfirm('edit');
    }
    switchToEditMode();
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

// window.addEventListener('resize', () => {
    // updateChordsInnerButtons();
    // updateTextInnerButtons();
// })
