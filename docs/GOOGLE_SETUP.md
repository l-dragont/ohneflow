# Google Classroom setup
1. console.cloud.google.com -> new project -> **APIs & Services > Library** -> enable **Google Classroom API**.
2. **OAuth consent screen**: External, add app name, support email, and your domain. Add the three `classroom.*.readonly` scopes plus `openid` and `email`.
3. **Credentials > Create OAuth client ID > Web application**. Authorized redirect URIs:
   - `http://localhost:3000/api/integrations/google/callback`
   - `https://YOUR-APP.vercel.app/api/integrations/google/callback`
4. Put the client ID/secret in `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, and set `GOOGLE_REDIRECT_URI` to the matching URI.
5. Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32`.

**Testing vs public:** while the consent screen is in *Testing*, only test users you list (up to 100) can connect.
Classroom scopes are "sensitive", so letting any student connect requires Google's app verification (privacy policy,
domain, demo video). Many school Workspace domains also restrict third-party apps; an admin may need to allow it.
