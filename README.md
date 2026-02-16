# ng-diagram-demo — GitHub Pages deployment

This branch contains the built output of the ng-diagram demo app, served via GitHub Pages.

## How to update the hosted demo

1. **Make your changes on `main`** and commit them.

2. **Build the app** with the GitHub Pages base href:

   ```bash
   ng build --base-href /ng-diagram-demo/
   ```

   The output will be in `dist/ng-diagram-meetup-demo/browser/`.

3. **Switch to `gh-pages`**:

   ```bash
   git checkout gh-pages
   ```

4. **Replace the old build files** with the new ones:

   ```bash
   # Remove the old JS bundle (filename includes a hash, so it changes between builds)
   git rm main-*.js

   # Copy all new build output into the root
   cp dist/ng-diagram-meetup-demo/browser/* .

   # Copy index.html to 404.html so client-side routing works
   cp index.html 404.html
   ```

5. **Commit and push**:

   ```bash
   git add -A
   git commit -m "Deploy latest changes to GitHub Pages"
   git push origin gh-pages
   ```

6. **Switch back to `main`**:

   ```bash
   git checkout main
   ```

GitHub Pages will pick up the new commit automatically. The update is usually live within a minute.
