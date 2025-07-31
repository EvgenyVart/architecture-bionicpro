FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY build/libs/*.jar ./app.jar

EXPOSE 8000

ENTRYPOINT ["java", \
    "-Xmx512m", \
    "-XX:+UseContainerSupport", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar", \
    "--server.port=8000"]