# Contact Form with GitHub Storage

A contact/membership form that stores submissions directly to a private GitHub repository CSV file. The form is designed to be embedded in a Jimdo website via iframe and hosted on Vercel.

## Quick Overview

1. **Deploy to Vercel** - Frontend (form) + Backend (API) hosted together
2. **Configure GitHub token** - Allows API to write to your private repository
3. **Embed in Jimdo** - Add iframe pointing to your Vercel URL
4. **Done!** - Form submissions automatically save to `members.csv`

## Features

- ✅ Clean, responsive contact form in German
- ✅ Stores data directly to `members.csv` in a private GitHub repository
- ✅ Serverless backend (Vercel)
- ✅ Frontend and backend on the same domain (simplified architecture)
- ✅ CORS-enabled for iframe embedding
- ✅ Form validation
- ✅ Loading states and success/error messages
- ✅ No GitHub Pages needed - deploy once to Vercel!

## Project Structure

```
contact-form/ (GitHub → Vercel)
├── index.html          # Main form page (served by Vercel)
├── styles.css          # Form styling
├── script.js           # Form submission logic
├── api/
│   └── submit.js       # Serverless function for GitHub API
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── README.md           # This file

member-list/ (Private Repository)
├── members.csv         # Member data storage
└── .github/
    └── workflows/
        └── add-member.yml  # GitHub Actions workflow (optional/unused)
```

## Setup Instructions

**Prerequisites:**
- Both `contact-form` and `member-list` repositories pushed to GitHub
- The `member-list` repository must be **private** (Settings → Danger Zone → Change visibility)

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Contact Form API"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login via Github User
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Find and select your `contact-form` repository from the list
5. Leave all settings as default (Vercel will auto-detect the configuration from `vercel.json`)
6. Click "Deploy" (don't add environment variables yet - we'll do that next)
7. Wait for the deployment to complete
8. **Copy your deployment URL** (e.g., `https://contact-form-xyz.vercel.app`) - you'll need this later

### 3. Configure Environment Variables in Vercel

1. In your Vercel dashboard, click on your `contact-form` project
2. Go to the **Settings** tab (top navigation bar)
3. Click **Environment Variables** in the left sidebar
4. Add the first variable:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** Paste your personal access token from step 1
   - **Environment:** Check all boxes (Production, Preview, Development)
   - Click **Save**

5. Add the second variable:
   - **Key:** `REPO_OWNER`
   - **Value:** Your GitHub username (e.g., `johnsmith`)
   - **Environment:** Check all boxes (Production, Preview, Development)
   - Click **Save**

6. Redeploy to apply the changes:
   - Go to the **Deployments** tab
   - Find the most recent deployment
   - Click the **three dots (⋯)** menu → **Redeploy**
   - Select **Use existing Build Cache**
   - Click **Redeploy**
   - Wait for redeployment to complete

### 4. Embed in Jimdo Website

Your form is now live on Vercel! Simply embed it in your Jimdo page:

```html
<iframe
  src="https://your-project.vercel.app/"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; max-width: 800px; margin: 0 auto; display: block;">
</iframe>
```

**Replace `your-project.vercel.app` with your actual Vercel deployment URL from step 2.**

**Note:** The form and API are both on the same Vercel domain, so no GitHub Pages setup is needed!

## How It Works

1. **User visits your Jimdo website** with the embedded Vercel iframe
2. **User fills out the form** (served from Vercel)
3. **Form submits data** to the Vercel serverless function (`/api/submit`)
4. **Serverless function**:
   - Validates the data
   - Uses GitHub API to fetch current `members.csv`
   - Appends new member data as a CSV row
   - Commits the updated file back to the private `member-list` repository
5. **User receives confirmation** message

**Architecture:** Vercel hosts both the form (HTML/CSS/JS) and the backend API, making it simple and efficient!

## Security Considerations

- ✅ GitHub token is stored securely in Vercel environment variables
- ✅ Token is never exposed to the client
- ✅ The `member-list` repository remains private
- ✅ CORS is enabled only for form submission
- ⚠️ Consider adding rate limiting for production use
- ⚠️ Consider adding spam protection (e.g., reCAPTCHA)

## Customization

### Update Form Fields

Edit `index.html` to add/remove fields, then update:
- `script.js` - form data collection
- `api/submit.js` - CSV row construction
- `members.csv` - header row

### Change Styling

Edit `styles.css` to customize colors, fonts, and layout.

### Restrict CORS to Jimdo Domain

In `api/submit.js`, replace:
```javascript
'Access-Control-Allow-Origin': '*'
```

With:
```javascript
'Access-Control-Allow-Origin': 'https://your-jimdo-site.jimdosite.com'
```

## Testing Locally (Optional - Advanced Users)

If you want to test the serverless function on your local machine before deploying:

1. Install [Vercel CLI](https://vercel.com/cli): `npm install -g vercel`
2. Navigate to the contact-form directory
3. Install dependencies: `npm install`
4. Create a `.env` file with your credentials (copy from `.env.example` and fill in values)
5. Run local dev server: `vercel dev`
6. Visit `http://localhost:3000` to test the form

**Note:** For most users, testing directly on the Vercel deployment URL is sufficient. You can test the live form immediately after deployment.

## Troubleshooting

### How to Check Vercel Logs

To view errors and debug issues:
1. Go to your Vercel dashboard
2. Click on your `contact-form` project
3. Go to the **Logs** tab
4. Filter by "Errors" to see only errors
5. Click on a log entry to see full details

### Form submission fails
- Check that environment variables are set correctly in Vercel (Settings → Environment Variables)
- Verify GitHub token has `repo` scope
- Check Vercel function logs (see above) for specific error messages
- Make sure you redeployed after adding environment variables

### CORS errors in iframe
- Ensure `Access-Control-Allow-Origin` is set to `*` or your Jimdo domain in `api/submit.js`
- Check that Vercel deployment was successful
- Check browser console for specific CORS error messages

### Data not appearing in CSV
- Check that `members.csv` exists in the `member-list` repository
- Verify GitHub token has write permissions (needs `repo` scope)
- Check Vercel function logs for GitHub API errors
- Verify `REPO_OWNER` environment variable matches your GitHub username exactly

## Alternative: GitHub Actions Method

If you prefer not to use Vercel, you can use GitHub Actions:

1. The workflow in `member-list/.github/workflows/add-member.yml` can be triggered via GitHub API
2. Update `api/submit.js` to trigger the workflow instead of directly committing
3. This requires different API calls but keeps everything within GitHub

## Support

For issues or questions:
1. Check Vercel function logs
2. Check GitHub Actions logs (if using that method)
3. Verify all environment variables are set correctly

## License

See LICENSE file for details.
