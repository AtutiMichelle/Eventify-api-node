const mysql= require('mysql2');
const dotenv=require('dotenv');
const util = require('util');


dotenv.config();

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Database');
    connection.release(); 
});

// Promisify queries for async/await
pool.query = util.promisify(pool.query);

module.exports=pool;