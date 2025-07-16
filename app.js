const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { Client } = require('ssh2')
const fs = require('fs')

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


app.get('/', (req, res) => {
    const conn = new Client();
  
    conn.on('ready', () => {
      console.log('SSH Connection established.');
  
      conn.exec('df -h', (err, stream) => {
        if (err) {
          conn.end();
          return res.status(500).send('SSH command error: ' + err.message);
        }
  
        let output = '';
  
        stream.on('close', (code, signal) => {
          console.log(`Stream closed with code ${code}, signal ${signal}`);
          conn.end();
          res.send(`<pre>${output}</pre>`);
        }).on('data', (data) => {
          output += data.toString();
        }).stderr.on('data', (data) => {
          output += 'STDERR: ' + data.toString();
        });
      });
    }).connect({
      host: '15.206.203.114',
      port: 22,
      username: 'ec2-user',
      privateKey: fs.readFileSync('./global.pem')
    });
  });

const db = mysql.createConnection({
    host: '172.31.4.196',
    user: 'dbadmin',
    password: '',
    database: 'new_db_1'
})

db.connect((err)=>{
    if (err) {
        console.log('Error connecting to MySQL: ' + err);
        return;
      }
      console.log('Connected to MySQL as ID ' + db.threadId);
})



app.listen(3000,()=>{console.log("Started at 3000")})