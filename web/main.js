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

        this.MYPUBLICKEY = 1;

        this.MYPRIVATEKEY = 2;
    }
}   

let globals = new Globls();
let session = await globals.supabase2.auth.getSession();
if (session.data.session !== null) {
    console.log("Sesion is ",session.data.session.user.email)
    globals.user = session.data.session.user.email
    globals.USERNAMEDIV.innerHTML = globals.user
}
if (globals.LOGOUTDIV) {
    globals.LOGOUTDIV.addEventListener("click", logOut)
}
if (globals.LOGINFORM) {
    globals.LOGINFORM.addEventListener("click", async function(e) {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        console.log(email,password)
        alert(await signIn(email,password))


    })
}
if (globals.SIGNUPBUT) {
    globals.SIGNUPBUT.addEventListener("click", async function(e) {
        e.preventDefault()
        let email = document.getElementById("email").value
        let password = document.getElementById("password").value
        console.log(email,password)
        alert(await signUp(email,password))
        location.href = "./index.html"
        

    })
}
console.log(session)
if (session.data.session !== null) {
    globals.user = session.data.session.user.email;
    console.log(globals.user)
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
    const { data, error } = await globals.supabase2.auth.signUp({
        email: email,
        password: password,
    })
    if (error) {
        return error
    } else {
        return data
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
        globals.user = session.data.session.user.email
        globals.USERNAMEDIV.innerHTML = globals.user
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
console.log(await fetchMessage('Messages', 'User_id'));
console.log(await fetchMessage('Users', 'Username'));
console.log(await fetchMessage('Users', 'Public_Key')); 