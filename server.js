const express=require('express');
const app=express();
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
const cors=require('cors');

const knex=require('knex');


const bcrypt=require('bcrypt-nodejs');

var db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'shirdisai',
    database : 'smartbrain'
  }
});


app.use(cors())
// const database={
//   users:[
//     {
//       id:'123',
//       name:'sai',
//       email:'saiashish',
//       password:'1234',
//       hash:'',
//       entries:0,
//       joined:new Date()
//     }
//   ]
// }
db.select('*').from('users').then(data=>{
  console.log(data);
})


app.get('/',(req,res)=>{
  res.json('')
})

app.post('/signin',(req,res)=>{
// brcypt.compare("124",hash,(err,res)=>{
// console.log("success");
// })
// if(req.body.email===database.users[0].email&&req.body.password===database.users[0].password){
//   res.status(200).json('success')
// }else{
//   res.status(400).json('error')
// }


db.select('email','hash').from('login')
.where('email','=',req.body.email)
.then(data=>{
const isvalid=bcrypt.compareSync(req.body.password,data[0].hash)
console.log(isvalid);
if(isvalid){
return  db.select('*').from('users')
  .where('email','=',req.body.email)
  .then(user=>{
console.log(user);
    res.json(user[0])
  })
  .catch(err=>res.status(400).json('unable to get user'))
}else{
  res.status(400).json('wrong credentials')
}

}).catch(err=>res.status(400).json('wrong credentials'))




})

app.post('/register',(req,res)=>{

const {email,name,password}=req.body;
  const hash=bcrypt.hashSync(password);
// brcypt.hash(password,null,null,(err,hash)=>{
//   console.log(hash);
// })
  // database.users.push({
  //   id:'132',
  //   name:name,
  //   email:email,
  //   password:brcypt.hash(password,null,null,(err,hash)=>{
  //     return hash;
  //     // console.log(hash);
  //   }),
  //   entries:0,
  //   joined:new Date()
  // })
db.transaction(trx=>{
  trx.insert({
    hash:hash,
    email:email
  }).into('login')
  .returning('email')
  .then(loginEmail=>{
    return trx('users')
      .returning('*')
      .insert({
       email:loginEmail[0],
       name:name,
       joined:new Date()
      })
      .then(data=>{
        res.json(data[0]);
    })
  })
  .then(trx.commit)
  .catch(trx.rollback)
})
.catch(err=>res.status(400).json('already exists'))

})

app.get('/profile/:id',(req,res)=>{
  const {id}=req.params;
  let found=false;
  // database.users.forEach(user=>{
  //   if(user.id=== id){
  //     found=true;
  //     return res.json(user);
  //   }
  // })

  db.select('*').from('users').where({id}).then(user=>{
    console.log(user[0]);
    if(user.length){
      res.json(user[0])  }
else{
      res.status(400).json('not found')
    }}
).catch(err=> res.status(400).json('err'))
  // if(!found){
  //   res.status(404).json('not found')
  // }

})


app.put('/image',(req,res)=>{
  const {id}=req.body;
  // let found=false;
  // database.users.forEach(user=>{
  //   if(user.id=== id){
  //     found=true;
  //     user.entries++;
  //     return res.json(user.entries);
  //   }
  // })
  // if(!found){
  //   res.status(404).json('not found')
  // }
    db('users').where('id', '=', id)
    .increment('entries',1)
    .returning('entries')
    .then(entry=>{
         res.json(entry[0]);
    })
.catch(err=>{
  res.status(400).json('err')
})
})

app.listen(3000,()=>
{
  console.log('server started');
})
