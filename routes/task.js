const express = require('express');
const db = require('../database/database_connection');
const axios = require('axios');
let router = express.Router();

router.get("/", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT * from tasks', (err, rows) => {
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

router.get("/:taskID", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`SELECT * from tasks where taskID=${req.params.taskID}`, (err, rows) => {
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
        connection.query(`INSERT INTO tasks (task, points, total_spots, created_by, spots_left,channelID) VALUES ('${req.body.task}',${req.body.points},${req.body.total_spots},'${req.body.created_by}',${req.body.total_spots}, '${req.body.channelID}');`, (err, output) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send([{"status": "ok", "message": `Task with ID : ${output.insertId} has been listed`}])
                webhook_call(req.body.task, req.body.created_by, req.body.points, req.body.total_spots,req.body.channelID);

                console.log("Response from Instertion + \n"+output)
            } else {
                console.log(err)
            }
        })
    });
});

router.put("/:taskID", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`update tasks SET ${req.body.column}='${req.body.value}' where taskID=${req.params.taskID}`, (err, output) => {
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

router.put("/:taskID/:exp", (req,res)=>{
    db.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query(`update tasks SET ${req.body.column}=${req.body.column}${req.params.exp} where taskID=${req.params.taskID}`, (err, output) => {
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


function webhook_call(task,creator,points,spots,channelID){
    const body= {
        "content": `Task : **${task}** \n Added By: **<@${creator}>** \n Total Spots **${spots}** \n Points : **${points}** \n Channel : <#${channelID}>`,
        "username": "Task Added"
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