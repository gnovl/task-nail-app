# taskEzy

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

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v13 or higher)
- npm (usually comes with Node.js)

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/gnovl/task-Ezy-app.git
   cd task-manager
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following content:

   ```
   DATABASE_URL="postgresql://postgres:admin1234@localhost:5432/postgres?schema=public"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key_here
   ```

   Note: The default PostgreSQL password is set to `admin1234`. If your local PostgreSQL uses a different password, update it accordingly in the DATABASE_URL.

4. **Set up the database:**
   ```bash
   # Create and apply database migrations
   npx prisma migrate dev
   ```

### Accessing the Application

You have two options to access the application:

#### Option 1: Use the Test Account

The application comes with a pre-configured test account:

- **Email:** test@example.com
- **Password:** 1234

#### Option 2: Register a New Account

You can create your own account by:

1. Opening the application in your browser
2. Clicking the "Register" link on the login page
3. Filling out the registration form with your details

## Running the Application

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Access the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

3. **Log in using either:**
   - The test account credentials listed above, or
   - Your newly registered account credentials

## Tech Stack

- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - Strongly typed programming language for JavaScript
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Prisma** - Database ORM (Object-Relational Mapping)
- **PostgreSQL** - The database used for storing tasks data
- **NextAuth.js** - Authentication for Next.js applications

## Development Scripts

- `npm run dev` - Runs the development server
- `npm run build` - Builds the project for production
- `npm run start` - Runs the production server
- `npm run lint` - Lints the codebase for potential errors

## Database Management

### Local Development

- Access Prisma Studio (database GUI):
  ```bash
  npx prisma studio
  ```
- Reset the database:
  ```bash
  npx prisma migrate reset
  ```
- Update the database schema:
  ```bash
  npx prisma migrate dev
  ```

### Production Deployment

1. Set up a PostgreSQL database
2. Update the DATABASE_URL in your environment variables
3. Run migrations: `npx prisma migrate deploy`

## Troubleshooting

Common issues and solutions:

1. **Database Connection Errors**

   - Verify PostgreSQL is running
   - Check if the database password matches your DATABASE_URL
   - Ensure the postgres service is running on port 5432

2. **Authentication Issues**
   - Verify NEXTAUTH_URL matches your development URL
   - Ensure NEXTAUTH_SECRET is set
   - Clear browser cookies if experiencing login loops

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.
