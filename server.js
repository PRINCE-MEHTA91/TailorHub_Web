const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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
    app.post(`/api/${buttonId}`, (req, res) => {
        console.log(`${buttonId} clicked`);
        res.json({ message: `${buttonId} click received` });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
