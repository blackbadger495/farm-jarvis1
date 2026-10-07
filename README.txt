FARM J.A.R.V.I.S. - HOSTING GUIDE (c) Junior Keche. All rights reserved.

FILES (keep this structure):
  index.html, manifest.webmanifest, sw.js, netlify.toml
  icons/ (3 PNG files)
  netlify/functions/ask.js   <- the AI brain (runs on the server)
  netlify/functions/weather.js <- weather backup route (no key needed)

STEP 1 - PUT THE FOLDER ON GITHUB
  Create a free GitHub account, make a new repository, upload ALL files
  and folders exactly as they are.

STEP 2 - DEPLOY ON NETLIFY (free plan is enough to start)
  Netlify > Add new site > Import from GitHub > pick the repository > Deploy.
  (Plain drag-and-drop may skip the AI function, so use GitHub.)

STEP 3 - ADD YOUR AI KEY
  Get an API key at console.anthropic.com (API usage is paid per question).
  Netlify > Site settings > Environment variables > add:
     ANTHROPIC_API_KEY = your key
  (Optional) CLAUDE_MODEL = a model name, to change cost or quality.
  Then Deploys > Trigger deploy > Deploy site.
  In the Anthropic console set a monthly spend limit so costs stay small.

STEP 4 - INSTALL ON A PHONE
  Open the https link. Android Chrome: Install app button in More.
  iPhone Safari: Share > Add to Home Screen.

NOTES
  - Never put your API key inside index.html. Only in Netlify settings.
  - Anyone with the link can use your AI and use up your credit. For
    a class project, share the link only with trusted people.
  - Records and accounts are stored on each phone only.
  - After editing files, change CACHE in sw.js (v4 -> v5) so phones update.
