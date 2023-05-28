const SONGS_DATA_PATH = '/songs_data/';

function findCookies() {
    let cookies = {};
    document.cookie.split('; ').forEach(value => {
        let pair = value.split('=');
        cookies[pair[0]] = pair[1];
    });
    return cookies;
}

function updateElementMaxHeightToPageBottom(elem, marginBottom = mainScrollMarginToBottom) {
    let offsetTop = elem.getBoundingClientRect().top;
    elem.style.maxHeight = window.innerHeight - offsetTop - marginBottom + 'px';
}

let isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    isMobile = true;

let background = document.querySelector('.background');
// setTimeout(() => { console.log(window.getComputedStyle(background)); }, 1);
let colorTheme = 'light';
console.log(window.getComputedStyle(background).content);
if (window.getComputedStyle(background).content === '"dark"')
    colorTheme = 'dark';

console.log(colorTheme);

function addCssFiles(linksList) {
    for (let link of linksList) {
        let linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.type = 'text/css';
        linkElement.href = link;
        let head = document.querySelector('head');
        head.append(linkElement);
    }
}

let visitHistory = {
    songs_list: null
};

function setVisitHistoryCookie() {
    document.cookie = 'visitHistory=' + JSON.stringify(visitHistory) + '; path=/';
}

function getVisitHistoryFromCookie() {
    let cookie = findCookies().visitHistory;
    console.log(cookie);
    try {
        visitHistory = JSON.parse(cookie);
    } catch (e) {
    }
    console.log(visitHistory);
}
getVisitHistoryFromCookie();

let songsListsButton = document.querySelector('#songs_lists_button');
if (songsListsButton) {
    if (visitHistory.songs_list && !window.location.href.includes('/songs_list')) {
        songsListsButton.onclick = () => {
            window.location.href = '/songs_list/' + visitHistory.songs_list;
        };
    } else {
        songsListsButton.onclick = () => {
            window.location.href = '/songs_lists_list';
        };
    }
}

document.querySelectorAll('.input_password').forEach(function (value) {
    value.inputmode = 'text';
});

let mainScrollMarginToBottom = 20;
if (isMobile) {
    let sidebar = document.querySelector('#sidebar');
    let sidebarPosition = sidebar.getBoundingClientRect();
    let windowHeight = window.innerHeight;
    let sidebarHeight = 170 + sidebarPosition.bottom - windowHeight;
    sidebar.style.height = sidebarHeight + 'px';

    mainScrollMarginToBottom = sidebarHeight + 20;
    let overSidebar = document.querySelector('#over_sidebar');
    // updateElementMaxHeightToPageBottom(overSidebar, mainScrollMarginToBottom);
}
