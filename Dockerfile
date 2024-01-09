FROM node:18

WORKDIR /home/boarding-duck

RUN apt-get update -yq \
&& apt-get autoremove \
&& apt-get clean -y \
&& rm -rf /var/lib/apt/lists/*

COPY ./package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:setup"]