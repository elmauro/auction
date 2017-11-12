FROM yuxidevops/lce_back
COPY package.json /src/package.json
RUN cd /src; npm install --production
COPY . /src
WORKDIR /src
EXPOSE  8080

CMD ["npm", "start"]