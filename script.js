document.addEventListener('DOMContentLoaded', () => {
    const userAuth = document.querySelector('.user-auth');
    const userWelcome = document.querySelector('.user-welcome');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    if (isLoggedIn) {
        userAuth.style.display = 'none';
        userWelcome.style.display = 'flex';
    } else {
        userAuth.style.display = 'flex';
        userWelcome.style.display = 'none';
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log("Navigating to login page...");
            window.location.href = 'login.html';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            console.log("Navigating to signup page...");
            window.location.href = 'signup.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout button clicked');
            localStorage.setItem('loggedIn', 'false');
            window.location.reload();
        });
    }

    const buttons = [
        'categories-btn',
        'deals-btn',
        'new-arrivals-btn',
        'trending-btn',
        'shirts-service-btn',
        'pants-service-btn',
        'kurtas-service-btn',
        'suits-service-btn',
        'dresses-service-btn',
        'accessories-service-btn',
        'book-appointment-btn',
        'home-btn',
        'clothing-btn',
        'tailors-btn',
        'account-btn'
    ];

    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                fetch(`http://localhost:3000/api/${buttonId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    // You can add further actions here, like showing a notification
                })
                .catch(error => console.error('Error:', error));
            });
        }
    });
});