const express = require('express')
const app = express();
const mongoDb = require('./config/db')

app.use('/' , (req , res) => {
    res.send('<h1>Hello</h1>')
})

mongoDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT , () => { console.log(`server running at port ${PORT}`) });