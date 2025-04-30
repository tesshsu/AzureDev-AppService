 # 🚀 AzureDev-AppService

This repository is for **practicing deployment to Azure Kubernetes Service (AKS)** and Azure App Service using GitHub Actions CI/CD.  
It supports both traditional web app deployment (App Service) and containerized Kubernetes deployment (AKS + Helm).


 ## Project Structure
 ```
 AzureDev-AppService/
 ├── public/index.html            # Static files (e.g., index.html)
 ├── src/                # Source code for Node.js/Express API (to be added later)
 ├── argocd/            # GitOpt ArgoCD
 │   └── app-of-apps.yaml
 ├── helm/                 # Helm charts directory
 │   ├── Chart.yaml
 │   ├── values.yaml
 │   └── templates/  
 │   │   └── deployment.yaml 
 │   │   └── service.yaml   # Kubernetes manifests
 ├── .github/            # GitHub Actions workflows
 │   └── workflows/
 ├── README.md
 ├── package-lock.json
 ├── package.json
 ├── Dockerfile           # Containerization
 ├── Jenkinsfile
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
az group create --name <Resource group Name> --location <Location>
```

###  📦 2. Create Azure Container Registry (ACR)
```bash
az acr create \
  --name <ACR name> \
  --resource-group <Resource group Name> \
  --sku Basic \
  --location <Location> \
  --admin-enabled true
```

### ☸️ 3. Create Azure Kubernetes Cluster (AKS)
```bash
az aks create \
  --resource-group <Resource group Name> \
  --name <AKS Name> \
  --node-count 1 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys \
  --enable-managed-identity \
  --attach-acr <ACR name> \
  --location <Location>
```

### 🔐 4. Set GitHub Secrets 
```bash
az acr credential show --name <ACR name>
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

Pushes to ACR (<ACR name>.azurecr.io)

Deploys to AKS using helm upgrade --install with values from helm/myapp/

### 📦 Helm Deployment ( optional run in local to see if helm working )
Helm charts are located in helm/myapp/. When deployed via GitHub Actions or manually:

```bash
helm upgrade --install myapp ./helm/myapp \
  --set image.repository=<ACR name>.azurecr.io/myapp \
  --set image.tag=<your-image-tag>
```

### 🔍 Validate Deployment once updated code by AZ cli

Test first in local

```bash
# Build the Docker image
docker build -t azuredev-appservice:latest .

# Run locally to test (if no other container running on 8080)
docker run -p 8080:8080 azuredev-appservice:latest

# Test in browser or curl
curl http://localhost:8080

```

Login to Azure & Get AKS Credentials

```bash
az login
az aks get-credentials --resource-group <Resource group Name> --name <AKS Name>

```

Push Updated Docker Image to ACR

```bash
# Tag with ACR repo name
docker tag azuredev-appservice:latest <ACR name>.azurecr.io/azuredev-appservice:latest

# Push to ACR
docker push <ACR name>.azurecr.io/azuredev-appservice:latest
```

Deploy to AKS via Helm

```bash
helm upgrade --install azuredev-appservice ./helm/myapp -n dev
```

Check Logs / Test Live Endpoint
```bash
# To get external ip
kubectl get svc -n dev
# Replace with actual pod name if needed
kubectl logs -f <pod-name> -n dev

# Or quick lookup:
kubectl logs -l app=azuredev-appservice -n dev

# Open service EXTERNAL-IP in browser
http://<EXTERNAL-IP>/

```

### Bonus : using GitOpt ArgoCD

```bash
# Connect to your AKS cluster
az aks get-credentials --resource-group <Resource group Name> --name <AKS Name> --admin

# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Verify ArgoCD is running
kubectl get pods -n argocd
```

- Once ArgoCD is installed on AKS cluster, deploy.yml could proceed by appliying argocd/app-of-apps.yaml by commit push to dev
- Go to dashboard ArgoCD 

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```
- Go to http://localhost:8081

- Find your login pwd by follow: user admin
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```