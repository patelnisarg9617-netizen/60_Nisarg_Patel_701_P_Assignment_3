import React,{useEffect,useState} from "react";
import{createRoot}from"react-dom/client";
import{BrowserRouter,Link,Routes,Route,useNavigate}from"react-router-dom";
import"./style.css";

const API="http://localhost:5000/api";
const token=()=>localStorage.getItem("q7token");
const user=()=>{try{return JSON.parse(localStorage.getItem("q7user"))}catch{return null}};
async function api(path,opt={}){
  const headers={"Content-Type":"application/json",...(opt.headers||{})};
  if(token())headers.Authorization="Bearer "+token();
  const r=await fetch(API+path,{...opt,headers}),d=await r.json();
  if(!r.ok)throw Error(d.message||"Request failed"); return d;
}

function Layout({children}){
 const u=user(),nav=useNavigate();
 const logout=()=>{localStorage.removeItem("q7token");localStorage.removeItem("q7user");nav("/login")};
 return <><header><h2>Q7 Shopping Cart</h2><nav>
 <Link to="/">Home</Link>{u?.role==="admin"&&<Link to="/admin">Admin</Link>}
 {u?.role==="user"&&<Link to="/shop">Shop</Link>}{u&&<Link to="/cart">Cart</Link>}
 {!u?<Link to="/login">Login</Link>:<button onClick={logout}>Logout</button>}
 </nav></header><main>{children}</main></>;
}

function Home(){return <div className="container"><h1>Shopping Cart</h1>
<p>MERN stack project with Admin site, User site, 2-level Category and Products.</p>
<p><Link to="/shop">Go to Shop</Link></p></div>}

function Login(){
 const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState("");
 const nav=useNavigate();
 async function submit(e){e.preventDefault();try{
  const d=await api("/login",{method:"POST",body:JSON.stringify({email,password})});
  localStorage.setItem("q7token",d.token);localStorage.setItem("q7user",JSON.stringify(d.user));
  nav(d.user.role==="admin"?"/admin":"/shop");
 }catch(e){setError(e.message)}}
 return <div className="container small"><h1>Login</h1><form className="box" onSubmit={submit}>
 <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)}/>
 <label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
 <button>Login</button>{error&&<p className="error">{error}</p>}
 <p>Admin: admin@gmail.com / admin123</p><p><Link to="/register">Create User Account</Link></p>
 </form></div>
}

function Register(){
 const[f,setF]=useState({name:"",email:"",password:""}),[msg,setMsg]=useState("");
 async function submit(e){e.preventDefault();try{await api("/register",{method:"POST",body:JSON.stringify(f)});
 setMsg("Registration successful. Now login.");setF({name:"",email:"",password:""})}catch(e){setMsg(e.message)}}
 return <div className="container small"><h1>Register</h1><form className="box" onSubmit={submit}>
 <label>Name</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
 <label>Email</label><input value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
 <label>Password</label><input type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
 <button>Register</button>{msg&&<p>{msg}</p>}</form></div>
}

function Admin(){
 const[cats,setCats]=useState([]),[name,setName]=useState(""),[parent,setParent]=useState("");
 const[products,setProducts]=useState([]),[msg,setMsg]=useState("");
 const[p,setP]=useState({name:"",price:"",image:"",category:"",subcategory:""});
 async function load(){try{setCats(await api("/categories"));setProducts(await api("/products"))}catch(e){setMsg(e.message)}}
 useEffect(()=>{load()},[]);
 const roots=cats.filter(c=>!c.parent),subs=cats.filter(c=>c.parent);
 const selectedSub=subs.filter(s=>String(s.parent)===String(p.category));
 async function addCat(e){e.preventDefault();try{await api("/categories",{method:"POST",body:JSON.stringify({name,parent:parent||null})});
 setName("");setParent("");load()}catch(e){setMsg(e.message)}}
 async function addProd(e){e.preventDefault();try{await api("/products",{method:"POST",body:JSON.stringify(p)});
 setP({name:"",price:"",image:"",category:"",subcategory:""});load()}catch(e){setMsg(e.message)}}
 async function delCat(id){if(confirm("Delete category?")){await api("/categories/"+id,{method:"DELETE"});load()}}
 async function delProd(id){if(confirm("Delete product?")){await api("/products/"+id,{method:"DELETE"});load()}}
 return <div className="container"><h1>Admin Site</h1>{msg&&<p className="error">{msg}</p>}<div className="two">
 <form className="box" onSubmit={addCat}><h2>Add Category</h2><label>Name</label>
 <input value={name} onChange={e=>setName(e.target.value)} required/><label>Parent</label>
 <select value={parent} onChange={e=>setParent(e.target.value)}><option value="">Main Category</option>
 {roots.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select><button>Add Category</button>
 <h3>Categories</h3>{roots.map(c=><div className="row" key={c._id}><b>{c.name}</b>
 <button type="button" onClick={()=>delCat(c._id)}>Delete</button><div className="sublist">
 {subs.filter(s=>String(s.parent)===String(c._id)).map(s=><div key={s._id}>- {s.name}
 <button type="button" onClick={()=>delCat(s._id)}>Delete</button></div>)}</div></div>)}</form>
 <form className="box" onSubmit={addProd}><h2>Add Product</h2>
 <label>Name</label><input value={p.name} onChange={e=>setP({...p,name:e.target.value})} required/>
 <label>Price</label><input type="number" value={p.price} onChange={e=>setP({...p,price:e.target.value})} required/>
 <label>Image URL</label><input value={p.image} onChange={e=>setP({...p,image:e.target.value})}/>
 <label>Category</label><select value={p.category} onChange={e=>setP({...p,category:e.target.value,subcategory:""})} required>
 <option value="">Select</option>{roots.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
 <label>Subcategory</label><select value={p.subcategory} onChange={e=>setP({...p,subcategory:e.target.value})}>
 <option value="">None</option>{selectedSub.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
 <button>Add Product</button></form></div>
 <div className="box"><h2>Products</h2><table><thead><tr><th>Name</th><th>Price</th><th>Category</th><th>Subcategory</th><th>Action</th></tr></thead>
 <tbody>{products.map(x=><tr key={x._id}><td>{x.name}</td><td>₹{x.price}</td><td>{x.category?.name}</td><td>{x.subcategory?.name||"-"}</td>
 <td><button onClick={()=>delProd(x._id)}>Delete</button></td></tr>)}</tbody></table></div></div>
}

function Shop(){
 const[cats,setCats]=useState([]),[products,setProducts]=useState([]),[cat,setCat]=useState(""),[sub,setSub]=useState(""),[msg,setMsg]=useState("");
 const roots=cats.filter(c=>!c.parent),subs=cats.filter(c=>c.parent&&String(c.parent)===String(cat));
 useEffect(()=>{api("/categories").then(setCats)},[]);
 useEffect(()=>{const q=cat?(sub?`?category=${cat}&subcategory=${sub}`:`?category=${cat}`):"";
 api("/products"+q).then(setProducts).catch(e=>setMsg(e.message))},[cat,sub]);
 function add(x){const c=JSON.parse(localStorage.getItem("q7cart")||"[]"),f=c.find(i=>i._id===x._id);
 if(f)f.qty++;else c.push({...x,qty:1});localStorage.setItem("q7cart",JSON.stringify(c));setMsg("Product added to cart")}
 return <div className="container"><h1>User Site - Products</h1><div className="filters">
 <select value={cat} onChange={e=>{setCat(e.target.value);setSub("")}}><option value="">All Categories</option>{roots.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select>
 <select value={sub} onChange={e=>setSub(e.target.value)}><option value="">All Subcategories</option>{subs.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
 {msg&&<p className="success">{msg}</p>}<div className="products">{products.map(x=><div className="product" key={x._id}>
 {x.image&&<img src={x.image} alt={x.name}/>}<h3>{x.name}</h3><p>₹{x.price}</p><p>{x.category?.name} / {x.subcategory?.name||"-"}</p>
 <button onClick={()=>add(x)}>Add to Cart</button></div>)}</div>{!products.length&&<p>No products found.</p>}</div>
}

function Cart(){
 const[cart,setCart]=useState(JSON.parse(localStorage.getItem("q7cart")||"[]"));
 function save(c){setCart(c);localStorage.setItem("q7cart",JSON.stringify(c))}
 function change(id,n){save(cart.map(x=>x._id===id?{...x,qty:Math.max(1,x.qty+n)}:x))}
 function remove(id){save(cart.filter(x=>x._id!==id))}
 const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
 return <div className="container"><h1>Shopping Cart</h1>{cart.map(x=><div className="cartrow" key={x._id}>
 <span><b>{x.name}</b> - ₹{x.price}</span><span><button onClick={()=>change(x._id,-1)}>-</button> {x.qty} <button onClick={()=>change(x._id,1)}>+</button></span>
 <button onClick={()=>remove(x._id)}>Remove</button></div>)}<h2>Total: ₹{total}</h2>{!cart.length&&<p>Cart is empty.</p>}</div>
}

function App(){return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/>
<Route path="/register" element={<Register/>}/><Route path="/admin" element={<Admin/>}/><Route path="/shop" element={<Shop/>}/>
<Route path="/cart" element={<Cart/>}/></Routes></Layout>}
createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
