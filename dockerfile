FROM openjdk:17-jdk

WORKDIR /app

COPY ./target/proyecto_2p.jar /app/proyecto_2p.jar

EXPOSE 80

ENTRYPOINT [ "java", "-jar", "proyecto_2p.jar"] 