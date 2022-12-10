class User {
    static currentUser = null;
    static isAdmin = false;

    static getUserFromCookie() {
        let userCookie = findCookies().user;
        let userData;
        try {
            userData = JSON.parse(userCookie);
        } catch (e) {
            userData = null;
        }
        if (userData)
            this.currentUser = new User(userData);
        return this.currentUser;
    }

    static async logIn() {
        let loginInput = document.querySelector('#input_user_login');
        let passwordInput = document.querySelector('#input_user_password');
        let login = loginInput.value;
        let password = passwordInput.value;
        if (await User.checkUserPassword(password, login, true)) {
            this.currentUser = new User({ 'login': login, 'password': password });
            return this.currentUser;
        } else {
            alert('Неверный логин или пароль');
            passwordInput.value = '';
            return false;
        }
    }

    static async register() {
        let loginInput = document.querySelector('#input_new_user_login');
        let passwordInput = document.querySelector('#input_new_user_password');
        let repeatPasswordInput = document.querySelector('#input_new_user_repeat_password');
        let password = passwordInput.value;
        let repeatPassword = repeatPasswordInput.value;
        if (password !== repeatPassword) {
            alert('Пароли не совпадают');
            passwordInput.value = '';
            repeatPasswordInput.value = '';
            return false;
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
            this.currentUser = userData;
            document.cookie = `user=${JSON.stringify(userData)}; max-age=2500000; path=/; samesite=lax`;
            return this.currentUser;
        } else {
            alert('Пользователь с таким логином уже существует');
            loginInput.value = '';
            passwordInput.value = '';
            repeatPasswordInput.value = '';
            return false;
        }
    }

    static async checkUserPassword(password, login, updateCookie = false) {
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
            this.currentUser = userData;
            return true;
        }
        return false;
    }

    static checkAdmin() {
        if ((this.currentUser && this.currentUser.admin) || this.isAdmin) {
            this.isAdmin = true;
            return true;
        }
        let password = findCookies().admin_password;
        if (this.checkAdminPassword(password)) {
            this.isAdmin = true;
            return true;
        }
    }

    static checkAdminPassword(password, updateCookie = false) {
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

    constructor(user) {
        if (!user)
            return null;
        for (let key in user)
            this[key] = user[key];
    }
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

userButton.onclick = () => {
    overlay.style.display = 'block';
    userWindow.style.display = 'block';
    if (User.currentUser) {
        let showUserLogin = document.querySelector('#show_user_login');
        showUserLogin.innerHTML = User.currentUser.login;
        userSection.style.display = 'block';
        let logoutButton = document.querySelector('#logout_button');
        logoutButton.onclick = () => {
            User.currentUser = null;
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

    if (User.currentUser) {
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

    // let submitLogin = document.querySelector('#submit_user_login');
    // submitLogin.onclick = () => {
    let logInForm = document.querySelector('#log_in_form');
    logInForm.onsubmit = event => {
        if (event)
            event.preventDefault();

        User.logIn().then(result => {
            if (result)
                exitUserWindow();
        });
    }

    let registrationButton = document.querySelector('#registration_button');
    registrationButton.onclick = () => {
        logInSection.style.display = 'none';
        registrationSection.style.display = 'block';

        // let submitRegistration = document.querySelector('#submit_user_registration');
        // submitRegistration.onclick = () => {
        let registrationForm = document.querySelector('#registration_form');
        registrationForm.onsubmit = event => {
            if (event)
                event.preventDefault();
            User.register().then(result => {
                if (result)
                    exitUserWindow();
            });
        };
    }
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

        if (User.checkAdminPassword(passwordInput.value)) {
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
    if (authorized || User.checkAdminPassword(passwordInput.value, true)) {
        overlay.style.display = 'none';
        passwordWindow.style.display = 'none';
        let jsonString = '{"correct_admin_password_entered": true}';
        ym(88797016, 'params', JSON.parse(jsonString));
        if (aim === 'edit')
            switchToEditMode();
        if (aim === 'send_song')
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

User.getUserFromCookie();
if (User.currentUser) {
    userButton.style.backgroundImage = 'url("/assets/user_green.png")';
}
