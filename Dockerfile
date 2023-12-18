FROM node:18

COPY ./ /home/boarding-duck

RUN apt-get update -yq \
&& apt-get autoremove \
&& apt-get clean -y \
&& rm -rf /var/lib/apt/lists/* \
&& cd /home/boarding-duck \
&& npm install 

CMD ["npm","--prefix","/home/boarding-duck","start:setup"]