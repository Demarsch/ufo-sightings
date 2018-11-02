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
    //Fix for iOS browsers - input with 'datetime-local' has to have a value
    //https://stackoverflow.com/questions/43747521/mobile-safari-10-3-1-datetime-local-enter-a-valid-value-error
    // get the iso time string formatted for usage in an input['type="datetime-local"']
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
    var localISOTimeWithoutSeconds = localISOTime.slice(0,16);
    // select the "datetime-local" input to set the default value on
    var dateInput = document.querySelector('input[type="datetime-local"]');
    // set it and forget it ;)
    dateInput.value = localISOTimeWithoutSeconds.slice(0,16);
});