# Urban Estate

Urban Estate is a full-stack real estate application built using the MERN stack (MongoDB, Express.js, React, Node.js). This application allows users to browse, create, update, and delete real estate listings. It also includes authentication using JWT and Google OAuth.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Contact](#contact)

## Demo

Check out the live demo of the application: [MERN Estate Demo](https://your-deployed-site.com)

## Features

- User authentication with JWT and Google OAuth
- Create, read, update, and delete real estate listings
- Filter and search listings
- Responsive design

## Technologies

- MongoDB
- Express.js
- React
- Node.js
- JWT
- Google OAuth
- Tailwind CSS
- Vite

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sarthakkurothe/mern-estate.git
    cd mern-estate-main
    ```

2. Install server dependencies:

    ```bash
    cd api
    npm install
    ```

3. Install client dependencies:

    ```bash
    cd ../client
    npm install
    ```

## Usage

1. Create a `.env` file in the `api` directory and add the following environment variables:

    ```env
    MONGO=<your-mongodb-connection-string>
    JWT_SECRET=<your-jwt-secret>
    VITE_FIREBASE_API_KEY=<firebase-api-key>
    ```

2. Build the client:

    ```bash
    npm run build --prefix client
    ```

3. Start the server:

    ```bash
    npm start
    ```

4. Your application should now be running on `http://localhost:3000`.

## API Endpoints

### Authentication

- **POST** `/api/auth/signup` - User signup
- **POST** `/api/auth/signin` - User signin
- **POST** `/api/auth/google` - Google OAuth

### User

- **GET** `/api/user/:id` - Get user by ID

### Listings

- **POST** `/api/listing/create` - Create a listing (authenticated)
- **DELETE** `/api/listing/delete/:id` - Delete a listing (authenticated)
- **POST** `/api/listing/update/:id` - Update a listing (authenticated)
- **GET** `/api/listing/get/:id` - Get a listing by ID
- **GET** `/api/listing/get` - Get all listings

## Environment Variables

The following environment variables need to be set in your `.env` file:

- `MONGO`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT
- `VITE_FIREBASE_API_KEY`: Secret API key for firebase

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Contact

For any inquiries or feedback, please contact:

- **Sarthak Kurothe** - [reachsarthakkurothe@gmail.com](mailto:reachsarthakkurothe@gmail.com)
- [GitHub](https://github.com/sarthakkurothe)
