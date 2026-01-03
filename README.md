# SeeFlood

A flood reporting application that allows users to upload images of floods with their location and visualize reports on a map. Submission for Artificial Intelligence AOL
Created by:
-   Edward Wibowo
-   Felicia Faustine Hidayat
-   Jeremy Auriel Zhang

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Go](https://go.dev/dl/) (version 1.24 or higher)
-   [Node.js](https://nodejs.org/) (version 18 or higher)
-   [PostgreSQL](https://www.postgresql.org/download/)
-   [Python](https://www.python.org/downloads/) (version 3.8 or higher)

## Getting Started

### 1. Database Setup

Ensure you have a PostgreSQL database running. You will need to configure the connection details in the backend.

### 2. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```

3.  Update the `.env` file with your database credentials:
    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_NAME=seeflood
    PORT=8080
    ```

4.  **Database Migration**:
    The application automatically migrates the database schema (creates the `flood_reports` table) when you start the server. There is no need to run a separate migration command.

5.  Start the backend server:
    ```bash
    go run main.go
    ```
    The server will start on `http://localhost:8080`.

### 3. Model Server Setup

1.  Navigate to the `model/serving` directory:
    ```bash
    cd model/serving
    ```

2.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

3.  Start the Python model server:
    ```bash
    python main.py
    ```
    The model server will start on `http://localhost:5000`.

### 4. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will start on `http://localhost:5173` (or another port if 5173 is busy).

## Usage

1.  Open your browser and go to the frontend URL (e.g., `http://localhost:5173`).
2.  Allow location access when prompted.
3.  View existing flood reports on the map.
4.  Click the **+** button to report a flood:
    -   Upload an image.
    -   Submit the report.
5.  Click on any marker to view the image and details.
