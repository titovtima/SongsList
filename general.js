const SONGS_DATA_PATH = '/songs_data/';

function findCookies() {
    let cookies = {};
    document.cookie.split('; ').forEach(value => {
        let pair = value.split('=');
        cookies[pair[0]] = pair[1];
    });
    return cookies;
}

function updateElementMaxHeightToPageBottom(elem) {
    let offsetTop = elem.getBoundingClientRect().top;
    elem.style.maxHeight = window.innerHeight - offsetTop + 'px';
}
