window.addEventListener('load', () => {
    window.setTimeout(() => {
        let flash = document.querySelector('#flash');
        flash.classList.add('active');
        window.setTimeout(() => {
            window.location.replace("index.html");
        }, 400);
    }, 1500);
});