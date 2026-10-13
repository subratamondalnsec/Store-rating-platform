const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Administrator from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@storerating.com';
  const adminName = process.env.ADMIN_NAME || 'System Administrator Account';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminAddress = process.env.ADMIN_ADDRESS || '100 Headquarters Boulevard, Suite 400, New York, NY 10001';

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        address: adminAddress,
        role: 'ADMIN'
      }
    });
    console.log(`[+] Seeded System Administrator: ${admin.email}`);
  } else {
    console.log(`[*] System Administrator already exists: ${admin.email}`);
  }

  // 2. Seed Sample Store Owners
  const ownersData = [
    {
      name: 'Johnathan Alexander Doe',
      email: 'owner1@storerating.com',
      password: 'Owner@123456',
      address: '124 Marketplace Avenue, Downtown, NY 10002',
      role: 'STORE_OWNER'
    },
    {
      name: 'Eleanor Margaret Vance',
      email: 'owner2@storerating.com',
      password: 'Owner@123456',
      address: '542 Commerce Boulevard, Uptown, NY 10025',
      role: 'STORE_OWNER'
    },
    {
      name: 'Samuel Harrison Brooks',
      email: 'owner3@storerating.com',
      password: 'Owner@123456',
      address: '789 Retail Parkway, Westside, NY 10036',
      role: 'STORE_OWNER'
    }
  ];

  const owners = [];
  for (const ownerData of ownersData) {
    let owner = await prisma.user.findUnique({ where: { email: ownerData.email } });
    if (!owner) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ownerData.password, salt);
      owner = await prisma.user.create({
        data: {
          name: ownerData.name,
          email: ownerData.email,
          password: hashedPassword,
          address: ownerData.address,
          role: ownerData.role
        }
      });
      console.log(`[+] Seeded Store Owner: ${owner.email}`);
    } else {
      console.log(`[*] Store Owner already exists: ${owner.email}`);
    }
    owners.push(owner);
  }

  // 3. Seed Sample Stores (Owner 1 & Owner 2 have stores; Owner 3 remains unassigned for admin test)
  const storesData = [
    {
      name: 'Downtown Artisan Coffee & Bakery',
      email: 'contact@downtowncoffee.com',
      address: '124 Marketplace Avenue, Downtown, NY 10002',
      ownerId: owners[0].id
    },
    {
      name: 'Metro Organic Fresh Grocery',
      email: 'support@metrofresh.com',
      address: '542 Commerce Boulevard, Uptown, NY 10025',
      ownerId: owners[1].id
    }
  ];

  const stores = [];
  for (const storeData of storesData) {
    let store = await prisma.store.findUnique({ where: { email: storeData.email } });
    if (!store) {
      store = await prisma.store.create({
        data: storeData
      });
      console.log(`[+] Seeded Store: ${store.name}`);
    } else {
      console.log(`[*] Store already exists: ${store.name}`);
    }
    stores.push(store);
  }

  // 4. Seed Normal Users
  const usersData = [
    {
      name: 'Christopher James Evans',
      email: 'user1@storerating.com',
      password: 'User@123456',
      address: '320 Residential Park, Queens, NY 11101',
      role: 'USER'
    },
    {
      name: 'Katherine Elizabeth Ray',
      email: 'user2@storerating.com',
      password: 'User@123456',
      address: '777 Maple Street, Brooklyn, NY 11201',
      role: 'USER'
    },
    {
      name: 'Alexander Michael Scott',
      email: 'user3@storerating.com',
      password: 'User@123456',
      address: '910 Oak Lane, Jersey City, NJ 07302',
      role: 'USER'
    }
  ];

  const users = [];
  for (const userData of usersData) {
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          address: userData.address,
          role: userData.role
        }
      });
      console.log(`[+] Seeded User: ${user.email}`);
    } else {
      console.log(`[*] User already exists: ${user.email}`);
    }
    users.push(user);
  }

  // 5. Seed Sample Ratings
  if (stores.length >= 2 && users.length >= 3) {
    const ratingsData = [
      { userId: users[0].id, storeId: stores[0].id, value: 5 },
      { userId: users[1].id, storeId: stores[0].id, value: 4 },
      { userId: users[2].id, storeId: stores[0].id, value: 4 },
      { userId: users[0].id, storeId: stores[1].id, value: 3 },
      { userId: users[1].id, storeId: stores[1].id, value: 5 }
    ];

    for (const r of ratingsData) {
      await prisma.rating.upsert({
        where: {
          userId_storeId: {
            userId: r.userId,
            storeId: r.storeId
          }
        },
        update: { value: r.value },
        create: {
          userId: r.userId,
          storeId: r.storeId,
          value: r.value
        }
      });
    }
    console.log(`[+] Seeded ${ratingsData.length} initial ratings.`);
  }

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
