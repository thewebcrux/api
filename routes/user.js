const express = require('express');
const db = require('../database/database_connection');
const axios = require('axios');
let router = express.Router();

router.get("/", (req,res)=>{
    res.json("Show Every User");
});

router.get("/:userID", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`SELECT * from users where userID= '${req.params.userID}'`, (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.json(rows)
            } else {
                console.log(err)
            }

            // if(err) throw err
            console.log('The data from users table are: \n', rows);
        })
    });
});

router.post("/", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`INSERT INTO users (userID, verificationToken, email) VALUES ('${req.body.id}', '${req.body.token}', '${req.body.email}')`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                webhook_call(req.body.email, req.body.id)
                res.send([{"status": "ok", "message": `User Added`}])
                console.log(output)

            } else {
                console.log(err)
                res.send([{"Error": "Bleep Blop .. Something nasty happened while adding you.."}])
            }
        })
    });
}); 

router.put("/:userID", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`update users SET verified="yes" where userID=${req.params.userID}`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send([{"status": "ok", "message": `Verification Status Updated`}])

                console.log(output)
            } else {
                console.log(err)
                res.send([{"Error": "Bleep Blop .. Something nasty happened while updating you.."}])
            }
        })
    });
});

module.exports = router;

function webhook_call(email,userID){
    const body= {
        "content": `Email : **${email}** \n Verified: **No** \n User ID **<@${userID}>**`,
        "username": "User Added"
    };
    axios.post('https://discord.com/api/webhooks/1022556736919437342/qmamW4loFsU8d9NfdH-Omaz-4IDmok1h2hjfWHNa_Q3Q8998u6vBcYjY2gzIS7qxyq2b', body)
        .then((response) => {
            console.log("Webhook Trigger Response \n"+response.data)
            return ;
        }, (error) => {
            console.log(error);
            return ;
        });
}