/**
 * Environment Provisioner Core Library.
 * Translates service definitions into IaC (Terraform, Docker, K8s).
 */

export interface ServiceDef {
  name: string;
  type: 'compute' | 'database';
  size: 'small' | 'medium' | 'large';
  port?: number;
  engine?: string;
}

export function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function generateTerraformAWS(svc: ServiceDef): string {
  const name = sanitizeName(svc.name);
  if (svc.type === 'database') {
    return `resource "aws_db_instance" "${name}" {
  identifier = "${name}"
  engine     = "${svc.engine || 'postgres'}"
  instance_class = "db.${svc.size === 'small' ? 't3.micro' : 't3.medium'}"
  allocated_storage = 20
}`;
  }
  return `resource "aws_instance" "${name}" {
  ami = "ami-0c55b159cbfafe1f0"
  instance_type = "${svc.size === 'small' ? 't3.micro' : 't3.medium'}"
  tags = { Name = "${svc.name}" }
}`;
}

export function generateDockerfile(svc: ServiceDef): string {
  return `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE ${svc.port || 3000}
CMD ["npm", "start"]`;
}

export function generateK8sManifest(svc: ServiceDef): string {
  const name = sanitizeName(svc.name);
  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: main
        image: ${name}:latest
        ports:
        - containerPort: ${svc.port || 80}
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}
spec:
  selector:
    app: ${name}
  ports:
  - port: 80
    targetPort: ${svc.port || 80}`;
}
