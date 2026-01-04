# How to Run

## Prerequisites

Make sure you've installed **Git**, **Docker**, and **Docker Compose** on your local machine.

---

## Steps to Run

1. Clone this repository

   `git clone https://github.com/yogaheristya/FE_Test.git`

2. Change working directory to the project

   `cd FE_Test`

3. Build and start the service using Docker Compose
   `docker compose build`
   `docker compose up -d`

The application will be available at:

`http://localhost:3000`

---

## UI Mode Recommendation

⚠️ This application is optimized for **Light Mode**.

- Please ensure your **browser or system theme is set to Light Mode**
- Dark mode is not recommended for demo usage as some UI elements may not be clearly visible

---

## Notes

- This project runs in **production mode** (`next build` + `next start`)
- No hot reload or on-demand compiling during page access
- **If the API base URL changes, please update it in `.env.local`**
- After updating `.env.local`, rebuild the container using:
  `docker compose build --no-chace`
  `docker compose up -d`

---

## Demo Ready ✅
