# BathAtlas routing update

Routes:

- `/` renders the original `BathymetryCatalog` / `BathymetryViewer` full-screen explorer.
- `/about`, `/data-sources`, `/contact` share `components/layout/AppLayout.tsx`.
- Other routes render `NotFound` in the informational layout.

The existing `BrowserRouter` in `main.tsx` is unchanged. The former duplicate
`components/layout/Footer.tsx` was removed: both layouts use `DashboardFooter`.
`BathAtlasBrand` and `DashboardFooter` use React Router links, avoiding full reloads.

Contact: optionally set `VITE_CONTACT_EMAIL` in the frontend `.env` file to
publish a contact address. Without it, the contact page will show an honest
pre-launch message rather than a broken or fabricated email.

For a Vite SPA deployed behind Nginx, ensure deep links fall back to `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Preserve any dedicated API and raster-data proxy locations.
