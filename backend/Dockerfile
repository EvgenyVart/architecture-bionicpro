# Этап сборки
FROM eclipse-temurin:21-jdk-alpine as builder

WORKDIR /workspace
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

RUN ./gradlew clean build --no-daemon

# Финальный образ
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /workspace/build/libs/*-SNAPSHOT.jar ./app.jar

EXPOSE 8000

ENTRYPOINT ["java", \
    "-Xmx512m", \
    "-XX:+UseContainerSupport", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar", \
    "--server.port=8000"]