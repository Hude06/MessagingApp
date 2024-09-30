const sendButton = document.getElementById("send");
const messageList = document.getElementById("messages") || null;
let username = null
let usernameProfile = document.getElementById("username") || null
let reset = document.getElementById("reset") || null
function customPrompt(message) {
    return new Promise((resolve, reject) => {
        // Create prompt container
        const promptContainer = document.createElement('div');
        promptContainer.style.position = 'fixed';
        promptContainer.style.top = '0';
        promptContainer.style.left = '0';
        promptContainer.style.right = '0';
        promptContainer.style.bottom = '0';
        promptContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        promptContainer.style.display = 'flex';
        promptContainer.style.justifyContent = 'center';
        promptContainer.style.alignItems = 'center';
        promptContainer.style.zIndex = '9999';

        // Create prompt box
        const promptBox = document.createElement('div');
        promptBox.style.backgroundColor = 'white';
        promptBox.style.padding = '20px';
        promptBox.style.borderRadius = '5px';
        promptBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        promptBox.style.textAlign = 'center';

        // Create message paragraph
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        promptBox.appendChild(messageParagraph);

        // Create input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        promptBox.appendChild(inputField);

        // Create OK button
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.onclick = () => {
            const userInput = inputField.value;
            document.body.removeChild(promptContainer);
            resolve(userInput); // Resolve the promise with user input
        };
        promptBox.appendChild(okButton);


        // Append prompt box to container
        promptContainer.appendChild(promptBox);

        // Append container to body
        document.body.appendChild(promptContainer);
    });
}
if (localStorage.getItem("username2") !== null) {
    username = localStorage.getItem("username2")
    if (usernameProfile !== null) {
        usernameProfile.innerHTML = username
    }
} else {
    console.log("no username")
    username = await customPrompt("Enter your username")
    localStorage.setItem("username2", username)
    if (usernameProfile) {
        usernameProfile.innerHTML = username
    }
    console.log(username)
}
if (reset) {
    reset.addEventListener("click", () => {
        localStorage.clear()
        setTimeout(() => {
            location.reload()
        },200)
    })
}
const { createClient } = supabase;
const supabase2 = createClient('https://dvlfunioxoupyyaxipnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bGZ1bmlveG91cHl5YXhpcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODE2MzIsImV4cCI6MjA0Mjk1NzYzMn0.Tyqzm6kKzVZqnBDYN69Pb3fcwkSRcA4zUb6QSO0I6gY'); // Replace with your actual anon key
let messages = []
class Message {
    constructor(message, username,id,time) {
        this.message = message;
        this.username = username;
        this.id = id;
        this.timestamp = time;
    }

    append() {
        let messageElement = document.createElement("li");
        messageElement.innerHTML = `[${this.timestamp}] <strong>${this.username}:</strong> ${this.message}`;
        if (messageList) {
            messageList.appendChild(messageElement);
        }
    }
}

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
        let msgOBJ = new Message(data.MSG, data.User,data.id, data.time);
        messages.push(msgOBJ);
        msgOBJ.append();
    });
}

// Handle message submission
let messageForm = document.getElementById("messageForm") || null
if (messageForm) {
    messageForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        let userInput = document.getElementById("messageInput").value;
        if (!userInput) return; // Ignore empty messages
    
        // Create a message object
        let message = {
            id: Math.floor(Math.random() * 10000),
            MSG: userInput,
            User: username,
            time: new Date().toLocaleTimeString()
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
}

// Sidebar toggle functionality
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", () => {
    console.log("clicked")
    sidebar.classList.toggle("open");
    return
});

// Initialize periodic fetch of messages
function loop() {
    fetchMessages(); // Initial fetch
    setInterval(fetchMessages, 10000); // Fetch every 5 seconds
}

function init() {
    loop();
}
init();
