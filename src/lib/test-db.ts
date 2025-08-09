// Test database connection
import { prisma } from './db';

export async function testDatabaseConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error: error };
  } finally {
    await prisma.$disconnect();
  }
}