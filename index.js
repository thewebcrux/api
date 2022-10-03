const express = require('express');
const task = require('./routes/task');
const user = require('./routes/user');
const merger = require('./routes/merger')
// const bodyParser = require('body-parser');
const PORT = 5000;
const app = express();

app.use(express.json());
app.use("/task",task);
app.use("/user",user);
app.use('/merger',merger)

// app.use(bodyParser.json());

//GET /
app.get('/', (req,res) => {
    console.log("req rec");
    res.send("req rec");
});

app.listen(PORT, () => console.log(`Server Running on http://localhost:${PORT}`));
