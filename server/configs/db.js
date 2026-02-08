import { neon } from "@neondatabase/serverless";

// Initialize Neon Helper for PostgreSQL connection
const sql = neon(`${process.env.DATABASE_URL}`);

export default sql;
