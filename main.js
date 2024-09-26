// script.js
const sendButton = document.getElementById("send");
const messageList = document.getElementById("messages");
const socket = io('http://127.0.0.1:5500'); // Initialize Socket.IO
const username = prompt("Enter your username:"); // Prompt user for username

class Message {
    constructor(message, username) {
        this.message = message;
        this.username = username;
        this.timestamp = new Date();
    }
    append() {
        let messageElement = document.createElement("li");
        messageElement.innerHTML = `[${this.timestamp.toLocaleTimeString()}] <strong>${this.username}:</strong> ${this.message}`; // Include username
        messageList.appendChild(messageElement);
    }
}

// Handle message submission
document.getElementById('messageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let userInput = document.getElementById("messageInput").value;
    if (!userInput) return; // Ignore empty messages

    let message = new Message(userInput, username);
    message.append();
    socket.emit('chat message', { message: userInput, username }); // Emit message and username
    document.getElementById("messageInput").value = ''; // Clear input field
});

// Listen for incoming messages
socket.on('chat message', (data) => {
    let message = new Message(data.message, data.username);
    message.append();
});

// Sidebar toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");

    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
});

// Initialize any periodic tasks if needed
function loop() {
    setInterval(() => {
        // Periodic tasks can be added here
    }, 1000);
}

function init() {
    loop();
}
init();
