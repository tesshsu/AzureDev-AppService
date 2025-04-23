 This repository is for practicing deployment to Azure K8 Service.

 ## Project Structure
 ```
 AzureDev-AppService/
 ├── public/index.html            # Static files (e.g., index.html)
 ├── src/                # Source code for Node.js/Express API (to be added later)
 ├── helm/                 # Helm charts directory
 │   ├── Chart.yaml
 │   ├── values.yaml
 │   └── templates/       # Kubernetes manifests
 ├── .github/            # GitHub Actions workflows
 │   └── workflows/
 ├── README.md
 ├── package-lock.json
 ├── package.json
 ├── Dockerfile           # Containerization
 └── server.js
 ```

## 🛠 Environments

| Branch | Deployment Target | Description |
|--------|-------------------|-------------|
| `main` | Azure Web App     | Traditional PaaS (static + server) |
| `dev`  | Azure Kubernetes Service (AKS) | Containerized microservice with Helm |

Push to `main` 👉 deploys to App Service  
Push to `dev` 👉 builds Docker image → pushes to ACR → deploys to AKS via Helm


### 🌐 Deploy to Azure App Service (via CLI)
🔧 1. Create Resource Group (if not already created)


###  🔁 GitHub Actions CI/CD
Whenever you push to main, GitHub Actions automatically:

Installs dependencies (npm install)

Zips your project (including server.js, public/, etc.)

Deploys to Azure Kubernete

