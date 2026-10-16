AISLE & AVENUE — ADMIN CMS SETUP
================================

WHAT THIS ADDS
- /admin/ dashboard powered by Decap CMS
- Article create/edit/delete, Markdown body, featured image, SEO title/description
- Draft/published status
- Build script that creates slug.html pages for published CMS articles and updates guides.html, index.html and sitemap.xml
- Existing HTML pages and CSS are preserved

IMPORTANT LIMITATION
The admin cannot work securely from a ZIP-only manual deploy by itself. The site needs a Git repository and a configured CMS authentication backend. This starter uses Decap CMS Turbo GitHub backend. Configure the repository and Decap Turbo Site ID as described below; do not publish the placeholder config.

SETUP STEPS
1. Extract this ZIP into a folder on your computer.
2. Create a GitHub account if you do not have one.
3. Create a NEW empty GitHub repository (recommended private), e.g. aisle-and-avenue. Do not initialize it with a README/license because this folder already contains files.
4. For the turbo-github backend, set the repository in the Decap Turbo dashboard to aa1376254-bit/AisleandAvenue-Site. The backend repository is managed by Turbo; do not rely on a local repo field.
5. Create a Decap Turbo organization, connect GitHub, and create a Turbo site for aa1376254-bit/AisleandAvenue-Site. Add your exact Netlify admin URL (https://YOUR-SITE-NAME.netlify.app/admin/) to the site’s Admin interface URLs. Copy the UUID from the Turbo site Overview tab and replace YOUR_DECAP_TURBO_SITE_ID in admin/config.yml. Do NOT use the Netlify Project ID here. See https://decapcms.org/docs/turbo-getting-started/ and https://decapcms.org/docs/turbo-connecting-a-site/.
6. Install Node.js LTS from https://nodejs.org/ if not already installed.
7. In a terminal opened in this folder, run:
   npm install
   npm run build
   This first build should succeed and should generate zero new article pages.
8. Push the whole folder to GitHub. Example commands from this folder:
   git init
   git branch -M main
   git add .
   git commit -m "Add CMS admin publishing"
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
9. In Netlify, connect your EXISTING site to that GitHub repository via Site configuration / Build & deploy / Continuous deployment / Link repository (wording can vary). Set build command `npm run build` and publish directory `.`. Ensure Netlify installs dependencies from package.json.
10. Replace YOUR-NETLIFY-SITE in admin/config.yml with the actual subdomain label, redeploy, then open https://YOUR-SITE-NAME.netlify.app/admin/ . Sign in using the Decap Turbo authentication flow. Only give repository write access to trusted admins.
11. Create an article. Set Status = draft to keep it off the public site; choose published to show it. Save/publish and wait for Netlify's build to complete.

ARTICLE RULES
- Slug should contain lowercase letters, numbers and hyphens only, e.g. bridal-makeup-checklist.
- Published article canonical URLs use Netlify’s URL environment variable during builds. For local builds, replace the fallback YOUR-NETLIFY-SITE with your real Netlify subdomain in scripts/build.js.
- Upload images through the editor; images are stored in assets/images.
- Existing four hand-written guide cards remain as they are; new CMS articles are appended to the guides list and up to three newest CMS articles appear on the homepage.
- Delete in CMS removes the Markdown source; generated HTML will disappear on the next successful build. If a generated HTML page was previously deployed, the build deploy should remove it because publish directory is rebuilt from the repository.
- This is a Git-based CMS: edits commit to GitHub and Netlify rebuilds the static site. No passwords or secret keys belong in config.yml.

TROUBLESHOOTING
- If admin reports repo/auth errors, verify repository path and site ID, and confirm the Decap Turbo backend/auth is available for the account/site.
- If Netlify says no build command, set `npm run build` and publish directory `.`.
- Do not use a plain client-side password check as admin security; it can be bypassed.
