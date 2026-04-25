const $loader = document.getElementById('loader');
const $loaderTooLongMsg = $loader.querySelector('.too-long-msg');
const $loaderTooLongMsgBtn = $loaderTooLongMsg.querySelector('.btn');

// Hide the loader after all is loaded.
window.addEventListener('load', () => {
    setTimeout(() => {
        $loader.classList.add('hidden');
    }, 200);
});

// Show a message if the app takes too long to load.
setTimeout(() => {
    $loaderTooLongMsg.classList.add('show');
}, 4000);

// Click on the reload button.
$loaderTooLongMsgBtn.addEventListener('trigger', () => {
    window.location.reload();
});
