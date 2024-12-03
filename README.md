# Code Editor Server

A modern web-based code editor with file management and integrated terminal.

## Features

- File management (create, edit, delete files and directories)
- Integrated terminal
- Real-time file watching
- Modular and maintainable architecture
- Error handling

## Project Structure

```
code-editor--Server/
├── config/             # Configuration settings
├── middleware/         # Express middlewares
├── routes/             # API routes
├── services/           # Business logic services
├── socket/             # Socket.io handlers
├── utils/              # Utility functions
├── user/               # User files directory
├── index.js            # Application entry point
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

The server will run on port 9000 by default. You can change this by setting the PORT environment variable.

## API Endpoints

- `GET /files`: Get the directory tree structure
- `GET /files/content?path=<path>`: Get the content of a file
- `GET /health`: Health check endpoint

## Socket.io Events

### Server to Client

- `file:refresh`: Notify clients to refresh their file tree
- `terminal:data`: Send terminal output to clients
- `file:update:success`: Notify success of file update
- `file:update:error`: Notify error in file update
- `file:create:success`: Notify success of file creation
- `file:create:error`: Notify error in file creation
- `file:delete:success`: Notify success of file deletion
- `file:delete:error`: Notify error in file deletion

### Client to Server

- `file:change`: Update file content
- `terminal:write`: Write to terminal
- `terminal:resize`: Resize terminal dimensions
- `file:create`: Create file or directory
- `file:delete`: Delete file or directory

## License

This project is licensed under the ISC License.
