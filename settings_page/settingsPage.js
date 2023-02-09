let notation_form = document.querySelector('#notation_form');
notation_form.notation.value = settings.notation;
let English_notation_text = document.querySelector('#English_notation_text');
let German_notation_text = document.querySelector('#German_notation_text');
English_notation_text.addEventListener('click', () => {
    notation_form.notation.value = 'English';
    setSetting('notation', notation_form.notation.value);
});
German_notation_text.addEventListener('click', () => {
    notation_form.notation.value = 'German';
    setSetting('notation', notation_form.notation.value);
});
notation_form.addEventListener('input', () => {
    setSetting('notation', notation_form.notation.value);
});
