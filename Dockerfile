FROM node:17.9.0

COPY . /

CMD yarn  && yarn cb  &&  yarn serve
