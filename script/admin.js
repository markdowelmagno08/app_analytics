import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Your Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyB-lT02c3Ry90CYf9x_Qibys9PEhzwy2mU",
        authDomain: "signbuddy-d3d91.firebaseapp.com",
        projectId: "signbuddy-d3d91",
        storageBucket: "signbuddy-d3d91.appspot.com",
        messagingSenderId: "820561191348",
        appId: "1:820561191348:web:925ea006b96f2f164952e1",
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Get references to form elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Add event listener to form submission
    // Add event listener to form submission
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        // Check if the provided email matches any document in the "admin" collection
        const adminQuery = query(collection(db, 'admin'), where('email', '==', email));
        const adminSnapshot = await getDocs(adminQuery);

        if (adminSnapshot.docs.length > 0) {
            // User with the provided email exists in the "admin" collection
            // Try to sign in with the provided email and password
            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log('User logged in successfully!');

                resetId.reset();
                // Redirect to admin.html
                window.location.href = 'admin.html';
            } catch (signInError) {
                // Display alert for Incorrect Credentials
                document.getElementById('incorrectCredentialsAlert').style.display = 'block';
                console.error('Invalid email or password.');
            }
        } else {
            // Display alert for Incorrect Credentials
            document.getElementById('incorrectCredentialsAlert').style.display = 'block';
            console.error('Invalid email or password.');
        }
    } catch (error) {
        // Handle errors
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error logging in:', errorCode, errorMessage);
    }
});

