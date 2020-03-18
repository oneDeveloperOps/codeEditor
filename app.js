const express = require('express')
const app = express();
const mongoDb = require('./config/db')
//routes
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');

//body Parser to get body inside our request
app.use(express.json({ extended: true }));

//defined routes
app.use('/api/users' , users);
app.use('/api/posts' , posts);
app.use('/api/auth' , auth);
app.use('/api/profile' , profile);

mongoDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT , () => { console.log(`server running at port ${PORT}`) });