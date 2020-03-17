const express = require('express')
const app = express();

app.use('/' , (req , res) => {
    res.send('<h1>Hello</h1>')
})

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => { console.log(`server running at port ${PORT}`) });