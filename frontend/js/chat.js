const socket = io();
const username = localStorage.getItem('username');

if (!username) {
    alert('Please log in first');
    window.location.href = 'login.html';
}

$('#joinRoom').click(() => {
    const room = $('#roomSelect').val();
    socket.emit('joinRoom', room);
    $('#roomTitle').text('Room: ' + room);
    $('#chatArea').show();
});

$('#sendMessage').click(() => {
    const message = $('#messageInput').val();
    const room = $('#roomSelect').val();
    socket.emit('sendMessage', { room, message, user: username });
    $('#messageInput').val('');
});

socket.on('receiveMessage', (data) => {
    $('#messages').append(`<p><strong>${data.user}:</strong> ${data.message}</p>`);
});

$('#logout').click(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});
