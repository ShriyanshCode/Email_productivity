# Email Productivity Agent

This is a full-stack application featuring a Next.js frontend and a FastAPI backend, designed to help manage emails with AI-powered features like categorization, action item extraction, and summarization.

## Prerequisites

- **Node.js**: v18 or higher (for the frontend)
- **Python**: v3.8 or higher (for the backend)
- **Git**: To clone the repository

## Getting Started

Follow these steps to set up and run the application from scratch. **It is important to start the backend before the frontend.**

### 1. Backend Setup (Run this FIRST)

The backend handles the AI logic and data management.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    It is highly recommended to use a virtual environment to manage dependencies.
    
    *   **Windows:**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    - Copy `.env.example` to `.env`:
      ```bash
      # Windows
      copy .env.example .env
      
      # macOS/Linux
      cp .env.example .env
      ```
    - Open `.env` and configure your API keys (e.g., Google Gemini API key).

5.  **Start the Backend Server:**
    Run the server using `uvicorn`.
    ```bash
    uvicorn main:app --reload
    ```
    The backend will start on `http://localhost:8000`.

### 2. Frontend Setup (Run this SECOND)

The frontend provides the user interface.

1.  **Open a NEW terminal window** (keep the backend running in the first one).

2.  **Navigate to the `app` directory:**
    ```bash
    cd app
    ```

3.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

4.  **Start the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The frontend will start on `http://localhost:3000`.

## Usage

1.  Open your browser and navigate to `http://localhost:3000`.
2.  You can now upload email JSON files, view categorized emails, and use the AI features.

## Project Structure

-   **`app/`**: Next.js frontend code.
-   **`backend/`**: FastAPI backend code.
    -   `main.py`: Entry point for the API.
    -   `requirements.txt`: Python dependencies.

## Troubleshooting

-   **Port Conflicts**: If port 3000 or 8000 is in use, you may need to kill the process using that port.
-   **Connection Refused**: If the frontend cannot talk to the backend, ensure the backend is running on port 8000.
