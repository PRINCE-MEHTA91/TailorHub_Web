document.addEventListener('DOMContentLoaded', () => {
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