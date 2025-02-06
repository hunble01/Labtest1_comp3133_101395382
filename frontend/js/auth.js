$(document).ready(function () {
    if (localStorage.getItem('token')) {
        window.location.href = 'chat.html';
    }
});
