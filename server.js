const http=require('http'),fs=require('fs'),path=require('path');
const TOKEN=process.env.BOT_TOKEN,GAME_URL=process.env.GAME_URL;
const API='https://api.telegram.org/bot'+TOKEN;
const ITEMS={s1:{t:'5 зіль',p:15},s2:{t:'200 золота',p:25},s3:{t:'Меч +2',p:50}};
async function tg(m,b){const r=await fetch(API+'/'+m,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})});return r.json();}
http.createServer(async(req,res)=>{
const u=new URL(req.url,'http://x');
res.setHeader('Access-Control-Allow-Origin','*');
if(u.pathname==='/invoice'){
const id=u.searchParams.get('item'),it=ITEMS[id];
res.setHeader('Content-Type','application/json');
if(!it){res.statusCode=404;return res.end('{}');}
const d=await tg('createInvoiceLink',{title:it.t,description:'Покупка в грі Північ',payload:id,currency:'XTR',prices:[{label:it.t,amount:it.p}]});
return res.end(JSON.stringify({link:d.result}));}
fs.readFile(path.join(__dirname,'index.html'),(e,b)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(b);});
}).listen(process.env.PORT||3000);
let offset=0;
(async function poll(){while(true){try{
const d=await tg('getUpdates',{offset,timeout:30,allowed_updates:['pre_checkout_query','message']});
for(const x of d.result||[]){offset=x.update_id+1;
if(x.pre_checkout_query)await tg('answerPreCheckoutQuery',{pre_checkout_query_id:x.pre_checkout_query.id,ok:true});
if(x.message&&x.message.text==='/start')await tg('sendMessage',{chat_id:x.message.chat.id,text:'Вітаю у грі Північ! Натисни кнопку, щоб грати.',reply_markup:{inline_keyboard:[[{text:'Грати',web_app:{url:GAME_URL}}]]}});
}}catch(e){await new Promise(r=>setTimeout(r,3000));}}})();
