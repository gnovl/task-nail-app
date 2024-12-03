# Task Manager Application

This is a **Task Manager** application where users can manage their personal tasks. The app allows users to perform basic CRUD (Create, Read, Update, Delete) operations on tasks. Users can add new tasks, modify existing tasks, delete tasks, and manage the tasks they've added.

## Features

- User authentication and authorization
- Add, edit, and delete tasks
- Task categorization with tags
- Priority levels for tasks
- Due date tracking
- Task status management
- Grid and list view options
- User profile settings
- Responsive sidebar layout

## Demo Account

You can test the application using these credentials:

- Email: test@example.com
- Password: 1234

## Tech Stack

- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Strongly typed programming language for JavaScript
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Prisma** - Database ORM (Object-Relational Mapping)
- **PostgreSQL** - The database used for storing tasks data
- **NextAuth.js** - Authentication for Next.js applications

## Installation

To get started with the project locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gnovl/task-Ezy-app.git
   cd task-manager
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed, then run:

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a .env file in the root directory and add the following:

   ```
   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/postgres?schema=public"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here
   ```

   Replace `your-password` with your actual PostgreSQL admin password.

4. **Set up the database:**
   Apply the Prisma migrations to set up your PostgreSQL database schema:

   ```bash
   npx prisma migrate dev
   ```

5. **Create test user:**
   Run the following commands in your terminal:
   ```bash
   npx prisma studio
   ```
   Then create a new user with the test credentials through the Prisma Studio interface.

## Running the Application

To run the application in development mode:

```bash
npm run dev
```

This will start the server on http://localhost:3000.

## Scripts

- `npm run dev` - Runs the development server
- `npm run build` - Builds the project for production
- `npm run start` - Runs the production server
- `npm run lint` - Lints the codebase for potential errors

## Database Setup

When deploying the application:

1. Set up a PostgreSQL database
2. Update the DATABASE_URL in your environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Create the test user account using Prisma Studio

The database schema will be automatically created based on the Prisma models when you run the migrations.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

## Contributing

Contributions and feedback are welcome! Feel free to fork the repository and open a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
