window.addEventListener('load', () => {
    let form = document.querySelector('form')
    form.addEventListener('submit', e => {           
        e.preventDefault();
        e.stopPropagation();     
        if (form.checkValidity() === false) {
            form.classList.add('was-validated');  
        } else {
            window.location.href = 'forget.html';
        }      
    });
});