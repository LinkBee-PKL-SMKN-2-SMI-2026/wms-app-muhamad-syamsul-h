import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { email } from 'zod';
import { password } from 'bun';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai melakukan seeding data...');

  // // Seed Example 1
  // const example1 = await prisma.example.upsert({
  //   where: { name: 'Laptop Asus ROG' },
  //   update: {},
  //   create: {
  //     name: 'Laptop Asus ROG',
  //     description: 'Laptop gaming performa tinggi',
  //     isActive: true,
  //     items: {
  //       create: [
  //         { productName: 'Laptop ROG Strix G16', quantity: 5, price: 18000000 },
  //         { productName: 'Mouse ROG Gladius', quantity: 10, price: 850000 },
  //         { productName: 'Keyboard ROG Falchion', quantity: 8, price: 1200000 },
  //       ],
  //     },
  //   },
  //   include: { items: true },
  // });

  //CTRL + F (biar cepat):
  //admin
  //kategori
  //lokasi
  //produk

  //PW BCRYPT/HASH
  const bcryptpw = await bcrypt.hash('admin123', 10);

  //admin
  const UserAdmin = await prisma.users.upsert({
    where: { email:'admin@gmail.com'},
    update: {},
    create: {
      name: 'mas admin',
      email: 'admin@gmail.com',
      password: bcryptpw,
      role: 'ADMIN',
      isActive: true,
    },
  })

  //kategori di bawah ini
  const Elektronik = await prisma.categories.upsert({
    where: {name: 'Elektronik'},
    update: {},
    create: {
      name: 'Elektronik',
      description: 'hp, laptop, lainnya',
    },
  })

  const Furniture = await prisma.categories.upsert({
    where: {name: 'Furniture'},
    update:{},
    create: {
      name: 'Furniture',
      description: 'perabotan',
    },
  })

  const ATK = await prisma.categories.upsert({
    where:{name:'ATK'},
    update:{},
    create:{
      name:'ATK',
      description:'alat tulis',
    },
  })

  //lokasi di bawah ini
  const rakA1 = await prisma.locations.upsert({
    where: {code: 'RAK-A1'},
    update:{},
    create:{
      name:'Rak A1',
      code:'RAK-A1',
    },
  })

  const rakA2 = await prisma.locations.upsert({
    where: {code: 'RAK-A2'},
    update:{},
    create:{
      name:'Rak A2',
      code:'RAK-A2',
    },
  })

  const gdgB1 = await prisma.locations.upsert({
    where: {code: 'GDG-B1'},
    update:{},
    create:{
      name:'Gudang B1',
      code:'GDG-B1',
    },
  })

  //produk di bawah ini
  await prisma.products.upsert({
    where: {sku: 'ELEK-001'},
    update:{},
    create:{
      name: 'Laptop Asus ROG',
      sku: 'ELEK-001',
      description: 'Laptop gaming performa tinggi',
      stock: 15,
      minimumStock: 5,
      categoryId: Elektronik.id, 
      locationId: rakA1.id,
    },
  })

  await prisma.products.upsert({
    where: {sku: 'ELEK-002'},
    update:{},
    create:{
      name: 'Laptop ROG Strix G16',
      sku: 'ELEK-002',
      description: 'Laptop gaming performa tinggi',
      stock: 5,
      minimumStock: 2,
      categoryId: Elektronik.id, 
      locationId: rakA1.id,
    },
  })

  await prisma.products.upsert({
    where: {sku: 'FURN-001'},
    update:{},
    create:{
      name: 'Kursi Lipat',
      sku: 'FURN-001',
      description: 'Kursi yang bisa dilipat',
      stock: 50,
      minimumStock: 10,
      categoryId: Furniture.id, 
      locationId: rakA2.id,
    },
  })

  await prisma.products.upsert({
    where: {sku: 'FURN-002'},
    update:{},
    create:{
      name: 'Meja Lipat',
      sku: 'FURN-002',
      description: 'Meja yang bisa dilipat',
      stock: 30,
      minimumStock: 5,
      categoryId: Furniture.id, 
      locationId: rakA2.id,
    },
  })

  await prisma.products.upsert({
    where: {sku: 'ATK-001'},
    update:{},
    create:{
      name: 'Kertas A4',
      sku: 'ATK-001',
      description: 'kertas yang umumnya ada',
      stock: 50,
      minimumStock: 10,
      categoryId: ATK.id, 
      locationId: gdgB1.id,
    },
  })

  console.log('✅ Seeding selesai! Data yang dibuat:');
  console.log({
    admin: UserAdmin.email,
    categoriesCreated: 3,
    locationsCreated: 3,
    productsCreated: 5,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
