# Task Manager Application

This is a **Task Manager** application where users can manage their personal tasks. The app allows users to perform basic CRUD (Create, Read, Update, Delete) operations on tasks. Users can add new tasks, modify existing tasks, delete tasks, and manage the tasks they've added.

> **Note:** This application is still under development. Some features and responsive design are pending.

## Features

- Add new tasks
- Edit existing tasks
- Delete tasks
- Manage tasks (mark as completed, organize, etc.)
- **Coming soon:** Responsive design and additional features

## Tech Stack

- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Strongly typed programming language for JavaScript
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Prisma** - Database ORM (Object-Relational Mapping)
- **PostgreSQL** - The database used for storing tasks data

## Installation

To get started with the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gnovl/ez-task-flow-app.git
   cd task-manager
   ```

2. Install dependencies: Make sure you have Node.js installed, then run:

`npm install`

3. Set up environment variables: Create a .env file in the root directory and add the following:

DATABASE_URL="postgresql://postgres:<your-password>@localhost:5432/postgres?schema=public"

> Replace <your-password> with your actual PostgreSQL admin password.
> NEXTAUTH_URL=http://localhost:3000

4. Set up the database: You'll need to apply the Prisma migrations to set up your PostgreSQL database schema. Run the following command:

`npx prisma migrate dev`

Running the Application
To run the application in development mode, use the following command:

`npm run dev`

This will start the server on http://localhost:3000.

## Scripts

- `npm run dev` - Runs the development server
- `npm run build` - Builds the project for production
- `npm run start` - Runs the production server
- `npm run lint` - Lints the codebase for potential errors

## Database

This application uses **Prisma** as the ORM and **PostgreSQL** as the database. Ensure that your PostgreSQL instance is running locally or remotely with the appropriate credentials.

You can modify the `DATABASE_URL` in your `.env` file to match your PostgreSQL connection settings.

## Roadmap

- Complete responsive design
- Add priority levels to tasks
- Add user settings

## Contributing

Contributions and feedback are welcome! Feel free to fork the repository and open a pull request.

## Disclaimer

This is an early development version of the Task Manager application. Some features might not work as expected, and the UI is not fully responsive yet.

### Key Sections Explained:

- **Project Overview:** A simple, high-level overview of the app and its current state.
- **Tech Stack:** Lists the key technologies involved in the project.
- **Installation Instructions:** Step-by-step guide to help others set it up locally.
- **Running the App:** Instructions for running the app in development mode.
- **Database:** Information on how to configure and set up the database.
- **Roadmap:** Future features and improvements planned for the app.
- **Contributing:** Encourages contributions and mentions the development status.
