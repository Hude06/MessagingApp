const sendButton = document.getElementById("send");
const messageList = document.getElementById("messages");
let username = null
console.log(localStorage.getItem("username"))
if (localStorage.getItem("username") === null) {
    localStorage.setItem("username", prompt("Enter your username:") || "Undefined");
} else {
    username = localStorage.getItem("username");
}
const { createClient } = supabase;
const supabase2 = createClient('https://dvlfunioxoupyyaxipnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bGZ1bmlveG91cHl5YXhpcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODE2MzIsImV4cCI6MjA0Mjk1NzYzMn0.Tyqzm6kKzVZqnBDYN69Pb3fcwkSRcA4zUb6QSO0I6gY'); // Replace with your actual anon key
let messages = []
class Message {
    constructor(message, username,id) {
        this.message = message;
        this.username = username;
        this.id = id;
        this.timestamp = new Date();
    }

    append() {
        let messageElement = document.createElement("li");
        messageElement.innerHTML = `[${this.timestamp.toLocaleTimeString()}] <strong>${this.username}:</strong> ${this.message}`;
        messageList.appendChild(messageElement);
    }
}

// Function to fetch messages from Supabase
async function fetchMessages() {
    const { data, error } = await supabase2
        .from('main') // Replace with your table name
        .select('MSG') // Replace with your column names

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }
    data.forEach(msg => {
        let data = msg.MSG
        console.log(data.id)
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].id === data.id) return;
        }
        let msgOBJ = new Message(data.MSG, data.User,data.id);
        messages.push(msgOBJ);
        msgOBJ.append();
    });
}

// Handle message submission
document.getElementById('messageForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    let userInput = document.getElementById("messageInput").value;
    if (!userInput) return; // Ignore empty messages

    // Create a message object
    let message = {
        id: Math.floor(Math.random() * 10000),
        MSG: userInput,
        User: username
    };

    // Convert message to JSON string
    const jsonMessage = (message);

    // Insert message into Supabase
    const { error } = await supabase2
        .from('main') // Replace with your table name
        .insert({ MSG: jsonMessage });

    if (error) {
        console.error('Error sending message:', error);
    }

    document.getElementById("messageInput").value = ''; // Clear input field
});



// Sidebar toggle functionality
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Initialize periodic fetch of messages
function loop() {
    fetchMessages(); // Initial fetch
    setInterval(fetchMessages, 5000); // Fetch every 5 seconds
}

function init() {
    loop();
}
init();
