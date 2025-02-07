const {Client} = require('pg')

const client = new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"example",
    database:"postgres"
})

client.connect();

client.query('Select * from productbasketball', (err, res)=>{
    if(!err){
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end();
})