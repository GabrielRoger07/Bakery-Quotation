ARG JAVA_VERSION=21

FROM maven:3.9.11 AS builder
WORKDIR /backend
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:${JAVA_VERSION}-jdk-alpine
WORKDIR /backend
COPY --from=builder /backend/target/backend.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "backend.jar"]