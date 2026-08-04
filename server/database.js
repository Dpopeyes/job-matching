import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

export function initDatabase() {
  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'applicant',
      studentId TEXT,
      university TEXT,
      major TEXT,
      avatar TEXT,
      bio TEXT,
      qrCodeUrl TEXT,
      phone TEXT,
      faceKYCVerified INTEGER DEFAULT 1
    )
  `);

  // Create Jobs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      logo TEXT,
      location TEXT,
      category TEXT DEFAULT 'all',
      type TEXT,
      salary TEXT,
      experienceLevel TEXT,
      matchRate INTEGER DEFAULT 90,
      postedDate TEXT,
      skillsRequired TEXT,
      qualifications TEXT,
      responsibilities TEXT,
      benefits TEXT,
      description TEXT
    )
  `);

  // Create Skills Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT DEFAULT 'Intermediate'
    )
  `);

  // Create Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      tags TEXT,
      demoUrl TEXT,
      githubUrl TEXT,
      image TEXT
    )
  `);

  // Create Applications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      company TEXT NOT NULL,
      userId TEXT NOT NULL,
      coverNote TEXT,
      applyDate TEXT,
      status TEXT DEFAULT 'กำลังพิจารณา (Under Review)'
    )
  `);
}

export default db;
