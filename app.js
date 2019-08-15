const express = require('express');
const exphbs  = require('express-handlebars');
const app = express();
const upload = require('express-fileupload');
const mongoose = require('mongoose');
const {PythonShell} = require("python-shell");
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const url = "mongodb://localhost:27017/kikkadb";

// Connect to mongoose
mongoose.Promise = global.Promise; // Map global promise
mongoose.connect('mongodb://localhost:27017/kikkadb', {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

//load idea Model
require('./modles/Log')   // "./" mean looking at current directory
const Item = mongoose.model('items');


//express upload middleware
app.use(upload());

// BodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// handlebar middleware
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Method override middleware
app.use(methodOverride('_method'))

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Bcodes Route
app.get('/bcodes', (req, res) => {

// Connecting mongoClient
MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true},function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    var dbo = db.db("kikkadb");

    dbo.collection("sushi").find({}).toArray(function(err, result) {
      if (err) throw err;
    res.render('bcodes/index',{result: result});
    
    // console.log(result);
    // for (i in result){
    //   var a= result[i];
    //   for (i in a){
    //     console.log(i,'-----------',a[i]);
    //   }
    // }
  

    db.close();
    });

  });
  
});



//Add bcode form
app.get('/bcodes/add', (req, res) => {
  res.render('bcodes/add');
});


app.post('/bcodes', (req,res)=>{
  
  //Check if there is single file or multiple
  if(req.files.sampleFile.name){

    // upload single file
    console.log("upload only one file");
    var file = req.files.sampleFile;
    var fileName = req.files.sampleFile.name;
    file.mv("./upload/"+fileName, (err)=>{
      if(err){
        console.log(err);
        res.send('error occured');
      }else{
        
        console.log('success');
      }
    })


  }else{
    //Upload mutiple file
    const filess= []
    console.log("upload multiple file");
    for (i in req.files.sampleFile){
    filess.push(req.files.sampleFile[i]);
    }
    //loop through filess list
    for (i in filess){
      var fileName = filess[i].name
      filess[i].mv("./upload/"+fileName, (err)=>{
        if(err){
          console.log('there is an error');
        }else{
          console.log('Success multiple');
        } 
      })  
    }
  }

// run python doc and save to mongoose
var pythonFile = 'text.py'
var options = {
  mode: 'text',
};
PythonShell.run(pythonFile,options, function (err, results) {
  if (err) throw err;  
  // res.render('bcodes/index',{
  //   results: results
  });

//Redirect to Bcode list
res.redirect('/bcodes');
});


// ----------------------catolog

//Add catolog form
app.get('/catolog/add', (req, res) => {
  res.render('catolog/add');
});

app.get('/log', (req,res)=>{
  Item.find({})
    .sort({date:'desc'})
    .then(items =>{
      res.render('catolog/index', {
        items: items
      });
    })
})


app.get('/log/edit/:id', (req, res) => {
  Item.findOne({
    _id: req.params.id
  })
  .then(item => {
    res.render('catolog/edit', {
      item:item
    });
  });
 
});


app.post('/log',(req,res)=>{
  let errors = [];
  //(reques.body is an object with all of our form feilds)
  if (!req.body.title){
    errors.push({text:"Please add a title"});   
  }
  if (!req.body.bcode){
    errors.push({text:"Please add a barcode"});   
  }
  if(errors.length > 0){
    res.render('catolog/add',{
      errors: errors,
      title: req.body.title,
      bcode: req.body.bcode
    });
  }else{

    console.log(`create new Item ${req.body.title} with barcode ${req.body.bcode}`)
    const newItem = {
      item: req.body.title,
      bcode: req.body.bcode
    };
    console.log(newItem);
    new Item(newItem)
    .save()
    .then(item =>{
      // req.flash('success_msg', "Video idaea added")
      res.redirect('/log')  
    });
  }
  console.log(errors)
})


app.put('/log/:id',(req, res)=>{
  Item.findOne({
    _id: req.params.id
  })
  .then(item => {
    item.item =  req.body.item
    item.bcode = req.body.bcode;
    item.save();
    res.redirect('/log')
  })
  .catch(eror => console.log(eror));
  })



app.delete('/log/:id',(req,res)=>{
  Item.deleteOne({_id: req.params.id })
  .then(()=>{
    res.redirect('/log')
  })
  
});


const port = 5000;
app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});


