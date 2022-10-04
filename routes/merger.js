const express = require('express');
const db = require('../database/database_connection');
const axios = require('axios');
const { webhook_url } = require('../.config.json');
let router = express.Router();

router.get("/", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT * from merger', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

            // if(err) throw err
            console.log('The data from merger table are: \n', rows);
        })
    });
});

router.get("/selective", (req,res)=>{
    console.log(req.query)
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`SELECT * from merger where taskID=${req.query.taskID} && userID='${req.query.userID}'`, (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

            // if(err) throw err
            console.log('The data from tasks table are: \n', rows);
        })
    });
});


router.post("/", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`INSERT INTO merger (userID,taskID) VALUES ('${req.body.userID}',${req.body.taskID});`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send([{"status": "ok", "message": `Task with ID : ${output.insertId} has been listed`}])
                webhook_call(req.body.userID,req.body.channelID);

                console.log("Response from Instertion + \n"+output)
            } else {
                console.log(err)
            }
        })
    });
});

module.exports = router;


function webhook_call(userID, channelID){
    const body= {
        "content": `<@${userID}> has joined a task. Task specific channel : <#${channelID}>`,
        "username": "Joined Task"
    };
    axios.post(webhook_url, body)
        .then((response) => {
            console.log("Webhook Trigger Response \n"+response.data)
            return ;
        }, (error) => {
            console.log(error);
            return ;
        });
}