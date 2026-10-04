import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (url && key) ? createClient(url,key) : null;

let products=[], cart=JSON.parse(localStorage.getItem('ccshoppingmail_cart')||'[]'), category='All';

const demo=[
{id:'demo-1',name:'CCshoppingmail Pearl Studs',price:38,category:'Jewelry',description:'Minimal freshwater pearl earrings.',image_url:''},
{id:'demo-2',name:'Sculpted Gold Ring',price:46,category:'Jewelry',description:'A polished everyday statement ring.',image_url:''},
{id:'demo-3',name:'Silk Glow Lip Oil',price:24,category:'Beauty',description:'Lightweight shine with a soft finish.',image_url:''},
{id:'demo-4',name:'Soft Veil Blush',price:29,category:'Beauty',description:'Buildable color for an effortless look.',image_url:''},
{id:'demo-5',name:'Celeste Pendant',price:52,category:'Jewelry',description:'A delicate everyday pendant.',image_url:''}
];

async function loadProducts(){
  if(!supabase){products=demo; render(); return;}
  const {data,error}=await supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:false});
  products=error?demo:(data||[]);
  render();
  supabase.channel('products-live').on('postgres_changes',{event:'*',schema:'public',table:'products'},loadProducts).subscribe();
}
function money(n){return '$'+Number(n).toFixed(2)}
function save(){localStorage.setItem('ccshoppingmail_cart',JSON.stringify(cart))}
function add(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();openCart()}
function change(id,d){let x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<1)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function render(){
 const q=(document.querySelector('#search')?.value||'').toLowerCase();
 const list=products.filter(p=>(category==='All'||p.category===category)&&(`${p.name} ${p.description||''}`).toLowerCase().includes(q));
 document.querySelector('#products').innerHTML=list.map(p=>`<article class="card"><div class="photo">${p.image_url?`<img src="${p.image_url}" alt="">`:`<span>${p.category}</span>`}</div><small>${p.category}</small><h3>${p.name}</h3><p>${p.description||''}</p><b>${money(p.price)}</b><button onclick="window.addProduct('${p.id}')">ADD TO BAG</button></article>`).join('')||'<p>No products found.</p>';
 document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat===category));
}
function renderCart(){
 let sum=0,count=0;
 document.querySelector('#cartItems').innerHTML=cart.map(i=>{let p=products.find(x=>x.id===i.id);if(!p)return '';sum+=p.price*i.qty;count+=i.qty;return `<div class="cartrow"><div><b>${p.name}</b><br><small>${money(p.price)} × ${i.qty}</small></div><div><button onclick="window.changeQty('${p.id}',-1)">−</button> ${i.qty} <button onclick="window.changeQty('${p.id}',1)">+</button></div></div>`}).join('')||'<p>Your bag is empty.</p>';
 document.querySelector('#subtotal').textContent=money(sum);document.querySelector('#count').textContent=count;
}
function openCart(){document.querySelector('#drawer').classList.add('open')}
function closeCart(){document.querySelector('#drawer').classList.remove('open')}
async function checkout(){
 if(!cart.length)return alert('Your bag is empty.');
 if(!supabase)return alert('Demo mode. Connect Supabase to accept real orders.');
 const email=prompt('Enter your email for the order:'); if(!email)return;
 const items=cart.map(i=>({product_id:i.id,quantity:i.qty}));
 const total=cart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0);
 const {error}=await supabase.from('orders').insert({customer_email:email,items,total,status:'pending'});
 if(error) alert(error.message); else {cart=[];save();renderCart();closeCart();alert('Order created. A real payment provider should be connected before launch.');}
}
function admin(){
 const p=location.pathname;
 if(p==='/admin') location.href='/admin.html';
}
document.querySelector('#app').innerHTML=`<div class="top">FREE SHIPPING ON ORDERS OVER $75</div><nav><div class="logo">CCshoppingmail</div><div class="links"><a href="#shop">SHOP</a><a onclick="window.setCat('Jewelry')">JEWELRY</a><a onclick="window.setCat('Beauty')">BEAUTY</a><a href="/admin.html">ADMIN</a></div><div class="navright"><input id="search" placeholder="Search" oninput="render()"><button onclick="openCart()">Bag (<span id="count">0</span>)</button></div></nav><header><div><small>BEAUTY • JEWELRY • EVERYDAY LUXURY</small><h1>Quietly iconic.</h1><p>Curated pieces designed for everyday.</p><a class="cta" href="#shop">SHOP THE COLLECTION</a></div></header><main id="shop"><div class="head"><div><small>THE COLLECTION</small><h2>New arrivals</h2></div><div><button class="cat active" data-cat="All" onclick="window.setCat('All')">All</button><button class="cat" data-cat="Jewelry" onclick="window.setCat('Jewelry')">Jewelry</button><button class="cat" data-cat="Beauty" onclick="window.setCat('Beauty')">Beauty</button></div></div><section id="products" class="grid"></section></main><footer><b>CCshoppingmail</b><span>Shipping · Returns · Contact · Order Tracking</span></footer><aside id="drawer"><button onclick="closeCart()">×</button><h2>Your bag</h2><div id="cartItems"></div><hr><div class="total"><b>Subtotal</b><b id="subtotal">$0.00</b></div><button class="checkout" onclick="checkout()">CHECKOUT</button></aside>`;

window.addProduct=add; window.changeQty=change; window.setCat=(x)=>{category=x;render()};
loadProducts();renderCart();