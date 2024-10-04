const { Preferences } = window.Capacitor.Plugins;
const { createClient } = supabase;
class Globls {
    constructor() {
        this.supabase2 = createClient('https://dvlfunioxoupyyaxipnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bGZ1bmlveG91cHl5YXhpcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODE2MzIsImV4cCI6MjA0Mjk1NzYzMn0.Tyqzm6kKzVZqnBDYN69Pb3fcwkSRcA4zUb6QSO0I6gY'); // Replace with your actual anon key
        this.messages = [];
        this.sidebar = document.getElementById("sidebar");
        this.user = null;
        this.LOGOUTDIV = document.getElementById("logout")

        this.SIGNUPBUT = document.getElementById("SIGNUP")

        this.USERNAMEDIV = document.getElementById("usernameIS")
        this.MYPUBLICKEY = 1

        this.MYPRIVATEKEY = 1

        this.CONTACTSDIV = document.getElementById("contacts")

        this.PUBKEYDIV = document.getElementById("UsersPubKey")

        this.CURRENTUSERID = generateRandomString(10)

        this.CLEARBUTTON = document.getElementById("Clear")

    }
}   
class Contact {
    constructor(n,pub) {
        this.name = n;
        this.publicKey = pub;
        this.option = document.createElement("option");
        this.option.innerHTML = n;
    }
}
function newContact(name, pubKey) {
    if (globals.CONTACTSDIV) {
        let contact = new Contact(name, pubKey);
        globals.CONTACTSDIV.append(contact.option)
        contact.option.addEventListener("click", function() {
            globals.PUBKEYDIV.innerHTML = contact.publicKey
        })
        return contact;
    }
}
async function encryptData(publicKey, message) {
    // Encode the message as a Uint8Array
    const encodedMessage = new TextEncoder().encode(message);
    
    // Encrypt the message using the public key
    const encryptedMessage = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP", // Use RSA-OAEP algorithm
        },
        publicKey, // Public key for encryption
        encodedMessage // Message to encrypt
    );

    return encryptedMessage; // This will be an ArrayBuffer
}
async function decryptData(privateKey, encryptedMessage) {
    // Decrypt the message using the private key
    const decryptedMessage = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP", // Use RSA-OAEP algorithm
        },
        privateKey, // Private key for decryption
        encryptedMessage // Encrypted message
    );

    // Decode the decrypted message back to a string
    return new TextDecoder().decode(decryptedMessage);
}
async function saveData(key, value) {
    try {
        await Preferences.set({
            key: key,
            value: value,
        });
        // console.log('Data saved:', key, value);
    } catch (error) {
        console.error('Error saving data:', error);
    }
}
async function generateKeyPair() {
    const { publicKey, privateKey } = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // Length of the key in bits
            publicExponent: new Uint8Array([1, 0, 1]), // Commonly used exponent
            hash: "SHA-256", // Hash function
        },
        true, // Whether the key is extractable
        ["encrypt", "decrypt"] // Usages
    );

    return { publicKey, privateKey };
}
async function exportKey(key, format,pub) {
    try {
        if (pub) {
                const exportedKey = await window.crypto.subtle.exportKey("spki", key);
                console.log("WORKED Pub")
                return exportedKey
        } else {
                const exportedKey = await window.crypto.subtle.exportKey("pkcs8", key);
                return exportedKey
        }
    } catch (error) {
        console.error("Key export failed:", error);
        throw new Error("Failed to export the key.");
    }
}
async function getData(key) {
    try {
        const { value } = await Preferences.get({ key: key });
        return value;
    } catch (error) {
        console.error('Error retrieving data:', error);
    }
}
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
function generateRandomString(length) {
    if (length < 1) return '';

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}
let globals = new Globls();
let session = await globals.supabase2.auth.getSession();
console.log(getData("username"),getData("password"),getData("publicKey"),getData("privateKey"))
if (globals.CLEARBUTTON) {
    globals.CLEARBUTTON.addEventListener("click", async function() {
        const { error } = await globals.supabase2.auth.signOut()
        await Preferences.remove({ key: 'password' });
        await Preferences.remove({ key: 'username' });
        await Preferences.remove({ key: 'publicKey' });
        await Preferences.remove({ key: 'privateKey' });
        await Preferences.remove({ key: 'userID' });
        console.log("Cleared")
        console.log(error)
    })
}
if (session.data.session !== null) {
    console.log("Sesion is ",session.data.session.user.email)
    globals.user = session.data.session.user.email
    if (globals.USERNAMEDIV) {
        globals.USERNAMEDIV.innerHTML = globals.user
    }
} else {
    let tempUser = await getData("username")
    let tempPass = await getData("password")
    if (tempUser && tempPass) {
        console.log("Logging in")
    }

}
if (globals.SIGNUPBUT) {
    globals.SIGNUPBUT.addEventListener("click", async function(e) {
        e.preventDefault()
        let TempEmail = await getData("username")
        let TempPass = await getData("password")
        let [email, password] = await Promise.all([TempEmail, TempPass]);
        if (email && password) {
            alert("Already signed in")
        } else {
            let emailDiv = document.getElementById("email").value
            let passwordDiv = document.getElementById("password").value
            console.log(emailDiv,passwordDiv)
            await saveData("username",emailDiv)
            await saveData("password",passwordDiv)
            await signUp(emailDiv,passwordDiv)
        }
    })
}
if (session.data.session !== null) {
    globals.user = session.data.session.user.email;
} else {
    if (getData("username") && getData("password")) {
        let TempEmail = await getData("username")
        let TempPass = await getData("password")
        let [email, password] = await Promise.all([TempEmail, TempPass]);
        console.log(email,password)
        if (email && password) {
            await login(email,password)
        } else {
            console.log("Never loged in")
        }
    }
    console.log("No user logged in")
}
async function login(email,password) {
    const { data, error } = await globals.supabase2.auth.signInWithPassword({
        email: email,
        password: password,
    })
    if (error) {
        console.error('Error logging in:', error);
        return;
    }
    globals.user = email;
    if (globals.USERNAMEDIV) {
        globals.USERNAMEDIV.innerHTML = globals.user
    }
}
async function fetchMessage(Table, column) {
    const { data, error } = await globals.supabase2
        .from(Table) // Replace with your table name
        .select(column) // Replace with your column names

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }
    return data
}
async function signUp(email,password) {
    const { publicKey, privateKey } = await generateKeyPair();
    const exportedPublicKey = await exportKey(publicKey, "spki",true);
    const exportedPrivateKey = await exportKey(privateKey, "spki",false);
    globals.MYPUBLICKEY = arrayBufferToBase64(exportedPublicKey);
    globals.MYPRIVATEKEY = arrayBufferToBase64(exportedPrivateKey);
    saveData("privateKey",globals.MYPRIVATEKEY)
    saveData("publicKey",globals.MYPUBLICKEY)
    saveData("userID",globals.CURRENTUSERID)
    console.log("Saving Data",globals.MYPUBLICKEY,globals.MYPRIVATEKEY,globals.CURRENTUSERID)
    const { data, error } = await globals.supabase2.auth.signUp({
        email: email,
        password: password,
    })
        console.log("What is this",error)
        if (error) {
            console.error('Error signing up:', error);
            alert(error)
            return;
        } else {
            console.log("Signed up","RUNNING")
            const { error2 } = await globals.supabase2

            .from("Users") 
            .insert({
              User_id: globals.CURRENTUSERID,
              Public_Key: globals.MYPUBLICKEY,
              email: email
            });
            return data, publicKey, privateKey
        }
}
async function getDataFromTable(Table, column) {
    const { data, error } = await globals.supabase2
        .from(Table) // Replace with your table name
        .select(column) // Replace with your column names

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }
    return data
}
function lowercase(inputString) {
    if (typeof inputString === 'string') {
        return inputString.toLowerCase();
    } else {
        console.log("Input is not a string",typeof inputString,inputString)
        throw new Error("Input is not a string");
    }
}
async function submitMessage(Table, MessageEncrypted,Public_Key,sendingto) {
    const { error } = await globals.supabase2
    .from(Table) // Replace with your table name
    .insert({ created_at: Date.now, sender_id: globals.user, SendingTo:sendingto, encrypted_message:MessageEncrypted, public_key:Public_Key  }) // Replace with your column names and values;
    if (error) {
        console.error('Error submitting message:', error);
    }
}
submitMessage('Messages', 'Jude', globals.MYPUBLICKEY, "hude@hude.earth");