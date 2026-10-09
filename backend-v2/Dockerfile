# İş Pusulası Spring backend — Selenium için Chromium içeren image.
# Multi-stage: 1) Maven ile jar derle  2) JRE + Chromium runtime.

# ---- Stage 1: build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Önce bagimliliklar (katman cache'i: pom degismedikce yeniden indirilmez)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B -q || true

# Kaynak + paketle (testler build'de calismaz)
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B -q

# ---- Stage 2: runtime ----
FROM eclipse-temurin:21-jre
# Chromium + driver + fontlar (Selenium headless icin)
RUN apt-get update && apt-get install -y --no-install-recommends \
        chromium \
        chromium-driver \
        fonts-liberation \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# SeleniumDriverFactory bu yolu app.chrome.binary uzerinden okur
ENV CHROME_BINARY=/usr/bin/chromium

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
