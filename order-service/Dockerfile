FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY order-service/pom.xml ./order-service/
RUN mvn -q -f order-service/pom.xml dependency:go-offline
COPY order-service/src ./order-service/src
RUN mvn -q -f order-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/order-service/target/*.jar app.jar
EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar"]