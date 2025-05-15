Step 1: Create a file `db/inventory.db` in the root derictory or inside`fire-app`
Step 2: Create a file `.env` inside `fire-app` with the following content: `DATABASE_URL="file:../db/inventory.db"`
Step 3: Open terminal and run the command `npx prisma migrate dev --name init` to create the database schema
Step 4: Run the command `npx prisma generate` to generate the Prisma Client
Step 5: Run the command `npm install` to install the dependencies
Step 6: Run the command `npm start` to start the server