const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const jwt=require("jsonwebtoken");
const app=express();
app.use(cors());
app.use(express.json());

const PORT=5000, SECRET="q7_secret";

const userSchema=new mongoose.Schema({
  name:String,email:{type:String,unique:true},password:String,
  role:{type:String,default:"user"}
});
const User=mongoose.model("User",userSchema);

const categorySchema=new mongoose.Schema({
  name:{type:String,required:true},
  parent:{type:mongoose.Schema.Types.ObjectId,ref:"Category",default:null}
});
const Category=mongoose.model("Category",categorySchema);

const productSchema=new mongoose.Schema({
  name:{type:String,required:true},price:{type:Number,required:true},
  image:{type:String,default:""},
  category:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true},
  subcategory:{type:mongoose.Schema.Types.ObjectId,ref:"Category",default:null}
});
const Product=mongoose.model("Product",productSchema);

function auth(req,res,next){
  const token=(req.headers.authorization||"").replace("Bearer ","");
  if(!token)return res.status(401).json({message:"Login required"});
  try{req.user=jwt.verify(token,SECRET);next();}
  catch(e){res.status(401).json({message:"Invalid token"});}
}
function adminOnly(req,res,next){
  if(req.user.role!=="admin")return res.status(403).json({message:"Admin only"});
  next();
}

app.get("/",(req,res)=>res.send("Q7 Shopping Cart API is running"));

app.post("/api/register",async(req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({message:"All fields required"});
    if(await User.findOne({email}))return res.status(400).json({message:"Email already registered"});
    const u=await User.create({name,email,password,role:"user"});
    res.json({message:"Registration successful",user:{id:u._id,name:u.name,email:u.email}});
  }catch(e){res.status(500).json({message:e.message});}
});

app.post("/api/login",async(req,res)=>{
  try{
    const {email,password}=req.body;
    const u=await User.findOne({email,password});
    if(!u)return res.status(401).json({message:"Invalid email or password"});
    const token=jwt.sign({id:u._id,role:u.role,name:u.name},SECRET,{expiresIn:"1d"});
    res.json({token,user:{id:u._id,name:u.name,email:u.email,role:u.role}});
  }catch(e){res.status(500).json({message:e.message});}
});

app.get("/api/categories",async(req,res)=>res.json(await Category.find().sort({name:1})));

app.post("/api/categories",auth,adminOnly,async(req,res)=>{
  const {name,parent}=req.body;
  if(!name)return res.status(400).json({message:"Category name required"});
  res.json(await Category.create({name,parent:parent||null}));
});

app.delete("/api/categories/:id",auth,adminOnly,async(req,res)=>{
  const id=req.params.id;
  await Category.deleteMany({parent:id});
  await Product.deleteMany({$or:[{category:id},{subcategory:id}]});
  await Category.findByIdAndDelete(id);
  res.json({message:"Category deleted"});
});

app.get("/api/products",async(req,res)=>{
  const filter={};
  if(req.query.category)filter.category=req.query.category;
  if(req.query.subcategory)filter.subcategory=req.query.subcategory;
  res.json(await Product.find(filter)
    .populate("category","name").populate("subcategory","name").sort({_id:-1}));
});

app.post("/api/products",auth,adminOnly,async(req,res)=>{
  try{
    const {name,price,image,category,subcategory}=req.body;
    if(!name||price===undefined||!category)
      return res.status(400).json({message:"Name, price and category required"});
    const p=await Product.create({name,price,image:image||"",category,subcategory:subcategory||null});
    res.json(await p.populate(["category","subcategory"]));
  }catch(e){res.status(500).json({message:e.message});}
});

app.delete("/api/products/:id",auth,adminOnly,async(req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({message:"Product deleted"});
});

mongoose.connect("mongodb://127.0.0.1:27017/q7shopping").then(async()=>{
  if(!await User.findOne({email:"admin@gmail.com"}))
    await User.create({name:"Admin",email:"admin@gmail.com",password:"admin123",role:"admin"});
  console.log("MongoDB connected");
  app.listen(PORT,()=>console.log("Backend running on http://localhost:"+PORT));
}).catch(e=>console.log("MongoDB error:",e.message));
