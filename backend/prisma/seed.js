const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserData(user) {
  if (!user.name || user.name.length < 20 || user.name.length > 60) {
    throw new Error(`Validation Error: Name "${user.name}" must be 20 to 60 characters (got ${user.name ? user.name.length : 0}).`);
  }
  if (!user.address || user.address.length > 400) {
    throw new Error(`Validation Error: Address for "${user.email}" must be 1 to 400 characters (got ${user.address ? user.address.length : 0}).`);
  }
  if (!user.password || !PASSWORD_REGEX.test(user.password)) {
    throw new Error(`Validation Error: Password for "${user.email}" must be 8-16 characters with at least one uppercase letter and one special character.`);
  }
  if (!user.email || !EMAIL_REGEX.test(user.email)) {
    throw new Error(`Validation Error: Email "${user.email}" is invalid.`);
  }
}

async function main() {
  const isReset = process.argv.includes('--reset');

  if (isReset) {
    console.log('\n===================================================================');
    console.log('⚠️  WARNING: RESETTING DATABASE!');
    console.log('This will permanently delete all ratings, stores, and users.');
    console.log('===================================================================\n');

    console.log('Deleting existing ratings...');
    await prisma.rating.deleteMany();

    console.log('Deleting existing stores...');
    await prisma.store.deleteMany();

    console.log('Deleting existing users...');
    await prisma.user.deleteMany();

    console.log('✓ Database wipe completed.\n');
  }

  console.log('--- Starting Database Seeding ---');

  // Pre-hash common passwords for fast idempotent execution
  const hashedTestPassword = await bcrypt.hash('Test@12345', 10);
  const hashedDemoPassword = await bcrypt.hash('Demo@12345', 10);

  // 1. System Administrator from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@storerating.com';
  const adminName = process.env.ADMIN_NAME || 'System Administrator Account';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminAddress = process.env.ADMIN_ADDRESS || '100 Headquarters Boulevard, Suite 400, New York, NY 10001';

  validateUserData({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    address: adminAddress
  });

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const mainAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedAdminPassword,
      address: adminAddress,
      role: 'ADMIN'
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedAdminPassword,
      address: adminAddress,
      role: 'ADMIN'
    }
  });
  console.log(`[+] Seeded/Updated Main System Administrator: ${mainAdmin.email}`);

  // 2. Two Extra Administrator Accounts
  const extraAdminsData = [
    {
      name: 'Operations Administrator Account',
      email: 'ops.admin@storerating.com',
      password: 'Test@12345',
      address: '100 Headquarters Boulevard, Suite 401, New York, NY 10001',
      role: 'ADMIN'
    },
    {
      name: 'Platform Support Administrator',
      email: 'support.admin@storerating.com',
      password: 'Test@12345',
      address: '100 Headquarters Boulevard, Suite 402, New York, NY 10001',
      role: 'ADMIN'
    }
  ];

  for (const adminData of extraAdminsData) {
    validateUserData(adminData);
    await prisma.user.upsert({
      where: { email: adminData.email },
      update: {
        name: adminData.name,
        password: hashedTestPassword,
        address: adminData.address,
        role: adminData.role
      },
      create: {
        name: adminData.name,
        email: adminData.email,
        password: hashedTestPassword,
        address: adminData.address,
        role: adminData.role
      }
    });
    console.log(`[+] Seeded Extra Admin: ${adminData.email}`);
  }

  // 3. Dedicated DEMO Accounts
  const demoAdminData = {
    name: 'Demo System Administrator',
    email: 'demo.admin@storerating.com',
    password: 'Demo@12345',
    address: '75 Silicon Parkway, Suite 500, San Jose, CA 95113',
    role: 'ADMIN'
  };
  validateUserData(demoAdminData);
  const demoAdmin = await prisma.user.upsert({
    where: { email: demoAdminData.email },
    update: {
      name: demoAdminData.name,
      password: hashedDemoPassword,
      address: demoAdminData.address,
      role: demoAdminData.role
    },
    create: {
      name: demoAdminData.name,
      email: demoAdminData.email,
      password: hashedDemoPassword,
      address: demoAdminData.address,
      role: demoAdminData.role
    }
  });
  console.log(`[+] Seeded Demo Admin: ${demoAdmin.email}`);

  const demoOwnerData = {
    name: 'Demo Store Owner Account Manager',
    email: 'demo.owner@storerating.com',
    password: 'Demo@12345',
    address: '22 Camac Street, Elgin, Kolkata, West Bengal 700017',
    role: 'STORE_OWNER'
  };
  validateUserData(demoOwnerData);
  const demoOwner = await prisma.user.upsert({
    where: { email: demoOwnerData.email },
    update: {
      name: demoOwnerData.name,
      password: hashedDemoPassword,
      address: demoOwnerData.address,
      role: demoOwnerData.role
    },
    create: {
      name: demoOwnerData.name,
      email: demoOwnerData.email,
      password: hashedDemoPassword,
      address: demoOwnerData.address,
      role: demoOwnerData.role
    }
  });
  console.log(`[+] Seeded Demo Store Owner: ${demoOwner.email}`);

  const demoUserData = {
    name: 'Demo Normal User Account Test',
    email: 'demo.user@storerating.com',
    password: 'Demo@12345',
    address: 'Flat 4B, Silver Oak Heights, Salt Lake Sector 1, Kolkata 700064',
    role: 'USER'
  };
  validateUserData(demoUserData);
  const demoUser = await prisma.user.upsert({
    where: { email: demoUserData.email },
    update: {
      name: demoUserData.name,
      password: hashedDemoPassword,
      address: demoUserData.address,
      role: demoUserData.role
    },
    create: {
      name: demoUserData.name,
      email: demoUserData.email,
      password: hashedDemoPassword,
      address: demoUserData.address,
      role: demoUserData.role
    }
  });
  console.log(`[+] Seeded Demo Normal User: ${demoUser.email}`);

  // 4. Ten Sample Store Owners
  const sampleOwnersData = [
    {
      name: 'Arunava Bikash Mukherjee',
      email: 'owner1@storerating.com',
      password: 'Test@12345',
      address: '58A Park Street, Park Street Area, Kolkata, West Bengal 700016',
      role: 'STORE_OWNER'
    },
    {
      name: 'Debashis Ramaprasad Sen',
      email: 'owner2@storerating.com',
      password: 'Test@12345',
      address: '17 Park Street, Taltala, Kolkata, West Bengal 700016',
      role: 'STORE_OWNER'
    },
    {
      name: 'Priyanka Sayan Chakraborty',
      email: 'owner3@storerating.com',
      password: 'Test@12345',
      address: '124 Rashbehari Avenue, Gariahat, Kolkata, West Bengal 700029',
      role: 'STORE_OWNER'
    },
    {
      name: 'Vikramaditya Harshwardhan Joshi',
      email: 'owner4@storerating.com',
      password: 'Test@12345',
      address: 'Indiranagar 100 Feet Road, HAL 2nd Stage, Bengaluru, Karnataka 560038',
      role: 'STORE_OWNER'
    },
    {
      name: 'Rajeshwari Venkatesh Iyer',
      email: 'owner5@storerating.com',
      password: 'Test@12345',
      address: 'Plot 42, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      role: 'STORE_OWNER'
    },
    {
      name: 'Sunita Parambrata Banerjee',
      email: 'owner6@storerating.com',
      password: 'Test@12345',
      address: '18 Park Street, Park Street Area, Kolkata, West Bengal 700071',
      role: 'STORE_OWNER'
    },
    {
      name: 'Ananya Indranil Chattopadhyay',
      email: 'owner7@storerating.com',
      password: 'Test@12345',
      address: 'Forum Mall, 10/3 Elgin Road, Bhowanipore, Kolkata, West Bengal 700020',
      role: 'STORE_OWNER'
    },
    {
      name: 'Rohan Chandrashekhar Kulkarni',
      email: 'owner8@storerating.com',
      password: 'Test@12345',
      address: 'Shop 12, Westend Square, Aundh, Pune, Maharashtra 411007',
      role: 'STORE_OWNER'
    },
    {
      name: 'Siddharth Manmohan Singhania',
      email: 'owner9@storerating.com',
      password: 'Test@12345',
      address: 'Forum Mall 4th Floor, 10/3 Elgin Road, Kolkata, West Bengal 700020',
      role: 'STORE_OWNER'
    },
    {
      name: 'Murugan Subramanian Natarajan',
      email: 'owner10@storerating.com',
      password: 'Test@12345',
      address: '88 Mount Road, Anna Salai, Chennai, Tamil Nadu 600002',
      role: 'STORE_OWNER'
    }
  ];

  const sampleOwners = [];
  for (const ownerData of sampleOwnersData) {
    validateUserData(ownerData);
    const owner = await prisma.user.upsert({
      where: { email: ownerData.email },
      update: {
        name: ownerData.name,
        password: hashedTestPassword,
        address: ownerData.address,
        role: ownerData.role
      },
      create: {
        name: ownerData.name,
        email: ownerData.email,
        password: hashedTestPassword,
        address: ownerData.address,
        role: ownerData.role
      }
    });
    sampleOwners.push(owner);
    console.log(`[+] Seeded Store Owner: ${owner.email}`);
  }

  // 5. Stores (Demo Store + 10 Sample Stores across varied categories and cities)
  // Demo Store: Assigned to demo.owner, will have many ratings (>= 8)
  const demoStoreData = {
    name: 'Grand Central Gourmet Bistro & Cafe',
    email: 'grandcentral.bistro@storerating.com',
    address: '22 Camac Street, Elgin, Kolkata, West Bengal 700017',
    ownerId: demoOwner.id
  };

  const demoStore = await prisma.store.upsert({
    where: { email: demoStoreData.email },
    update: {
      name: demoStoreData.name,
      address: demoStoreData.address,
      ownerId: demoOwner.id
    },
    create: demoStoreData
  });
  console.log(`[+] Seeded Demo Store: ${demoStore.name}`);

  const sampleStoresData = [
    {
      name: 'Blue Tokai Coffee Roasters & Cafe',
      email: 'bluetokai.kolkata@storerating.com',
      address: '58A Park Street, Park Street Area, Kolkata, West Bengal 700016',
      ownerId: sampleOwners[0].id // cafe
    },
    {
      name: 'Oxford Book Store & Heritage Cafe',
      email: 'oxford.bookstore@storerating.com',
      address: '17 Park Street, Taltala, Kolkata, West Bengal 700016',
      ownerId: sampleOwners[1].id // bookstore
    },
    {
      name: 'Apollo Pharmacy & Healthcare Hub',
      email: 'apollo.care@storerating.com',
      address: '124 Rashbehari Avenue, Gariahat, Kolkata, West Bengal 700029',
      ownerId: sampleOwners[2].id // pharmacy
    },
    {
      name: 'Croma Mega Electronics & Gadgets',
      email: 'croma.store@storerating.com',
      address: 'Indiranagar 100 Feet Road, HAL 2nd Stage, Bengaluru, Karnataka 560038',
      ownerId: sampleOwners[3].id // electronics shop
    },
    {
      name: 'Gold Fitness Studio & Wellness Gym',
      email: 'goldfitness.mumbai@storerating.com',
      address: 'Plot 42, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      ownerId: sampleOwners[4].id // gym
    },
    {
      name: 'Flurys Heritage European Confectionery',
      email: 'flurys.confectionery@storerating.com',
      address: '18 Park Street, Park Street Area, Kolkata, West Bengal 700071',
      ownerId: sampleOwners[5].id // bakery
    },
    {
      name: 'Envi Luxury Salon & Wellness Spa',
      email: 'envi.salon@storerating.com',
      address: 'Forum Mall, 10/3 Elgin Road, Bhowanipore, Kolkata, West Bengal 700020',
      ownerId: sampleOwners[6].id // salon
    },
    {
      name: 'Nature Harvest Organic Grocery',
      email: 'natureharvest.pune@storerating.com',
      address: 'Shop 12, Westend Square, Aundh, Pune, Maharashtra 411007',
      ownerId: sampleOwners[7].id // grocery
    },
    {
      name: 'Oh! Calcutta Royal Heritage Restaurant',
      email: 'ohcalcutta.dining@storerating.com',
      address: 'Forum Mall 4th Floor, 10/3 Elgin Road, Kolkata, West Bengal 700020',
      ownerId: sampleOwners[8].id // restaurant (leaves 0 ratings for empty UI testing)
    },
    {
      name: 'Stanley Mega Hardware & Tools Emporium',
      email: 'stanleytools.chennai@storerating.com',
      address: '88 Mount Road, Anna Salai, Chennai, Tamil Nadu 600002',
      ownerId: sampleOwners[9].id // hardware store (leaves 0 ratings for empty UI testing)
    }
  ];

  const sampleStores = [];
  for (const sData of sampleStoresData) {
    const store = await prisma.store.upsert({
      where: { email: sData.email },
      update: {
        name: sData.name,
        address: sData.address,
        ownerId: sData.ownerId
      },
      create: sData
    });
    sampleStores.push(store);
    console.log(`[+] Seeded Store: ${store.name}`);
  }

  // 6. Twenty Sample Normal Users
  const sampleUsersData = [
    {
      name: 'Aarav Devashish Sengupta',
      email: 'user1@storerating.com',
      password: 'Test@12345',
      address: '14B Ballygunge Circular Road, Ballygunge, Kolkata, West Bengal 700019',
      role: 'USER'
    },
    {
      name: 'Ishaan Rameshwar Banerjee',
      email: 'user2@storerating.com',
      password: 'Test@12345',
      address: '72 Southern Avenue, Lake Market, Kolkata, West Bengal 700029',
      role: 'USER'
    },
    {
      name: 'Ananya Soumitra Chatterjee',
      email: 'user3@storerating.com',
      password: 'Test@12345',
      address: '58 Hindustan Park, Gariahat, Kolkata, West Bengal 700029',
      role: 'USER'
    },
    {
      name: 'Diya Hrishikesh Mukherjee',
      email: 'user4@storerating.com',
      password: 'Test@12345',
      address: 'Block CF, Sector 1, Salt Lake City, Bidhannagar, Kolkata 700064',
      role: 'USER'
    },
    {
      name: 'Aditya Birendra Nath Bose',
      email: 'user5@storerating.com',
      password: 'Test@12345',
      address: '102 Shyambazar Street, Fariapukur, Kolkata, West Bengal 700004',
      role: 'USER'
    },
    {
      name: 'Rohan Chandranath Ganguly',
      email: 'user6@storerating.com',
      password: 'Test@12345',
      address: 'Flat 301, Lake Town Block A, South Dum Dum, Kolkata 700089',
      role: 'USER'
    },
    {
      name: 'Kavya Deepankar Dasgupta',
      email: 'user7@storerating.com',
      password: 'Test@12345',
      address: '8/2 Alipore Park Road, Alipore, Kolkata, West Bengal 700027',
      role: 'USER'
    },
    {
      name: 'Vikram Someshwar Majumdar',
      email: 'user8@storerating.com',
      password: 'Test@12345',
      address: '44 Jodhpur Park, Jadavpur, Kolkata, West Bengal 700068',
      role: 'USER'
    },
    {
      name: 'Pooja Radheshyam Poddar',
      email: 'user9@storerating.com',
      password: 'Test@12345',
      address: '25 Prince Anwar Shah Road, Tollygunge, Kolkata, West Bengal 700033',
      role: 'USER'
    },
    {
      name: 'Tanvi Harinarayan Trivedi',
      email: 'user10@storerating.com',
      password: 'Test@12345',
      address: '9A Wood Street, Park Street Area, Kolkata, West Bengal 700016',
      role: 'USER'
    },
    {
      name: 'Siddharth Vijayendra Roy',
      email: 'user11@storerating.com',
      password: 'Test@12345',
      address: '501 Coral Heights, Koramangala 4th Block, Bengaluru, Karnataka 560034',
      role: 'USER'
    },
    {
      name: 'Neha Parameshwari Sharma',
      email: 'user12@storerating.com',
      password: 'Test@12345',
      address: 'Tower 3 Flat 12B, Hiranandani Gardens, Powai, Mumbai 400076',
      role: 'USER'
    },
    {
      name: 'Kunal Dhirendranath Dutta',
      email: 'user13@storerating.com',
      password: 'Test@12345',
      address: 'Plot 89, Sector 21D, Chandigarh, UT 160022',
      role: 'USER'
    },
    {
      name: 'Meera Chandrashekhar Sen',
      email: 'user14@storerating.com',
      password: 'Test@12345',
      address: 'B-402 Green Meadows, Baner Road, Pune, Maharashtra 411045',
      role: 'USER'
    },
    {
      name: 'Rahul Bhupendranath Ghosh',
      email: 'user15@storerating.com',
      password: 'Test@12345',
      address: '77 Jubilee Hills Road Number 36, Hyderabad, Telangana 500033',
      role: 'USER'
    },
    {
      name: 'Sneha Gopabandhu Acharya',
      email: 'user16@storerating.com',
      password: 'Test@12345',
      address: '12 Vasant Vihar Enclave, South West Delhi, New Delhi 110057',
      role: 'USER'
    },
    {
      name: 'Arjun Suryanarayan Verma',
      email: 'user17@storerating.com',
      password: 'Test@12345',
      address: '45 Civil Lines, Near High Court, Prayagraj, UP 211001',
      role: 'USER'
    },
    {
      name: 'Ritika Manindranath Mitra',
      email: 'user18@storerating.com',
      password: 'Test@12345',
      address: 'Flat 204, Fortune Residency, Kaloor, Kochi, Kerala 682017',
      role: 'USER'
    },
    {
      name: 'Amitabh Rabindranath Kar',
      email: 'user19@storerating.com',
      password: 'Test@12345',
      address: '62 Gomti Nagar Extension, Sector 4, Lucknow, UP 226010',
      role: 'USER'
    },
    {
      name: 'Shreya Lakshminarayan Pal',
      email: 'user20@storerating.com',
      password: 'Test@12345',
      address: '31 Anna Nagar West Extension, Chennai, Tamil Nadu 600101',
      role: 'USER'
    }
  ];

  const sampleUsers = [];
  for (const uData of sampleUsersData) {
    validateUserData(uData);
    const u = await prisma.user.upsert({
      where: { email: uData.email },
      update: {
        name: uData.name,
        password: hashedTestPassword,
        address: uData.address,
        role: uData.role
      },
      create: {
        name: uData.name,
        email: uData.email,
        password: hashedTestPassword,
        address: uData.address,
        role: uData.role
      }
    });
    sampleUsers.push(u);
    console.log(`[+] Seeded Normal User: ${u.email}`);
  }

  // 7. Seed Ratings (Realistic distribution, 80 to 100 ratings in total)
  // Store inventory:
  // [0] demoStore (Grand Central Gourmet Bistro & Cafe) -> Many ratings (16 ratings, full dashboard)
  // [1] sampleStores[0] (Blue Tokai Cafe) -> 12 ratings
  // [2] sampleStores[1] (Oxford Book Store) -> 10 ratings
  // [3] sampleStores[2] (Apollo Pharmacy) -> 9 ratings
  // [4] sampleStores[3] (Croma Mega Electronics) -> 11 ratings
  // [5] sampleStores[4] (Gold Fitness Gym) -> 8 ratings
  // [6] sampleStores[5] (Flurys Bakery) -> 11 ratings
  // [7] sampleStores[6] (Envi Luxury Salon) -> 8 ratings
  // [8] sampleStores[7] (Nature Harvest Grocery) -> 6 ratings
  // [9] sampleStores[8] (Oh! Calcutta) -> 0 ratings (Empty UI test)
  // [10] sampleStores[9] (Stanley Tools) -> 0 ratings (Empty UI test)
  // Total ratings = 16 + 12 + 10 + 9 + 11 + 8 + 11 + 8 + 6 = 91 ratings!
  //
  // Demo user rates 5 stores:
  // - demoStore (5 stars)
  // - Blue Tokai Cafe (4 stars)
  // - Oxford Book Store (5 stars)
  // - Croma Mega Electronics (4 stars)
  // - Flurys Bakery (5 stars)
  // And leaves remaining 6 stores unrated so submit/modify can both be tested.

  const ratingsToSeed = [];

  // 1) Demo Store: 16 ratings (including Demo User)
  ratingsToSeed.push({ userId: demoUser.id, storeId: demoStore.id, value: 5 });
  const demoStoreUserRatings = [
    { uIndex: 0, val: 5 }, { uIndex: 1, val: 5 }, { uIndex: 2, val: 4 },
    { uIndex: 3, val: 5 }, { uIndex: 4, val: 4 }, { uIndex: 5, val: 5 },
    { uIndex: 6, val: 5 }, { uIndex: 7, val: 4 }, { uIndex: 8, val: 5 },
    { uIndex: 9, val: 4 }, { uIndex: 10, val: 5 }, { uIndex: 11, val: 4 },
    { uIndex: 12, val: 5 }, { uIndex: 13, val: 4 }, { uIndex: 14, val: 5 }
  ];
  demoStoreUserRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: demoStore.id, value: r.val });
  });

  // 2) Blue Tokai Cafe: 12 ratings (including Demo User)
  ratingsToSeed.push({ userId: demoUser.id, storeId: sampleStores[0].id, value: 4 });
  const cafeRatings = [
    { uIndex: 0, val: 5 }, { uIndex: 1, val: 4 }, { uIndex: 2, val: 5 },
    { uIndex: 3, val: 4 }, { uIndex: 4, val: 5 }, { uIndex: 5, val: 4 },
    { uIndex: 6, val: 4 }, { uIndex: 7, val: 5 }, { uIndex: 8, val: 3 },
    { uIndex: 9, val: 5 }, { uIndex: 10, val: 4 }
  ];
  cafeRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[0].id, value: r.val });
  });

  // 3) Oxford Book Store: 10 ratings (including Demo User)
  ratingsToSeed.push({ userId: demoUser.id, storeId: sampleStores[1].id, value: 5 });
  const bookstoreRatings = [
    { uIndex: 1, val: 5 }, { uIndex: 3, val: 5 }, { uIndex: 5, val: 4 },
    { uIndex: 7, val: 5 }, { uIndex: 9, val: 4 }, { uIndex: 11, val: 5 },
    { uIndex: 13, val: 5 }, { uIndex: 15, val: 4 }, { uIndex: 17, val: 5 }
  ];
  bookstoreRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[1].id, value: r.val });
  });

  // 4) Apollo Pharmacy: 9 ratings (Demo User did NOT rate)
  const pharmacyRatings = [
    { uIndex: 0, val: 4 }, { uIndex: 2, val: 5 }, { uIndex: 4, val: 4 },
    { uIndex: 6, val: 4 }, { uIndex: 8, val: 5 }, { uIndex: 10, val: 3 },
    { uIndex: 12, val: 4 }, { uIndex: 14, val: 5 }, { uIndex: 16, val: 4 }
  ];
  pharmacyRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[2].id, value: r.val });
  });

  // 5) Croma Mega Electronics: 11 ratings (including Demo User)
  ratingsToSeed.push({ userId: demoUser.id, storeId: sampleStores[3].id, value: 4 });
  const electronicsRatings = [
    { uIndex: 1, val: 4 }, { uIndex: 2, val: 5 }, { uIndex: 4, val: 4 },
    { uIndex: 6, val: 5 }, { uIndex: 8, val: 4 }, { uIndex: 10, val: 4 },
    { uIndex: 12, val: 5 }, { uIndex: 14, val: 4 }, { uIndex: 16, val: 3 },
    { uIndex: 18, val: 5 }
  ];
  electronicsRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[3].id, value: r.val });
  });

  // 6) Gold Fitness Gym: 8 ratings (Demo User did NOT rate)
  const gymRatings = [
    { uIndex: 3, val: 4 }, { uIndex: 5, val: 5 }, { uIndex: 7, val: 4 },
    { uIndex: 9, val: 4 }, { uIndex: 11, val: 3 }, { uIndex: 13, val: 5 },
    { uIndex: 15, val: 4 }, { uIndex: 17, val: 4 }
  ];
  gymRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[4].id, value: r.val });
  });

  // 7) Flurys Bakery: 11 ratings (including Demo User)
  ratingsToSeed.push({ userId: demoUser.id, storeId: sampleStores[5].id, value: 5 });
  const bakeryRatings = [
    { uIndex: 0, val: 5 }, { uIndex: 2, val: 4 }, { uIndex: 4, val: 5 },
    { uIndex: 6, val: 5 }, { uIndex: 8, val: 4 }, { uIndex: 10, val: 5 },
    { uIndex: 12, val: 4 }, { uIndex: 14, val: 4 }, { uIndex: 16, val: 5 },
    { uIndex: 18, val: 4 }
  ];
  bakeryRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[5].id, value: r.val });
  });

  // 8) Envi Luxury Salon: 8 ratings (Demo User did NOT rate)
  const salonRatings = [
    { uIndex: 1, val: 4 }, { uIndex: 3, val: 4 }, { uIndex: 5, val: 5 },
    { uIndex: 7, val: 4 }, { uIndex: 9, val: 3 }, { uIndex: 11, val: 4 },
    { uIndex: 13, val: 4 }, { uIndex: 15, val: 5 }
  ];
  salonRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[6].id, value: r.val });
  });

  // 9) Nature Harvest Grocery: 6 ratings (Demo User did NOT rate)
  const groceryRatings = [
    { uIndex: 0, val: 4 }, { uIndex: 4, val: 4 }, { uIndex: 8, val: 3 },
    { uIndex: 12, val: 4 }, { uIndex: 16, val: 4 }, { uIndex: 19, val: 4 }
  ];
  groceryRatings.forEach(r => {
    ratingsToSeed.push({ userId: sampleUsers[r.uIndex].id, storeId: sampleStores[7].id, value: r.val });
  });

  // Seed ratings idempotently via upsert
  for (const rating of ratingsToSeed) {
    await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: rating.userId,
          storeId: rating.storeId
        }
      },
      update: {
        value: rating.value
      },
      create: {
        userId: rating.userId,
        storeId: rating.storeId,
        value: rating.value
      }
    });
  }

  console.log(`[+] Successfully seeded ${ratingsToSeed.length} ratings across stores.`);
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
