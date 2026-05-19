# Checksy

Checksy is a smart, AI-powered platform designed to simplify and automate the assignment grading workflow for teachers. Built with a modern tech stack, Checksy processes batches of student submissions, applies customizable grading rubrics, checks for AI-generated content, and delivers actionable, consistent feedback in minutes.

## Overview

Checksy solves the time-consuming challenge of manual grading. Teachers can upload a ZIP archive of student submissions, select a subject, set grading strictness, apply custom instructions, and let AI do the heavy lifting. The platform uses advanced background processing to grade files concurrently and securely, providing a comprehensive dashboard to review scores, read feedback, and download CSV reports.

## Key Features

* **Batch Processing**: Upload a ZIP file and Checksy will automatically extract and process all student submissions simultaneously.
* **Custom Grading Templates**: Save subject-specific profiles with predefined strictness levels, max scores, and custom grading rules.
* **Granular Custom Rules**: Create specific instructions (e.g., "Deduct 5 points for missing citations") and toggle them on a per-assignment basis.
* **Multi-Provider AI Support**: Seamlessly integrate with OpenAI, Anthropic, Google Gemini, or Cerebras to power the grading logic.
* **Bank-Grade Security**: Bring Your Own Key (BYOK) architecture securely encrypts your AI provider API keys using AES-256-GCM before storing them in the database.
* **AI Content Detection**: Optional toggle to scan student submissions for AI-generated content.
* **Real-time Background Processing**: Powered by Inngest, grading jobs run reliably in the background without tying up your browser.
* **Teacher Dashboard**: Review grading results, grade distributions, top performers, and export final scores to CSV.

## Tech Stack

### Frontend & Core Framework
* **Next.js** (App Router)
* **React.js**
* **TypeScript**
* **Tailwind CSS**
* **shadcn/ui** & **Lucide Icons**

### Backend & Infrastructure
* **Node.js**
* **Inngest** (Background orchestration and job queues)
* **Vercel AI SDK**
* **Clerk** (Authentication & User Management)

### Database
* **PostgreSQL** (Dockerized local instance / Neon)
* **Drizzle ORM** (Type-safe schema and queries)

## Project Structure

```bash
Checksy/
│
├── src/
│   ├── app/               # Next.js App Router pages and API routes
│   ├── components/        # Reusable UI and layout components
│   ├── lib/               # Core logic, DB connection, AI adapters, crypto
│   │   ├── db/            # Drizzle schema and migrations
│   │   ├── grading/       # AI prompt builders and subject adapters
│   │   └── inngest/       # Background worker definitions
│   └── types/             # TypeScript interfaces
├── .env.example           # Environment variables template
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json
└── README.md
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AnikaJalan/Checksy.git
cd Checksy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory. You can use `.env.example` as a template. You will need:
* A PostgreSQL database URL.
* Clerk authentication keys.
* A 32-byte secure string for `ENCRYPTION_SECRET`.

### 4. Start the Database

If you are using Docker for your local PostgreSQL database, you can spin it up with:

```bash
npm run db:up
```

Then, push the Drizzle schema to the database:

```bash
npx drizzle-kit push
```

### 5. Start the Development Servers

You will need two terminal windows running simultaneously.

**Terminal 1:** Start the Next.js frontend and API server
```bash
npm run dev
```

**Terminal 2:** Start the Inngest background worker for grading jobs
```bash
npx inngest-cli@latest dev
```

### 6. Usage

1. Open `http://localhost:3000` in your browser and sign in via Clerk.
2. Navigate to **Settings > API Keys** to securely add your preferred AI provider key (e.g., OpenAI, Google).
3. (Optional) Go to **Settings > Templates** and **Custom Rules** to set up your grading rubrics.
4. Go to **Upload**, drag and drop a ZIP file of text/markdown submissions, and configure your assignment.
5. Click **Start Grading** and review the results in the Dashboard!

## Author

Developed by Anika Jalan

* GitHub: [https://github.com/AnikaJalan](https://github.com/AnikaJalan)
* LinkedIn: [https://www.linkedin.com/in/anika-jalan/](https://www.linkedin.com/in/anika-jalan/)

## Repository

Check out the project here:

[https://github.com/AnikaJalan/Checksy](https://github.com/AnikaJalan/Checksy)
