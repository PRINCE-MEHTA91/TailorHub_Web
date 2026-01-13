document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const formData = { username, email, password };
            console.log('Form data:', formData);

            fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                alert('Signup successful! You can now log in.');
                window.location.href = 'index.html'; // Redirect to login page
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred during signup. Please try again.');
            });
        });
    }
});
