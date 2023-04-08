FROM openjdk:17-slim-bullseye

RUN apt-get update && apt-get install -y iproute2 python3

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# create user
RUN groupadd chalusr
RUN useradd -ms /bin/bash -g chalusr chalusr

COPY jnotes/target/app.jar ./

USER chalusr
CMD ["java", "-jar", "/usr/src/app/app.jar"]