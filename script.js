function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

}

document.addEventListener('DOMContentLoaded', function() {
    const scrollArrow = document.querySelector('.scroll-down-arrow');
    
    setTimeout(function() {
        scrollArrow.classList.add('visible');
    }, 4000); 
});

