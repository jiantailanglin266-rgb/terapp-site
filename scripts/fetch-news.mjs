/* ============================================================
   TERAPP — 国内美容ニュースの自動取得（1日1件）
   Google ニュース RSS から美容関連の最新記事を1件取り込み、
   data/news.json へ追記する。GitHub Actions(cron) から実行。
   ※ 見出し・出典・公開日・元記事URLのみを保存（本文は転載しない）。
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const QUERY = '美容 OR コスメ OR スキンケア when:7d';
const FEED = 'https://news.google.com/rss/search?q=' + encodeURIComponent(QUERY) + '&hl=ja&gl=JP&ceid=JP:ja';
const DATA = 'data/news.json';
const MAX = 30;

function decode(s){
  return s.replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'')
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#0?39;/g,"'").replace(/&apos;/g,"'").replace(/&amp;/g,'&')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
}
function stripTags(s){ return decode(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
function tag(block, name){ const m = block.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)</'+name+'>')); return m ? m[1] : ''; }
function beautyRelevant(t){ return /(美容|コスメ|スキンケア|化粧|メイク|ヘアケア|エステ|ネイル|フェイス|美肌|肌)/.test(t); }

async function getFeed(url){
  const res = await fetch(url, { headers:{ 'User-Agent':'Mozilla/5.0 (compatible; TERAPP-news-bot)' } });
  if(!res.ok) throw new Error('feed HTTP '+res.status);
  const xml = await res.text();
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g; let m;
  while((m = re.exec(xml))){
    const b = m[1];
    let title   = stripTags(tag(b,'title'));
    const link  = decode(tag(b,'link')).trim();
    const pub   = decode(tag(b,'pubDate')).trim();
    const source= stripTags(tag(b,'source')) || 'Google ニュース';
    // Google ニュースは見出し末尾に「 - 媒体名」を付与するため除去
    if(source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3)).trim();
    let excerpt = stripTags(tag(b,'description'));
    if(excerpt === title) excerpt = '';
    excerpt = excerpt.slice(0, 110);
    if(title && link) items.push({ title, link, pub, source, excerpt });
  }
  return items;
}

async function main(){
  let store = { updated:'', items:[] };
  try{ const j = JSON.parse(readFileSync(DATA,'utf8')); if(Array.isArray(j.items)) store = j; }catch{}
  const seen = new Set(store.items.map(i => i.title));

  let candidates = [];
  try{ candidates = await getFeed(FEED); }
  catch(e){ console.error('fetch failed:', e.message); process.exit(0); }

  candidates.sort((a,b) => new Date(b.pub) - new Date(a.pub));
  const pick = candidates.find(c => beautyRelevant(c.title + ' ' + c.excerpt) && !seen.has(c.title));
  if(!pick){ console.log('no new beauty item today'); return; }

  let date = new Date().toISOString().slice(0,10);
  const pd = new Date(pick.pub);
  if(!isNaN(pd)) date = pd.toISOString().slice(0,10);
  store.items.unshift({
    date: date,
    title: pick.title,
    excerpt: pick.excerpt,
    source: pick.source,
    url: pick.link
  });
  store.items = store.items.slice(0, MAX);
  store.updated = new Date().toISOString();

  mkdirSync(dirname(DATA), { recursive:true });
  writeFileSync(DATA, JSON.stringify(store, null, 2) + '\n');
  console.log('added:', store.items[0].date, '/', store.items[0].source, '/', store.items[0].title);
}
main().catch(e => { console.error(e); process.exit(1); });
