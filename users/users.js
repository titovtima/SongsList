// document.cookie = "admin_password=qq; max-age=-1; path=/; samesite=lax";

class User {
    static currentUser = null;
    static isAdmin = false;

    static async setUserFromCookie() {
        let userCookie = findCookies().user;
        let userData;
        try {
            userData = JSON.parse(userCookie);
        } catch (e) {
            userData = null;
        }
        if (userData) {
            await this.checkUserPassword(userData.password, userData.login, false)
                .then(result => {
                    if (result) {
                        userButton.style.backgroundImage = 'url("/assets/user_green.png")';
                    } else {
                        this.currentUser = null;
                    }
                });
        } else {
            this.currentUser = null;
        }
    }

    static async logIn() {
        let loginInput = document.querySelector('#input_user_login');
        let passwordInput = document.querySelector('#input_user_password');
        let login = loginInput.value;
        let password = passwordInput.value;
        let encodedPassword = encoder.encode(password);
        if (await User.checkUserPassword(encodedPassword, login, true)) {
            this.currentUser = new User({ 'login': login, 'password': encodedPassword });
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
        let login = loginInput.value;
        if (login.includes(' ') || login.includes(',')) {
            alert('Логин не должен содержать пробелов и запятых');
            return false;
        }
        let password = passwordInput.value;
        let repeatPassword = repeatPasswordInput.value;
        if (password !== repeatPassword) {
            alert('Пароли не совпадают');
            passwordInput.value = '';
            repeatPasswordInput.value = '';
            return false;
        }
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
                'password': encodedPassword
            };
            this.currentUser = userData;
            setUserCookie();
            return this.currentUser;
        } else {
            alert('Пользователь с таким логином уже существует');
            return false;
        }
    }

    static async checkUserPassword(password, login, updateCookie = false) {
        let p = fetch('/auth/login', {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "password": password,
                "user": login
            })
        });
        let response = await p;
        if (response.ok) {
            let userData = await response.json();
            this.currentUser = userData;
            // if (updateCookie) {
                setUserCookie();
            // }
            return true;
        }
        return false;
    }

    static setAdmin() {
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

    static checkAdmin(callback) {
        if (this.isAdmin) {
            callback(true);
        } else {
            showAdminConfirm(callback);
        }
    }

    static checkAdminPassword(password, updateCookie = false) {
        if (password) {
            // let lowerCasePassword = password.toLowerCase();
            // let encodedLowerCasePassword = encoder.encode(lowerCasePassword);
            let encodedPassword = encoder.encode(password);
            if (encodedPassword === '1928688550251757923611570335768420769329436090073839948156602456076851963565') {
                if (updateCookie)
                    document.cookie = `admin_password=${password}; max-age=2500000; path=/; samesite=lax`;
                let jsonString = '{"correct_admin_password_entered": true}';
                ym(88797016, 'params', JSON.parse(jsonString));
                this.isAdmin = true;
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

if (isMobile) {
    userButton.onclick = () => {
        window.location.href = '/user';
    }
} else {
    userButton.onclick = () => {
        setUserWindowView();
    }
}

function setUserWindowView() {
    if (userWindow) {
        overlay.style.display = 'block';
        userWindow.style.display = 'block';
        setTimeout(() => {
            document.addEventListener('click', handlerCloseUserWindowClick);
        }, 100);
    }
    userSection.style.display = 'none';
    logInSection.style.display = 'none';
    registrationSection.style.display = 'none';
    if (User.currentUser) {
        let showUserLogin = document.querySelector('#show_user_login');
        showUserLogin.innerHTML = User.currentUser.login;
        userSection.style.display = 'block';
        let logoutButton = document.querySelector('#logout_button');
        logoutButton.onclick = () => {
            User.currentUser = null;
            visitHistory.songs_list = null;
            setVisitHistoryCookie();
            document.cookie = 'user=null; max-age=-1; path=/; samesite=lax';
            userButton.style.backgroundImage = 'url("/assets/user.png")';
            userSection.style.display = 'none';
            showLogInWindow();
        }
    } else {
        userSection.style.display = 'none';
        showLogInWindow();
    }
}

let handlerCloseUserWindowClick = event => {
    let t = event.target;
    if (t !== userWindow && !userWindow.contains(t))
        exitUserWindow();
}

function exitUserWindow() {
    if (userWindow) {
        userWindow.style.display = 'none';
        overlay.style.display = 'none';
        userSection.style.display = 'none';
        logInSection.style.display = 'none';
        registrationSection.style.display = 'none';
        document.removeEventListener('click', handlerCloseUserWindowClick);
    }

    if (User.currentUser) {
        userButton.style.backgroundImage = 'url("/assets/user_green.png")';
    } else {
        userButton.style.backgroundImage = 'url("/assets/user.png")';
    }

    if (userWindow) {
        window.location.reload();
    } else {
        setUserWindowView();
    }
}

function showLogInWindow() {
    if (userWindow) {
        overlay.style.display = 'block';
        userWindow.style.display = 'block';
    }

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
    let logInButton = document.querySelector('#log_in_button');
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
    logInButton.onclick = () => {
        showLogInWindow();
    }
}

let handlerClosePasswordWindowClick = event => {
    let t = event.target;
    if (t !== passwordWindow && !passwordWindow.contains(t))
        exitPasswordWindow();
}

let passwordWindow = document.querySelector('#password_window');
function showAdminConfirm(callback) {
    let passwordWindow = document.querySelector('#password_window');
    let passwordInput = document.querySelector('#password_input');
    let sendPassword = document.querySelector('#send_password');
    if (!passwordWindow) {
        callback(false);
        return;
    }
    overlay.style.display = 'block';
    passwordWindow.style.display = 'block';
    sendPassword.onsubmit = event => {
        if (event)
            event.preventDefault();

        if (User.checkAdminPassword(passwordInput.value, true)) {
            exitPasswordWindow();
            callback(true);
            return true;
        } else {
            passwordInput.value = '';
            alert('Введён неверный пароль');
        }
    }

    handlerClosePasswordWindowClick = event => {
        let t = event.target;
        if (t !== passwordWindow && !passwordWindow.contains(t)) {
            let passwordValue = passwordInput.value;
            exitPasswordWindow();
            if (User.checkAdminPassword(passwordValue, true)) {
                callback(true);
            } else {
                alert('Введён неверный пароль');
                callback(false);
            }
        }
    }

    setTimeout(() => {
        document.addEventListener('click', handlerClosePasswordWindowClick);
    }, 10);
}

function exitPasswordWindow() {
    document.removeEventListener('click', handlerClosePasswordWindowClick);
    overlay.style.display = 'none';
    passwordWindow.style.display = 'none';
}

function setUserCookie() {
    document.cookie = `user=${JSON.stringify(User.currentUser)}; path=/; samesite=lax`;
}

let userCookiePromise = User.setUserFromCookie()
    .then(() => User.setAdmin() );
