# SCU Physical Plant Tracker

My Tracker, CAPEX Projects, and Weekly Tasks in one passcode-protected web app.
Static front end (`public/index.html`) + two Netlify Functions + Netlify Blobs for storage.

```
public/index.html            the app
public/robots.txt            keeps search engines out
netlify/functions/data.mjs   save / load / attachments (Netlify Blobs)
netlify/functions/claude.mjs relays AI requests so the API key stays on the server
netlify.toml                 build + security headers
package.json                 @netlify/blobs dependency
```

## First-time setup

1. **GitHub:** create a new **private** repository. Upload everything in this folder (keep the folder structure) and commit.
2. **Netlify:** Add new site → Import an existing project → GitHub → pick the repo. Leave the build settings as they come from `netlify.toml`, then deploy.
3. **Environment variables** (Site configuration → Environment variables), then redeploy:
   | Key | Value |
   |---|---|
   | `TRACKER_PASSCODE` | the passcode you'll type to unlock the app |
   | `ANTHROPIC_API_KEY` | your key from console.anthropic.com (only needed for the AI buttons) |
   | `CLAUDE_MODEL` | optional; defaults to `claude-haiku-5-5` (fast). `claude-sonnet-5-5` writes better analysis but may hit the function time limit |
4. **Site password (optional second layer):** Site configuration → Access & security → Password protection, if your plan includes it. Use a different password than `TRACKER_PASSCODE`.
5. Open the site, enter the passcode, and you're in.

Do not put the passcode in any file in this repo. It only lives in Netlify's environment variables.

## Moving your data over from Claude

1. In the Claude version, click **Download backup** (any tab). The file includes all three tabs and every attachment.
2. On the Netlify site, unlock, click **Restore backup**, and choose that file.

## Making changes later

Edit `public/index.html` (or ask Claude to), commit it to GitHub, and Netlify redeploys on its own in about a minute.
Your data is untouched by redeploys because it lives in the Blobs store `scu-tracker`, not in the code.

- Never rename the store in `data.mjs`; a new name means an empty tracker.
- If a change goes wrong: Netlify → Deploys → pick the last good deploy → Publish deploy. Data is unaffected.
- Take a **Download backup** now and then, and before big changes.

## Good to know

- **Lock** (top right) forgets the passcode on that device. Uncheck "Remember on this device" on shared computers.
- Wrong passcodes get a 1-second delay on the server to slow down guessing.
- If you open the tracker on two devices at once, the last one to save wins. Refresh when switching devices.
- AI buttons: Netlify functions have a time limit. If you see "Claude took too long," try again or use fewer items.
- Attachments are capped at 3 MB each.
