FROM node:17.9.0

COPY . /

CMD yarn build  &&  yarn serve
