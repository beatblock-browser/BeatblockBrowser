// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {getUser} from "./songdata.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDIEQBCB65cEolBwKkPnAi74Ja5bFiav3s",
    authDomain: "beatblockbrowser.firebaseapp.com",
    projectId: "beatblockbrowser",
    storageBucket: "beatblockbrowser.appspot.com",
    messagingSenderId: "477037278423",
    appId: "1:477037278423:web:8bd41df2941f65e3162c92",
    measurementId: "G-W3N8R9EVJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;

// Google Sign-In Button Event Listener
const googleSignInBtn = document.getElementById('googleSignInBtn');
const discordSignInLink = document.getElementById('discordSignInLink');

if (googleSignInBtn != null) {
    googleSignInBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // The signed-in user info
            const user = result.user;
            const firebaseToken = await user.getIdToken(true);
            let localUser = await getUser();
            if (localUser != null) {
                await sendRequest(`/api/googlesync/${firebaseToken}`, {});
                window.location.reload();
            } else {
                console.log('User signed in:', user);
                localStorage.setItem('authToken', await sendRequest(`/api/googleauth/${firebaseToken}`, null));
                // Redirect to home page or dashboard
                //window.location.href = 'index.html';
            }
        } catch (error) {
            // Handle Errors here.
            showError(error.message);
            console.error('Error during sign in:', error);
        }
    });
}

if (discordSignInLink != null) {
    discordSignInLink.addEventListener('click', async () => {
        // Open a new window for Discord OAuth
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=1298420686087262269&redirect_uri=https%3A%2F%2Fbeatblockbrowser.me%2Fdiscordsync.html&response_type=code&scope=identify`;
        const _popup = window.open(oauthUrl, 'Discord OAuth', 'width=500,height=600');

        // Listen for messages from the popup
        window.addEventListener('message', async (event) => {
            if (event.origin !== window.location.origin) return;

            const { code } = event.data;
            if (code) {
                await sendRequest(`/api/discordsync/${code}`, {});
                window.location.reload();
            }
        });
    });
}

document.addEventListener('FinishInline', async () => {
    await setupNavbar();
});

if (window.fired) {
    setupNavbar();
}

function setupNavbar() {
    const loginNavLink = document.getElementById('loginNavLink');
    const uploadNavLink = document.getElementById('uploadNavLink');
    const accountNavLink = document.getElementById('accountNavLink');
    const signOutNavLink = document.getElementById('signOutNavLink');
    if (localStorage.getItem('authToken') != null) {
        console.log('User is signed in:', localStorage.getItem('authToken'));
        // Hide "Log In" link
        loginNavLink.classList.add('d-none'); // Using Bootstrap's d-none class
        // Show "Upload" and "Account" links
        uploadNavLink.classList.remove('d-none');
        accountNavLink.classList.remove('d-none');
        signOutNavLink.classList.remove('d-none');
        signOutNavLink.onclick = handleSignOut;
    } else {
        console.log('No user is signed in.');
        // Show "Log In" link
        loginNavLink.classList.remove('d-none');
        // Hide "Upload" and "Account" links
        uploadNavLink.classList.add('d-none');
        accountNavLink.classList.add('d-none');
        signOutNavLink.classList.add('d-none');
    }
}

export async function sendRequest(api, body, failure = showError) {
    try {
        if (body != null && localStorage.getItem('authToken') == null) {
            failure('You must be signed in to do this action!');
            return null;
        }

        if (body != null) {
            body.token = localStorage.getItem('authToken');
        }
        let response = await fetch(api, {
            method: body == null ? 'GET' : 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body == null ? null : JSON.stringify(body)
        });

        if (response != null && response.status === 429) {
            failure('Please stop spamming this function!');
            return null;
        }

        if (response == null || !response.ok) {
            failure('Error in the backend request, see console log');
            return null;
        }

        return await response.json();
    } catch (e) {
        showError(e.message);
        console.log(e);
        return null;
    }
}

async function handleSignOut() {
    // Remove authentication token from localStorage
    await auth.signOut();
    localStorage.removeItem("authToken");

    // Redirect to the homepage or login page
    window.location.href = 'index.html';
}

export async function runLoggedIn(ifLoggedIn, otherwise = () => showError('This action requires being signed in!')) {
    const token = localStorage.getItem('authToken');
    if (token) {
        await ifLoggedIn(token);
    } else {
        otherwise()
    }
}

export function showError(message, duration = 3000) { // duration in milliseconds
    const errorDiv = document.getElementById('search-error');
    let errorText = document.getElementById('search-error-text');
    if (errorText == null) {
        errorText = errorDiv;
    }

    // Set the error message text
    errorText.textContent = message;

    // Remove the 'invisible' class to display the error message
    errorDiv.classList.remove('invisible');

    // Ensure the 'fade-out' class is not present
    errorDiv.classList.remove('fade-out');

    // After the specified duration, add the 'fade-out' class to initiate the fade-out effect
    setTimeout(() => {
        errorDiv.classList.add('fade-out');

        // After the transition duration, add the 'invisible' class to hide the element
        setTimeout(() => {
            errorDiv.classList.add('invisible');
        }, 500); // Matches the CSS transition duration (0.5s)
    }, duration);
}