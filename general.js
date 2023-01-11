const SONGS_DATA_PATH = '/songs_data/';

function findCookies() {
    let cookies = {};
    document.cookie.split('; ').forEach(value => {
        let pair = value.split('=');
        cookies[pair[0]] = pair[1];
    });
    return cookies;
}

function updateElementMaxHeightToPageBottom(elem, marginBottom = 0) {
    let offsetTop = elem.getBoundingClientRect().top;
    elem.style.maxHeight = window.innerHeight - offsetTop - marginBottom + 'px';
}

let isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    isMobile = true;

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
