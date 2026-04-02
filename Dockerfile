#Image Node LTS
FROM node:20-alpine 

#Dossier de travail
WORKDIR /app

#Copier les fichiers nécessaires
COPY package*.json ./

#Installer les dépendances
RUN npm install

#Copier le reste du code
COPY . .

#Build NestJs
RUN npm run build

#Exposer le port
EXPOSE 4000

#Lancer l'app
CMD [ "node", "dist/main.js" ]