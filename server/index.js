const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const upload = require('express-fileupload');
const mysql = require('mysql2');
const md5 = require('md5');
var fs = require('fs');
var cors = require('cors')
var Jimp = require('jimp');
const path =require('path')
const https=require('https')
var connection;
function handleDisconnect()
{
    connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.password,
        database: process.env.db,
        port: 3306
    })
    try
    {
        console.log("Connected!");
        connection.query ("SET SESSION wait_timeout = 10000");
        var sql = "SHOW TABLES LIKE 'users'";
        connection.query(sql, function (err, result) 
        {
            if(result && result.length===0)
            {
                var sql = "CREATE TABLE users (id VARCHAR(255), name VARCHAR(255), email VARCHAR(255), dp VARCHAR(255),  storage INT, PRIMARY KEY(id))";
                connection.query(sql, function (err, result) {
                    if (err) throw err;
                        console.log("Master Table created!");
                });
            }
            else
            {
                console.log("Master Table already exists!") 
            }
        });
    }
    catch(e)
    {
        console.log(e)
        handleDisconnect()
    }
}
handleDisconnect()
// setInterval(handleDisconnect,60000)
require('./googleAuth');

app.use(express.static('uploads'))
app.use(upload())
app.use(cors({credentials:true}))
// app.use(express.static(path.join(__dirname,'../','memories','build')))
app.use(express.static(path.join(__dirname,'./','build')))

app.listen(5000, () => console.log('listening on port: 5000'));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true, cookie:{maxAge: 24 * 60 * 60 * 1000} }));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/');
}

app.get('/',(req,res)=>{
    // res.sendFile(path.join(__dirname,'../','memories','build','index.html'))
    res.sendFile(path.join(__dirname,'./','build'))
})
app.get('/home', isLoggedIn, (req, res) => {
    // res.sendFile(path.join(__dirname,'../','memories','build','index.html'))
    res.sendFile(path.join(__dirname,'./','build','index.html'))
  });

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', 
    {
        successRedirect: '/protected',
        failureRedirect: '/auth/google/failure'
    })
);

app.get('/protected', isLoggedIn, (req, res) => {

    var dir = __dirname+`/uploads/${req.user.id}/`;
    var compressed = __dirname+`/uploads/${req.user.id}/compressed/`;
    var original= __dirname+`/uploads/${req.user.id}/original/`;

    if (!fs.existsSync(dir))
    {
        fs.mkdirSync(dir,  { recursive: true });
        fs.mkdirSync(compressed,  { recursive: true });
        fs.mkdirSync(original,  { recursive: true });
        const file = fs.createWriteStream(dir+"dp.jpg");
        const request = https.get(`${req.user.picture}`, function(response) {
            response.pipe(file);
        });
    }

    var sql = `SELECT * FROM users WHERE id = ${req.user.id}`;
    connection.query(sql, function (err, result) 
    {
        if(result && result.length === 0)
        {
            var sql = `INSERT INTO users (id, name, email, dp, storage) VALUES ('${req.user.id}', '${req.user.displayName}', '${req.user.email}', '${req.user.picture}', 0)`
            connection.query(sql, function (err, result) {
                if (err)
                {
                   console.log(err)
                };
            });
            // console.log(req.user)
        }
        else{
            console.log('already user in master table')
            // console.log(req.user)
        }
    });
    
    var sql1 = `SHOW TABLES LIKE '${md5(req.user.id)}'`;
    connection.query(sql1, function (err, result) 
    {
        if(result && result.length === 0)
        {
            var sql2 = `CREATE TABLE ${md5(req.user.id)} (Id VARCHAR(255), fileId VARCHAR(255), fileName VARCHAR(255), favourite BOOLEAN,  trash BOOLEAN, storage INT, PRIMARY KEY(Id))`;
            connection.query(sql2, function (err, result) {
                if (err)
                {
                    console.log(err);
                };
                    res.redirect('/home')
            });
        }
        else
        {
            res.redirect('/home')
        }
    });
});

app.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
   res.redirect("/")
});

///////////////////////////////////////////////////////////// - Testing Routes
app.get('/upload',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

app.get('/gallery', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM ${md5(req.user.id)} WHERE trash = ${false}`;
    connection.query(sql, function (err, result) 
    {
        if (err) throw err;
        // console.log(result)
        res.json(result)
    });
})
app.get('/fav', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM ${md5(req.user.id)} WHERE favourite = ${true}`;
    connection.query(sql, function (err, result) 
    {
        if (err) throw err;
        // console.log(result)
        res.json(result)
    });
})
app.get('/trash', isLoggedIn, (req,res)=>{
     var sql = `SELECT * FROM ${md5(req.user.id)} WHERE trash = ${true}`;
    connection.query(sql, function (err, result) 
    {
        if (err) throw err;
        // console.log(result)
        res.json(result)
    });
})

app.get('/commonDetails', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM users WHERE id = ${req.user.id}`;
    connection.query(sql, function (err, result) 
    {
        if (err) throw err;
        // console.log(result)
        res.json(result)
    });
})

app.get('/allImages', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM ${md5(req.user.id)}`;
    connection.query(sql, function (err, result) 
    {
        if (err) throw err;
        // console.log(result)
        res.json(result)
    });
})

app.get('/original/:id', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM ${md5(req.user.id)} WHERE Id = '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        };
        // console.log(result)
        res.sendFile(__dirname+`/uploads/${req.user.id}/original/`+result[0].fileId)
    });
})
app.get('/compress/:id', isLoggedIn, (req,res)=>{
    var sql = `SELECT * FROM ${md5(req.user.id)} WHERE Id = '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        };
        if(result && result.length>0)
        res.sendFile(__dirname+`/uploads/${req.user.id}/compressed/`+result[0].fileId)
    });
})
app.get('/dp', isLoggedIn, (req,res)=>{
    res.sendFile(__dirname+`/uploads/${req.user.id}/dp.jpg`)
})

app.get('/setfav/:id',(req,res)=>{
    console.log(req.params.is)
    var sql = `UPDATE ${md5(req.user.id)} SET favourite = ${true} WHERE Id= '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        }
        res.sendStatus(200)
    });
})
app.get('/settrash/:id',(req,res)=>{
    var sql = `UPDATE ${md5(req.user.id)} SET trash = ${true} WHERE Id= '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err);
        }
    });
    var sql1 = `UPDATE ${md5(req.user.id)} SET favourite = ${false} WHERE Id= '${req.params.id}'`;
    connection.query(sql1, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        }
        res.sendStatus(200)
    });
})
app.get('/removefav/:id',(req,res)=>{
    console.log(req.params.is)
    var sql = `UPDATE ${md5(req.user.id)} SET favourite = ${false} WHERE Id= '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        }
        res.sendStatus(200)
    });
})
app.get('/removetrash/:id',(req,res)=>{
    var sql = `UPDATE ${md5(req.user.id)} SET trash = ${false} WHERE Id= '${req.params.id}'`;
    connection.query(sql, function (err, result) 
    {
        if (err)
        {
            console.log(err)
        }
        res.sendStatus(200)
    });
})

///////////////////////////////////////////////////////////// - POST
app.post('/', isLoggedIn, (req,res)=>{

    var compressed = __dirname+`/uploads/${req.user.id}/compressed/`;
    var original= __dirname+`/uploads/${req.user.id}/original/`;

    if(req.files)
    {
            var file=req.files.file
            // console.log(file)
            var size=file.size
            var format=file.mimetype.split('/')[1]

            if(format !="jpg" && format !="jpeg" && format!="png")
            {
                return res.status(200).send({status: 0, message: "unsupported"});
            }
           
            else if(fs.existsSync(original+file.md5+'.'+format))
            {
                return res.status(200).send({status: 0, message: "duplicate"});
            }
            else
            {
                // var sql = `SELECT storage FROM users WHERE ID = ${req.user.id}`;
                // connection.query(sql, function (err, result) 
                // {
                //     if (err) throw err;
                //     if((result[0].storage + (size)/1024)/1024>=1)
                //     {
                //         return res.status(200).send({status: 0, message: "limit"});
                //     }
                //     else
                //     {
                //     }
                // })

                file.mv(original+file.md5+'.'+format,(err)=>{
                    if (err)
                    {
                        console.log(err)
                    }
                    crop(res,original,file,format,compressed)
                })

    
                var sql = `UPDATE users SET storage = storage + ${size/1024} WHERE ID = ${req.user.id}`;
                connection.query(sql, function (err, result) 
                {
                    if (err)
                    {
                        console.log(err)
                    }
                });
                
                var sql1=`INSERT INTO ${md5(req.user.id)} (Id, fileId , fileName , favourite , trash, storage) VALUES ('${file.md5}', '${file.md5+'.'+format}', '${file.name}', ${false}, ${false}, '${size/1024}')`
                connection.query(sql1, function (err, result) 
                {
                    if (err)
                    {
                        console.log(err)
                    }
                    return res.status(200).send({status: 0, message: "success"});
                });
            }
    }
    else
    {
        res.send("No uploads")
    }
})

async function crop(res,original,file,format,compressed){

    Jimp.read(fs.readFileSync(original+file.md5+'.'+format), (err, lenna) => {
        if (err)
        {
            console.log(err)
        }
        lenna
          .scaleToFit(400, 400)
          .quality(60)
          .write(compressed+file.md5+'.'+format);
      });
}
