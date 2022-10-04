const express = require('express');
const db = require('../database/database_connection');
const axios = require('axios');
const { webhook_for_users } = require('../.config.json');
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
        connection.query(`update users SET ${req.body.column}='${req.body.value}' where userID=${req.params.userID}`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send([{"status": "ok", "message": `Status Updated`}])

                console.log(output)
            } else {
                console.log(err)
                res.send([{"Error": "Bleep Blop .. Something nasty happened while updating you.."}])
            }
        })
    });
});

router.put("/:userID/:exp", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`update users SET ${req.body.column}=${req.body.column}${req.params.exp} where userID=${req.params.userID}`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send([{"status": "ok", "message": `${req.body.column} Status Updated`}])

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
    axios.post(webhook_for_users, body)
        .then((response) => {
            console.log("Webhook Trigger Response \n"+response.data)
            return ;
        }, (error) => {
            console.log(error);
            return ;
        });
}