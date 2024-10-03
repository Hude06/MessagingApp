const { Preferences } = window.Capacitor.Plugins;
const { createClient } = supabase;

class Globls {
    constructor() {
        this.supabase2 = createClient('https://dvlfunioxoupyyaxipnj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bGZ1bmlveG91cHl5YXhpcG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczODE2MzIsImV4cCI6MjA0Mjk1NzYzMn0.Tyqzm6kKzVZqnBDYN69Pb3fcwkSRcA4zUb6QSO0I6gY'); // Replace with your actual anon key
        this.messages = [];
        this.sidebar = document.getElementById("sidebar");
        this.user = null;
        this.LOGOUTDIV = document.getElementById("logout")
        this.LOGINFORM = document.getElementById("login-submit")

        this.SIGNUPBUT = document.getElementById("SIGNUP")

        this.USERNAMEDIV = document.getElementById("usernameIS")
        this.MYPUBLICKEY = 1

        this.MYPRIVATEKEY = 1

        this.CONTACTSDIV = document.getElementById("contacts")

        this.PUBKEYDIV = document.getElementById("UsersPubKey")

        this.CURRENTUSERID = generateRandomString(10)

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
                console.log(format,key)
                const exportedKey = await window.crypto.subtle.exportKey("spki", key);
                console.log("WORKED Pub")
                console.log(exportedKey)
                return exportedKey
        } else {
                const exportedKey = await window.crypto.subtle.exportKey("pkcs8", key);
                console.log("WORKED Priv")
                console.log(exportedKey)
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

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}
let globals = new Globls();


let session = await globals.supabase2.auth.getSession();
if (session.data.session !== null) {
    console.log("Sesion is ",session.data.session.user.email)
    globals.user = session.data.session.user.email
    if (globals.USERNAMEDIV) {
        globals.USERNAMEDIV.innerHTML = globals.user
    }
}
if (globals.LOGOUTDIV) {
    globals.LOGOUTDIV.addEventListener("click", logOut)
}
if (globals.LOGINFORM) {
    globals.LOGINFORM.addEventListener("click", async function(e) {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        alert(await signIn(email,password))


    })
}
if (globals.SIGNUPBUT) {
    globals.SIGNUPBUT.addEventListener("click", async function(e) {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        await signUp(email,password)

        location.href = "./index.html"
        

    })
}
if (session.data.session !== null) {
    globals.user = session.data.session.user.email;
} else {
    console.log("No user logged in")
}
async function logOut() {
    const { error } = await globals.supabase2.auth.signOut()
    console.log(error)
    location.reload()
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
    const { data, error } = await globals.supabase2.auth.signUp({
        email: email,
        password: password,
    })
        if (error) {
            console.error('Error signing up:', error);
            alert(error)
            return;
        }
        const { error2 } = await globals.supabase2

        .from("Users") // Replace with your table name
        .insert({
          User_id: globals.CURRENTUSERID,
          Public_Key: globals.MYPUBLICKEY, // Replace with your column names and values
          email: email
        });
        console.log('Inserted public key:', exportedPublicKey);
        return data, publicKey, privateKey
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
async function signIn(email,password) {
    const { data, error } = await globals.supabase2.auth.signInWithPassword({
        email: email,
        password: password,
    })
    if (error) {
        return error
    } else {
        globals.user = email
        globals.USERNAMEDIV.innerHTML = globals.user
        let tempEmail = await getDataFromTable("Users", "email")
        for (let i = 0; i < tempEmail.length; i++) {
            if (lowercase(tempEmail[i].email) === lowercase(email)) {
                globals.MYPUBLICKEY = (await getDataFromTable("Users", "Public_Key",))[i]
                globals.CURRENTUSERID = (await getDataFromTable("Users", "User_id",))[i]
                console.log(globals.MYPUBLICKEY, globals.CURRENTUSERID)
            }
        }
        return data
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