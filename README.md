 This repository is for practicing deployment to Azure App Service. It starts with a simple static web app and will later include a Node.js Express API for CI/CD practice.

 ## Project Structure
 ```
 AzureDev-AppService/
 ├── public/             # Static files (e.g., index.html)
 ├── src/                # Source code for Node.js/Express API (to be added later)
 ├── .github/            # GitHub Actions workflows
 │   └── workflows/
 ├── README.md
 └── (other files to be added: package.json, server.js, etc.)
 ```

 ## Initial Setup
 $ mkdir -p public src .github/workflows
 - The `public/` directory contains static files like `index.html`.
 - Later, `src/` will hold the Express.js API code, and `server.js` will serve both the API and static files.
