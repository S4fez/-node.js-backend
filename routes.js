// routes.js
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dbConfig = require('./dbconfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool(dbConfig);

router.get('/productbasketball', (req, res) => {
    const status = 'A';
    pool.query('SELECT * FROM productbasketball WHERE record_status ILIKE $1',
        ['%' + status + '%'], (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
                res.status(500).send('Error executing query');
            } else {
                res.json(result.rows);
            }
        });
});



router.get('/productdetail/:productid', (req, res) => {
    // console.log("productid = ", req.params.productid)
    pool.query('SELECT * FROM productdetail where product_id = ' + req.params.productid + '', (err, result) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).send('Error executing query');
        } else {
            res.json(result.rows);
        }
    });
});


router.get('/productbrand/:brandid/', (req, res) => {
    // console.log('SELECT * FROM productdetail where product_id = ', req.params.productid + '')
    const brandid = req.params.brandid;
    const status = 'A'; // สมมติรับจาก query

    const query = `
  SELECT * 
  FROM productbrand 
  LEFT JOIN productdetail ON productbrand.brand_id = productdetail.brand_id
  WHERE productbrand.brand_id = $1
    AND productdetail.record_status ILIKE $2
`;

    const values = [brandid, `%${status}%`];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error executing query ', err.stack);
            res.status(500).send('Error executing query brand');
        } else {
            res.json(result.rows);
        }
    });
});
router.get('/productdetail/:productid', (req, res) => {
    pool.query(`SELECT * FROM productbrand 
    LEFT JOIN productdetail ON productbrand.brand_id = productdetail.brand_id
    where productdetail.product_id = ${req.params.productid}`, (err, result) => {
        if (err) {
            console.error('Error executing query ', err.stack);
            res.status(500).send('Error executing query brand');
        } else {
            res.json(result.rows);
        }
    });
});

// ****Shopping-cart-SIZE****
router.get('/productstore/:productid', (req, res) => {
    const { productid } = req.params;
    pool.query(`
        SELECT * FROM productdetail 
        LEFT JOIN productstore 
        ON productdetail.product_id = productstore.product_id
        where productstore.product_id = $1 ORDER BY productsize_id ASC`, [productid],
        (err, result) => {
            if (err) {
                console.error('Error executing query ShopCart', err.stack);
                res.status(500).send('Error executing query brand');
            } else {
                res.json(result.rows);
            }
        });
});

// ****Cart-ID SIZE****
router.post('/productstore/bucket', (req, res) => {
    const sizeid = req.body.sizeId;
    // console.log('param = ',param)
    // console.log('const sizeid', sizeid)
    // console.log('req.body.sizeId', req.body.sizeId)
    pool.query(`SELECT store.product_id, store.productsize_id, store.size, store.stock_size, detail.product_id, detail.nameproduct, detail.img, detail.price
                FROM productstore AS store
                LEFT JOIN productdetail AS detail
                ON store.product_id = detail.product_id WHERE productsize_id = ANY($1)`, [sizeid],
        (err, result) => {
            if (err) {
                console.error('Error executing query CartSizeID', err.stack);
                res.status(500).send('Error executing query SIZEID');
            } else {
                res.json(result.rows);
            }
        });
});

// Payment 

router.post('/productstore/paybucket', (req, res) => {
    const issize = req.body.map(item => item.sizeId);

    pool.query(
        `SELECT productsize_id, stock_size 
         FROM productstore 
         WHERE productsize_id = ANY($1::int[])`, // ระบุว่า $1 เป็น array
        [issize],
        (err, result) => {
            if (err) {
                console.error('Error executing query PayCart', err.stack);
                res.status(500).json({ status: 'error', message: 'Error executing query brand' });
            } else {
                const insufficientStock = req.body.some(item => {
                    const dbItem = result.rows.find(row => row.productsize_id === item.sizeId);
                    return dbItem && dbItem.stock_size < item.quantity;
                });

                if (insufficientStock) {
                    return res.status(422).json({ status: 'error', message: 'The requested quantity is unavailable' });
                }

                // อัปเดตสต็อกสินค้า

                const updateQuery = `
                    UPDATE productstore
                    SET stock_size = CASE
                        ${req.body.map((item, index) => `WHEN productsize_id = $${index * 2 + 1} THEN stock_size - $${index * 2 + 2}`).join(' ')}
                    END
                    WHERE productsize_id IN (${req.body.map((_, index) => `$${index * 2 + 1}`).join(', ')})
                `;

                const updateParams = req.body.flatMap(item => [item.sizeId, item.quantity]);

                console.log(updateQuery); // ตรวจสอบคำสั่ง SQL
                console.log(updateParams); // ตรวจสอบพารามิเตอร์


                pool.query(updateQuery, updateParams, (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating stock:', updateErr.stack);
                        res.status(500).json({ status: 'error', message: 'Error updating stock' });
                    } else {
                        res.status(200).json({ status: 'success', code: 1, message: "SUCCESS CASE" });
                    }
                });
            }
        }
    );
});




router.post('/login', async (req, res) => {
    //นำยูสเซอเนม
    const account = pool.query(`SELECT * FROM account where username_hash = '${req.body.username}' `,
        (err, result) => {
            if (err) {
                console.error('Error executing query ', err.stack);
                return res.status(500).send('Error executing query account');
            } else {
                if (result.rowCount == 0) {
                    return res.status(401).send('Error username or password not correct');
                }

                bcrypt.compare(req.body.password, result.rows[0].password_hash, (err, resultbcrypt) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        return res.status(500).send('Error compare bcrypt');
                    }

                    if (resultbcrypt) {
                        // console.log('Password is correct!');
                        const token = jwt.sign({ userId: result.rows[0].user_id, username: result.rows[0].username_hash }, process.env.JWT_SECRET, {
                            expiresIn: '10h', // Token expires in 10 hour
                        });
                        return res.json({ token });


                    } else {
                        // console.log('Password is incorrect.');
                        return res.status(401).send('Error username or password not correct');
                    }
                });
            }

        });
});
router.post('/register', async (req, res) => {
    const { usernamehash, passwordhash, email } = req.body;
    // console.log('req.body', req.body)
    try {
        //   const hashedPassword = await bcrypt.hash(password, 10);
        const check = await pool.query(
            `SELECT * from account where username_hash = $1`, [usernamehash]
        );
        // console.log('check', check.rows);

        if (check.rows.length > 0) {
            // มีข้อมูล
            console.log('Data found:', check.rows);
            return res.status(400).send('This username has already been used ')
        }
        else {
            // ไม่มีข้อมูล ->ลงทำเบียนผู้ใช้ใหม่
            // console.log('No data found');
            const Password = await hashPassword(passwordhash);
            const newUser = await pool.query(
                `INSERT INTO account (username_hash,password_hash,email) 
                VALUES ($1, $2, $3) `,
                [usernamehash, Password, email]
            );
            //ตรวจว่ามีผลลัพธ์การแทรกข้อมูลและที id หรือไม่
            //ตอบกลับเมื่อลงทะเบียนสำเร็จ
            // console.log(newUser.rowCount)
            // console.log(newUser)
            if (newUser.rowCount > 0) {
                return res.status(201).json({
                    message: 'User registered successfully',
                });

            } else {
                // กรณีไม่มีการสร้าง id หลังจาก INSERT
                return res.status(500).json({
                    message: 'Failed to register user'
                });
            }
        }

        //   const result = await pool.query(
        //     'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
        //     [username, email, hashPassword]
        //   );
        //ตอบกลับเมื่อลงทะเบียนสำเร็จ
        //    return res.status(201).json({ 
        //         message: 'User registered successfully',    
        //         userId: newUser.rows[0].id 
        //     });
    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
});
async function hashPassword(plainTextPassword) {
    const saltRounds = 10; // The cost factor for the hashing algorithm 

    try {
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        // console.log('Hashed Password:', hashedPassword);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

module.exports = router;