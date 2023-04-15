FROM python:3.8

RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

COPY ./ /usr/src/server/

EXPOSE 80

RUN pip install -r ./requirements.txt

CMD [ "python", "./index.py" ]