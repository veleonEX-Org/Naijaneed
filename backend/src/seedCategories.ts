import { db } from './config/db';

async function seedCategories() {
  const categories = [
    { id: 'edu', name: 'Education' },
    { id: 'water', name: 'Water & Sanitation' },
    { id: 'health', name: 'Healthcare Services' },
    { id: 'power', name: 'Power & Electricity' },
    { id: 'roads', name: 'Roads & Infrastructure' },
    { id: 'security', name: 'Public Security' },
    { id: 'waste', name: 'Waste Management' },
    { id: 'transport', name: 'Transportation' },
    { id: 'jobs', name: 'Job & Skills Training' },
    { id: 'markets', name: 'Markets & Trading' },
    { id: 'housing', name: 'Housing & Shelter' },
    { id: 'agri', name: 'Agriculture & Food' },
    { id: 'youth', name: 'Youth & Development' },
    { id: 'env', name: 'Drainage & Erosion' },
    { id: 'others', name: 'Others' }
  ];

  try {
    for (const cat of categories) {
      await db.query(
        'INSERT INTO categories (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2',
        [cat.id, cat.name]
      );
    }
    console.log('Categories seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding categories:', err);
    process.exit(1);
  }
}

seedCategories();
