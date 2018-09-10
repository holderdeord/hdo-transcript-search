FROM node:8
WORKDIR /code
COPY . ./
RUN npm run build
EXPOSE 7575
CMD ["npm", "start"]