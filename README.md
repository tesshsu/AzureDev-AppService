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

### Create a new App Service plain and check log
- $ az appservice plan create \
  --name ASP-Aili-DevAppService \
  --resource-group Aili \
  --location westeurope \
  --sku F1

- $ az webapp create \
  --name AiliDevAppService \
  --resource-group Aili \
  --plan ASP-Aili-DevAppService \
  --runtime "NODE|14-lts"

- $ az webapp log tail --name AiliDevAppService --resource-group Aili

