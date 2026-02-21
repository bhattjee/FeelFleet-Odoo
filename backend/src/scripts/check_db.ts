import { prisma } from '../backend/src/config/database';

async function checkSchema() {
    try {
        const columns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Vehicle';
        `;
        console.log('Vehicle Columns:', JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('SQL Check Failed:', err);
    }
}

checkSchema().catch(console.error);
