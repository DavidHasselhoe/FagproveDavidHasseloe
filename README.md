# StikkUt – Turregistrering, Konkurranser og Lotteri

StikkUt er en moderne webapplikasjon for turregistrering, konkurranser og lotteritrekning. Løsningen er utviklet som en fullstack-applikasjon med Node.js/Express på backend, PostgreSQL som database og et responsivt frontend-grensesnitt bygget med HTML, CSS (Bootstrap + egendefinerte stiler) og JavaScript.

---

## Kom i gang

### **Forutsetninger**

- **Docker & Docker Compose**  
  Last ned og installer: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Git**  
  Last ned og installer: [Git](https://git-scm.com/)
- **pgAdmin (valgfritt)**  
  Brukes for å administrere databasen. Webversjonen starter automatisk på http://localhost:8080, men du kan også laste ned skrivebordsversjonen fra [pgadmin.org](https://www.pgadmin.org/).

---

### **Installasjon og oppstart**

1. **Klon prosjektet**

   ```bash
   git clone https://github.com/DavidHasselhoe/FagproveDavidHasseloe.git
   cd StikkUt-app
   ```

2. **Start applikasjonen og databasen**
   Sørg for at Docker Desktop kjører i bakgrunnen, og kjør deretter:

   ```bash
   docker compose up --build
   ```

   Dette starter:

   - Node.js-applikasjonen på port **3000**
   - PostgreSQL-databasen på port **5432**
   - pgAdmin på port **8080**

   > **Merk:** Du trenger ikke å opprette en `.env`-fil. Alle nødvendige miljøvariabler er allerede satt i `docker-compose.yml` for enkel lokal utvikling.

3. **Åpne applikasjonen**
   - Gå til [http://localhost:3000](http://localhost:3000) for å bruke StikkUt-appen.
   - Gå til [http://localhost:8080](http://localhost:8080) for å administrere databasen med pgAdmin.

---

## Database og pgAdmin

- **pgAdmin** er forhåndskonfigurert via `pgadmin-servers.json`. Når du åpner pgAdmin i nettleseren, vil du se serveren "ShtikkUt Database" ferdig satt opp.
- **Innlogging pgAdmin:**
  - **E-post:** `admin@admin.com`
  - **Passord:** `admin`
- **Database-tilkobling:**
  - **Host:** `postgres`
  - **Port:** `5432`
  - **Brukernavn:** `postgres`
  - **Passord:** `DavidDBSU1!`
  - **Database:** `ShtikkUtApp`

---

## Stoppe tjenester

For å stoppe alle tjenester, kjør:

```bash
docker compose down
```

---

## Gi admin-rettigheter til en bruker

1. Åpne pgAdmin på [http://localhost:8080](http://localhost:8080)
2. Koble til databasen `ShtikkUtApp`
3. Høyreklikk på databasen → **Query Tool**
4. Lim inn og kjør følgende SQL (bytt ut e-posten med ønsket bruker):
   ```sql
   UPDATE users
   SET is_admin = TRUE
   WHERE email = 'test@example.com';
   ```

---

## Teknisk informasjon

- **Backend:** Node.js, Express, JWT (autentisering), bcrypt (passordhashing)
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS (Bootstrap), JavaScript
- **Containerisering:** Docker Compose
- **Miljøvariabler:** Satt i `docker-compose.yml` for enkel lokal oppstart

---

## Merknader

- Dette oppsettet er ment for lokal utvikling og testing.
- For produksjon anbefales det å bruke egne miljøvariabler og sikre passord.

---

**Lykke til med utviklingen!**
