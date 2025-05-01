🚀 AzureDev-AppService
This repository is for practicing deployment to Azure Kubernetes Service (AKS) and Azure App Service using GitHub Actions CI/CD.It supports both traditional web app deployment (App Service) and containerized Kubernetes deployment (AKS + Helm).
Project Structure
AzureDev-AppService/
├── public/index.html            # Static files (e.g., index.html)
├── src/                         # Source code for Node.js/Express API (to be added later)
├── argocd/                      # GitOps ArgoCD
│   └── app-of-apps.yaml
├── helm/                        # Helm charts directory
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/  
│       └── deployment.yaml 
│       └── service.yaml         # Kubernetes manifests
├── ansible/                     # Ansible playbooks for monitoring setup
│   ├── install_prometheus_grafana.yml
│   └── prometheus-values.yml
├── .github/                     # GitHub Actions workflows
│   └── workflows/
├── README.md
├── package-lock.json
├── package.json
├── Dockerfile                   # Containerization
├── Jenkinsfile
└── server.js


🛠 Environments



Branch
Deployment Target
Description



main
Azure App Service
Traditional PaaS for simple Node.js apps


dev
Azure Kubernetes Service (AKS)
Containerized app deployed via Helm


✔️ Push to main → Deploys ZIP to Azure Web App✔️ Push to dev → Builds Docker image → Pushes to ACR → Deploys to AKS via Helm

🧰 Setup Instructions
🔧 1. Create Azure Resource Group
az group create --name <Resource group Name> --location <Location>

📦 2. Create Azure Container Registry (ACR)
az acr create \
  --name <ACR name> \
  --resource-group <Resource group Name> \
  --sku Basic \
  --location <Location> \
  --admin-enabled true

☸️ 3. Create Azure Kubernetes Cluster (AKS)
az aks create \
  --resource-group <Resource group Name> \
  --name <AKS Name> \
  --node-count 1 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys \
  --enable-managed-identity \
  --attach-acr <ACR name> \
  --location <Location>

🔐 4. Set GitHub Secrets
az acr credential show --name <ACR name>


ACR_USERNAME
ACR_PASSWORD

⚙️ GitHub Actions CI/CD
📂 Path: .github/workflows/deploy.yml✅ main branch  

Installs dependencies  
Zips source code  
Deploys ZIP to Azure Web App

✅ dev branch  

Sets NODE_ENV=development  
Builds Docker image using Dockerfile  
Pushes to ACR (<ACR name>.azurecr.io)  
Deploys to AKS using helm upgrade --install with values from helm/myapp/

📦 Helm Deployment (optional: run locally to test Helm)
Helm charts are located in helm/myapp/. When deployed via GitHub Actions or manually:
helm upgrade --install myapp ./helm/myapp \
  --set image.repository=<ACR name>.azurecr.io/myapp \
  --set image.tag=<your-image-tag>

🔍 Validate Deployment Once Updated Code (Using AZ CLI)
Test First in Local
# Build the Docker image
docker build -t azuredev-appservice:latest .

# Run locally to test (if no other container running on 8080)
docker run -p 8080:8080 azuredev-appservice:latest

# Test in browser or curl
curl http://localhost:8080

Login to Azure & Get AKS Credentials
az login
az aks get-credentials --resource-group <Resource group Name> --name <AKS Name>

Push Updated Docker Image to ACR
# Tag with ACR repo name
docker tag azuredev-appservice:latest <ACR name>.azurecr.io/azuredev-appservice:latest

# Push to ACR
docker push <ACR name>.azurecr.io/azuredev-appservice:latest

Deploy to AKS via Helm
helm upgrade --install azuredev-appservice ./helm/myapp -n dev

Check Logs / Test Live Endpoint
# To get external IP
kubectl get svc -n dev

# Replace with actual pod name if needed
kubectl logs -f <pod-name> -n dev

# Or quick lookup:
kubectl logs -l app=azuredev-appservice -n dev

# Open service EXTERNAL-IP in browser
http://<EXTERNAL-IP>/


📊 Monitoring with Prometheus and Grafana
1. Add Ansible Playbooks for Prometheus and Grafana Installation
The Ansible playbooks for installing Prometheus and Grafana are located in the ansible/ directory:

ansible/install_prometheus_grafana.yml: Installs Prometheus and Grafana on AKS.
ansible/prometheus-values.yml: Custom values for Prometheus configuration.

2. Install Ansible to Run the Playbook
Install Ansible on your local machine (e.g., on macOS using Homebrew):
brew install ansible

Verify the installation:
ansible --version

3. Run the Ansible Playbook to Install Prometheus and Grafana
Ensure you’re connected to your AKS cluster:
az aks get-credentials --resource-group <Resource group Name> --name <AKS Name>

Run the playbook:
cd AzureDev-AppService
ansible-playbook ansible/install_prometheus_grafana.yml

This playbook:

Creates a monitoring namespace.
Installs Prometheus and Grafana using Helm charts.
Configures Prometheus to scrape the azuredev-appservice application.

4. Check Pods in the monitoring Namespace
Verify that Prometheus and Grafana pods are running:
kubectl get pods -n monitoring

Expected output:
NAME                                 READY   STATUS    RESTARTS   AGE
prometheus-server-abc-123            1/1     Running   0          5m
grafana-xyz-456                      1/1     Running   0          5m

5. Find Prometheus and Grafana Services and Check Logs
Prometheus Service
Find the external IP for Prometheus:
kubectl get svc -n monitoring -l app=prometheus-server

Example output:
NAME                TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)          AGE
prometheus-server   LoadBalancer   10.0.123.45    128.251.236.207 9090:31000/TCP   5m

Check Prometheus logs:
kubectl logs -n monitoring -l app=prometheus-server

Grafana Service
Find the external IP for Grafana:
kubectl get svc -n monitoring -l app=grafana

Example output:
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)        AGE
grafana      LoadBalancer   10.0.123.46    128.251.236.208 3000:31001/TCP 5m

Check Grafana logs:
kubectl logs -n monitoring -l app=grafana

6. Configure Prometheus Job for Metrics
The server.js exposes a /metrics endpoint, which Prometheus scrapes. The Ansible playbook (ansible/install_prometheus_grafana.yml) already includes a job named azuredev-appservice to scrape this endpoint:
- job_name: 'azuredev-appservice'
  metrics_path: /metrics
  scrape_timeout: 15s
  static_configs:
    - targets: ['132.220.10.28:80']

Verify the target in Prometheus:

Open the Prometheus UI at http://<PROMETHEUS_EXTERNAL_IP>:9090 (e.g., http://128.251.236.207:9090).
Go to Status > Targets.
Look for the azuredev-appservice job and ensure it’s in the "UP" state with the target 132.220.10.28:80.

7. Access Grafana and Set Up Dashboards
Find Grafana Admin Password
Get the default admin password for Grafana:
kubectl get secret -n monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode; echo

Example output:
admin123

Access Grafana UI

Open Grafana at http://<GRAFANA_EXTERNAL_IP>:3000 (e.g., http://128.251.236.208:3000).
Log in with:
Username: admin
Password: admin123 (or the password from the previous step).



Create a Dashboard

Go to Dashboards > New Dashboard.
Add a new panel:
Title: "HTTP GET Request Rate to /api/stocks"
Data Source: Select prometheus (ensure it’s configured to point to http://prometheus-server:9090).
Query:rate(http_requests_total{job="azuredev-appservice", method="GET", route="/api/stocks", status="200"}[5m])


Unit: Set to Throughput > ops/sec (or custom req/s).


Save the dashboard (e.g., name it "TaskOne").

Generate Traffic to Test Metrics
Send requests to /api/stocks to populate the metrics:
for i in {1..20}; do curl --connect-timeout 20 http://132.220.10.28/api/stocks; sleep 1; done

Refresh the Grafana panel to see the request rate.
8. Import a Dashboard Template (Optional)
You can import a pre-configured dashboard template for monitoring HTTP requests. Below is a sample JSON template for Grafana:
ansible/grafana_template_node/11159_rev1.json