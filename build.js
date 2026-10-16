const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content', 'articles');
const SITE = (process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://YOUR-NETLIFY-SITE.netlify.app').replace(/\/+$/, '');
const files = fs.existsSync(CONTENT) ? fs.readdirSync(CONTENT).filter(f => f.endsWith('.md')) : [];
const published = [];
function esc(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function slugify(s='') { return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function readPost(file) {
  const raw = fs.readFileSync(path.join(CONTENT,file),'utf8');
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return null;
  let data = yaml.load(m[1]) || {};
  data.body = m[2] || '';
  data.slug = slugify(data.slug || path.basename(file,'.md') || data.title);
  data.title = String(data.title || data.slug);
  data.description = String(data.description || '');
  data.category = String(data.category || 'Bridal Beauty');
  data.status = String(data.status || 'draft').toLowerCase();
  data.date = String(data.date || new Date().toISOString().slice(0,10)).slice(0,10);
  return data;
}
function template(post, bodyHtml) {
 const canonical = `${SITE}/${post.slug}.html`;
 const title = esc(post.seo_title || post.title);
 const desc = esc(post.seo_description || post.description).slice(0,320);
 const image = post.image ? `<figure class="article-hero"><img src="${esc(post.image)}" alt="${esc(post.image_alt || post.title)}" loading="eager"></figure>` : '';
 const article = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title} | Aisle &amp; Avenue</title>\n<meta name="description" content="${desc}">\n<link rel="canonical" href="${canonical}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:type" content="article">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,500;0,700;1,500&family=Figtree:wght@400;500;700;800&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n${header()}\n<main class="wrap page">\n<p class="crumbs"><a href="index.html">Home</a> / <a href="guides.html">Guides</a> / ${esc(post.category)}</p>\n<h1>${esc(post.title)}</h1><p class="meta">Published ${esc(post.date)} &middot; ${esc(post.category)}</p>\n${image}\n<article class="article-body">${bodyHtml}</article>\n<p><a href="guides.html">← Browse all guides</a></p>\n</main>\n${footer()}\n</body>\n</html>\n`;
 return article;
}
function header(){return `<header>\n  <div class="wrap bar">\n    <a href="index.html" class="logo" aria-label="Aisle &amp; Avenue home"><svg viewBox="0 0 44 52" aria-hidden="true"><path d="M3 50V22C3 10 11 2 22 2s19 8 19 20v28" fill="none" stroke="var(--brass)" stroke-width="2.2"/><path d="M9 50V23c0-9 5-15 13-15s13 6 13 15v27" fill="none" stroke="var(--brass)" stroke-width="1"/><text x="22" y="40" text-anchor="middle" font-size="28" font-style="italic" font-weight="500" fill="currentColor" style="font-family:var(--serif)">&amp;</text><path d="M1 50h42" stroke="var(--ink)" stroke-width="2"/></svg><span class="wm"><b>Aisle &amp; Avenue</b><small>BRIDAL BEAUTY GUIDES</small></span></a>\n    <button class="menu-btn" aria-expanded="false" aria-controls="nav-list" onclick="var l=document.getElementById('nav-list');var o=l.classList.toggle('open');this.setAttribute('aria-expanded',o)">Menu</button>\n    <nav aria-label="Main"><ul id="nav-list"><li><a href="guides.html">Guides</a></li><li><a href="how-much-does-bridal-makeup-cost.html">Costs</a></li><li><a href="index.html#timeline">Timeline</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul></nav>\n  </div>\n</header>`;}
function footer(){return `<footer><div class="wrap"><div class="foot"><a href="index.html" class="logo" aria-label="Aisle &amp; Avenue home"><svg viewBox="0 0 44 52" aria-hidden="true"><path d="M3 50V22C3 10 11 2 22 2s19 8 19 20v28" fill="none" stroke="var(--brass)" stroke-width="2.2"/><path d="M9 50V23c0-9 5-15 13-15s13 6 13 15v27" fill="none" stroke="var(--brass)" stroke-width="1"/><text x="22" y="40" text-anchor="middle" font-size="28" font-style="italic" font-weight="500" fill="currentColor" style="font-family:var(--serif)">&amp;</text><path d="M1 50h42" stroke="var(--ink)" stroke-width="2"/></svg><span class="wm"><b>Aisle &amp; Avenue</b><small>BRIDAL BEAUTY GUIDES</small></span></a><ul><li><a href="guides.html">Guides</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li><li><a href="privacy-policy.html">Privacy Policy</a></li><li><a href="disclaimer.html">Disclaimer</a></li></ul></div><p class="disclaimer">The content on this site is for general information only and is not medical or professional advice. Everyone's skin and hair are different, so patch-test products and speak with a qualified professional about any concerns. &copy; 2026 Aisle &amp; Avenue.</p></div></footer>`;}
for (const f of files) {
  const p = readPost(f); if (!p || p.status !== 'published') continue;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) { console.warn(`Skipping invalid slug in ${f}`); continue; }
  const html = marked.parse(p.body, {mangle:false, headerIds:false});
  fs.writeFileSync(path.join(ROOT, `${p.slug}.html`), template(p, html));
  published.push(p);
}
published.sort((a,b) => b.date.localeCompare(a.date));
const guidePath = path.join(ROOT,'guides.html');
let guides = fs.readFileSync(guidePath,'utf8');
const guideCards = published.map(p=>`<a href="${p.slug}.html" class="item"><span class="tag">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></a>`).join('');
const guideMarker = '<!-- CMS_ARTICLES -->';
if (guides.includes(guideMarker)) guides = guides.replace(guideMarker, guideCards); else guides = guides.replace('</div>\n</main>', `${guideMarker}${guideCards}</div>\n</main>`);
fs.writeFileSync(guidePath,guides);
const homePath = path.join(ROOT,'index.html');
let home = fs.readFileSync(homePath,'utf8');
const homeMarker = '<!-- CMS_HOME_ARTICLES -->';
const homeCards = published.slice(0,3).map(p=>`<a href="${p.slug}.html" class="item"><span class="tag">${esc(p.category)}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></a>`).join('');
if (home.includes(homeMarker)) home = home.replace(homeMarker, homeCards); else home = home.replace('      </div>\n    </div>\n  </div>\n</section>\n\n<section class="timeline"', `      </div>\n      ${homeMarker}${homeCards}\n    </div>\n  </div>\n</section>\n\n<section class="timeline"`);
fs.writeFileSync(homePath,home);
const smPath = path.join(ROOT,'sitemap.xml');
let sitemap = fs.readFileSync(smPath,'utf8').replace(/\n<!-- CMS_ARTICLES -->/g,'');
const sitemapEntries = published.map(p=>`<url><loc>${SITE}/${p.slug}.html</loc><lastmod>${esc(p.date)}</lastmod></url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${sitemapEntries ? '\n'+sitemapEntries+'\n' : ''}<!-- CMS_ARTICLES -->\n</urlset>`);
fs.writeFileSync(smPath,sitemap);
console.log(`Build complete. Generated ${published.length} published CMS article(s). Drafts remain unpublished.`);
