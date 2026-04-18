function createFloatingElements(count) {
    for (let i = 0; i < count; i++) {
        let floating = document.createElement("div");
        floating.classList.add("floating");
        floating.style.top = Math.random() * 100 + "vh";
        floating.style.left = Math.random() * 100 + "vw";
        floating.style.animationDuration = (Math.random() * 3 + 3) + "s";
        document.body.appendChild(floating);
    }
}
createFloatingElements(10);
const mongoose = require('mongoose');
const { Schema } = mongoose;
const connectDB = require('./config/database');
require('dotenv').config();

// Connect to database
connectDB();