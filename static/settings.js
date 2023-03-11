let settings = {};

function setStartSettings() {
    // document.cookie = 'settings=a; max-age=-1';
    let cookie = findCookies().settings;
    if (cookie) {
        try {
            settings = JSON.parse(cookie);
        } catch (e) {
            console.log('Error when parsing settings from cookie', e);
            // alert('Ошибка при чтении сохранённых настроек.\nНастройки сброшены');
        }
    }
    if (!settings.notation)
        settings.notation = 'English';
}
setStartSettings();

function setSetting(name, value) {
    settings[name] = value;
    document.cookie = `settings=${JSON.stringify(settings)}; path=/`;
}

let settingsButton = document.querySelector('#settings_button');
if (settingsButton) {
    if (isMobile) {
        settingsButton.onclick = () => {
            window.location.href = '/settings';
        }
    }
}