// seed-countries.js (save this in your project root, same level as package.json)
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

const countries = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Norway', code: 'NO' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Italy', code: 'IT' },
  { name: 'Spain', code: 'ES' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Finland', code: 'FI' },
  { name: 'Poland', code: 'PL' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'New Zealand', code: 'NZ' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Argentina', code: 'AR' },
  { name: 'Mexico', code: 'MX' },
  { name: 'India', code: 'IN' },
  { name: 'Turkey', code: 'TR' },
]

async function seedCountries() {
  console.log('🌱 Starting to seed countries...')
  
  try {
    // First, let's test the connection
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Check if countries already exist
    const existingCountries = await prisma.countries.findMany()
    console.log(`Found ${existingCountries.length} existing countries`)
    
    if (existingCountries.length > 0) {
      console.log('Countries already exist:')
      existingCountries.forEach(country => {
        console.log(`  - ${country.name} (${country.code})`)
      })
      console.log('\nSkipping seed since countries already exist.')
      return
    }
    
    // Create all countries at once
    console.log(`Creating ${countries.length} countries...`)
    const result = await prisma.countries.createMany({
      data: countries,
      skipDuplicates: true,
    })
    
    console.log(`\n🎉 Successfully seeded ${result.count} countries!`)
    
    // Show what was created
    const allCountries = await prisma.countries.findMany({
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📋 Countries now in database:')
    allCountries.forEach(country => {
      console.log(`  ${country.id}. ${country.name} (${country.code})`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding countries:', error)
    
    // If it's a connection error, provide some guidance
    if (error.code === 'P1001') {
      console.log('\n💡 Database connection failed. Please check:')
      console.log('1. Your DATABASE_URL in .env file')
      console.log('2. Your database is running')
      console.log('3. You have run: npx prisma migrate dev')
    }
  } finally {
    await prisma.$disconnect()
    console.log('Database connection closed.')
  }
}

// Run the seeder
seedCountries()
  .catch(console.error)