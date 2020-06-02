const express = require('express');
const bodyParser = require('body-parser');
const multer = require("multer");
const cors = require('cors');

const mysql = require("mysql");

const PORT = 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

//Create connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'angular_file'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

app.get('/', function (req, res) {
  res.send('Hello from abhishek roy the angular developer..!!!')
})

app.post("/login", (request, response) => {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    conn.query('SELECT * FROM test_file WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
      if (results.length > 0) {
        response.status(200).send({ message: "User successfully logged in..!!" });
      } else {
        response.status(500).send({ message: "Incorrect Username and/or Password!"});
      }
      response.end();
    });
  } else {
    response.status(500).send({message: "Please enter Username and Password!"});
    response.end();
  }
});

app.post('/enroll', function (req, res) {
  // console.log(req.body)
  // res.status(200).send({ "message": "Data received" });

  let data = {
    username : req.body.userName,
    password : req.body.password,
    email    : req.body.email,
    promo    : req.body.subscribe,
    city     : req.body.address.city,
    state    : req.body.address.state,
    pcode    : req.body.address.postalCode,
  };
  let sql = "INSERT INTO test_file SET ?";
  let query = conn.query(sql, data, (err, ) => {
    if (err) console.log(err);
    res.status(200).send({ message: "Data received" });
  });

})

app.post("/update/:id", (req, res) => {

  let data = {
    username  : req.body.userName,
    password  : req.body.password,
    email     : req.body.email,
    promo     : req.body.subscribe,
    city      : req.body.address.city,
    state     : req.body.address.state,
    pcode     : req.body.address.postalCode,
  };

  let sql = "UPDATE test_file SET ? WHERE id=" + req.params.id + "";
  let query = conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.status(200).send({ message: "User successfully updated..!!" });
  });
});

app.get("/getData", (req, res) => {
  let sql = "SELECT * FROM test_file";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.status(200).send(results);
  });
});

app.post("/getIndvData", (req, res) => {
  let sql = "SELECT * FROM test_file WHERE id=" + req.body.id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.status(200).send(results);
  });
});

app.post("/delete", (req, res) => {
  let sql =
    "DELETE FROM test_file WHERE id=" + req.body.id + "";
  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    res.status(200).send({ message: "Data deleted" });
  });
});

app.listen(PORT, function () {
  console.log("Server running on localhost:" + PORT);
});

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, '../uploads')
  },
  filename: (req, file, callBack) => {
    // callBack(null, file.fieldname + "-" + Date.now())
    callBack(null, `abhishek_${file.originalname}`)
  }
})


// For single file upload
// const upload = multer({ storage: storage })

// For multiple file upload
const upload = multer({ storage: storage }).array('files', 10);

// For single file upload endpoint

// app.post('/upload', upload.single('file'), (req, res, next) => {
//   const file = req.file;
//   console.log(file.filename);
//   if (!file) {
//     const error = new Error('No File');
//     error.httpStatusCode = 400;
//     return next(error);
//   }
//   var sql =
//     "INSERT INTO `upload`(`image`) VALUES ('" + file.filename + "')";
//   let query = conn.query(sql, (err, results) => {
//     if (err) console.log(err);
//     res.status(200).send({ message: "File uploaded successfully..!!" });
//   })
// })

// For multiple file upload endpoint without aync await
// app.post('/uploads', upload.array('files',10), (req, res, next) => {

// For multiple file upload endpoint with aync await
app.post('/uploads', async function (req, res) {
  await upload(req, res, function (err) {
    const files = req.files;
    console.log(files);
    if (files.length <= 0) {
      console.log('hii');
      const error = new Error('No File');
      error.httpStatusCode = 400;
      return next(error);
    }
    else {
      for (let i = 0; i < files.length; i++) {
        // console.log(files[i].filename);
        var sql =
          "INSERT INTO `upload`(`image`) VALUES ('" + files[i].filename + "')";
        let query = conn.query(sql, (err, results) => {
          if (err) console.log(err);
          // res.status(200).send({ message: "File uploaded successfully..!!" });
        })
      }

      res.status(200).send({ message: "File uploaded successfully..!!" });
    }
  });
})
