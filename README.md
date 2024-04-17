# search-table-project

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
-------------------------------------
### 1、k8s部署：用deployment.yaml部署
```
kubectl apply -f search-table-fe-deployment.yaml
```

### 2、为了访问应用，创建一个服务`search-table-fe-service.yaml`：
```
kubectl apply -f search-table-fe-service.yaml
```

### 3、访问Vue应用
```
minikube service search-table-fe-service --url
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


