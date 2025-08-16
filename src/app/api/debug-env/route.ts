// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Environment Variables Debug:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('DIRECT_URL:', process.env.DIRECT_URL);
  
  // Parse the URL to see what's wrong
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      console.log('Parsed URL components:');
      console.log('- Protocol:', url.protocol);
      console.log('- Username:', url.username);
      console.log('- Password:', url.password);
      console.log('- Hostname:', url.hostname);
      console.log('- Port:', url.port);
      console.log('- Pathname:', url.pathname);
      console.log('- Search:', url.search);
    } catch (error) {
      console.error('Failed to parse DATABASE_URL:', error);
    }
  }
  
  return NextResponse.json({ 
    DATABASE_URL: process.env.DATABASE_URL ? 'Present' : 'Missing',
    DIRECT_URL: process.env.DIRECT_URL ? 'Present' : 'Missing',
    NODE_ENV: process.env.NODE_ENV
  });
}