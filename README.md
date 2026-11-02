# Penelope Sloan — CV site

Static site (`index.html`) plus one Netlify Function (`netlify/functions/chat.js`) that powers the "Ask about my experience" chat via Claude through Netlify AI Gateway.

## Deploy
1. Push this folder to a GitHub repo.
2. In Netlify: Add new site → Import from GitHub → pick the repo. No build command needed.
3. That's it — no API key needed. Netlify AI Gateway provides access to Claude automatically, and usage is billed to your Netlify account credits.

## Updating
Edit the design in the editor, re-export `index.html`, replace it here, and push.
