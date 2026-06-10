#start with a container that has node 22 installed
FROM node:22 
#use/app as the project folder
WORKDIR /app
#copy dependency files
COPY package*.json ./
#install express,OpenAI,pg,.dotenv, etc
RUN npm install
#Copy the rest of the application
COPY . .
#this app listens on port 3000 or whatever port it would be on 3000 is what we used
EXPOSE 3000
#start the API
CMD ["node", "server.js"]

#docker run -p 3000:3000 ai-job-agent
#This pretty much is saying the api will run on port 3000 and 3000:3000 part means Host port : Container_port so it connects pc port to containers port
#Basically this creates a bridge localhost:3000 -> Docker -> container port 3000 -> express now Postman can talk to the API