 # 🚀 AzureDev-AppService

This repository is for **practicing deployment to Azure Kubernetes Service (AKS)** and Azure App Service using GitHub Actions CI/CD.  
It supports both traditional web app deployment (App Service) and containerized Kubernetes deployment (AKS + Helm).


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

---

## 🛠 Environments

| Branch | Deployment Target | Description |
|--------|-------------------|-------------|
| `main` | Azure App Service | Traditional PaaS for simple Node.js apps |
| `dev`  | Azure Kubernetes Service (AKS) | Containerized app deployed via Helm |

✔️ Push to `main` → Deploys ZIP to Azure Web App  
✔️ Push to `dev` → Builds Docker image → Pushes to ACR → Deploys to AKS via Helm

---

## 🧰 Setup Instructions

### 🔧 1. Create Azure Resource Group

```bash
az group create --name Aili --location westeurope
```

###  📦 2. Create Azure Container Registry (ACR)
```bash
az acr create \
  --name ailidevacr \
  --resource-group Aili \
  --sku Basic \
  --location westeurope \
  --admin-enabled true
```

### ☸️ 3. Create Azure Kubernetes Cluster (AKS)
```bash
az aks create \
  --resource-group Aili \
  --name AiliDevAKS \
  --node-count 1 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys \
  --enable-managed-identity \
  --attach-acr ailidevacr \
  --location westeurope
```

### 🔐 4. Set GitHub Secrets 
```bash
az acr credential show --name ailidevacr
```
- ACR_USERNAME
- ACR_PASSWORD

### ⚙️ GitHub Actions CI/CD

📂 Path: .github/workflows/deploy.yml
✅ main branch
Installs dependencies

Zips source code

Deploys ZIP to Azure Web App

✅ dev branch
Sets NODE_ENV=development

Builds Docker image using Dockerfile

Pushes to ACR (ailidevacr.azurecr.io)

Deploys to AKS using helm upgrade --install with values from helm/myapp/

### 📦 Helm Deployment ( optional run in local to see if helm working )
Helm charts are located in helm/myapp/. When deployed via GitHub Actions or manually:

```bash
helm upgrade --install myapp ./helm/myapp \
  --set image.repository=ailidevacr.azurecr.io/myapp \
  --set image.tag=<your-image-tag>
```

### 🔍 Validate Deployment

```bash
az aks get-credentials --resource-group Aili --name AiliDevAKS

kubectl get pods
kubectl get svc
```


