import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create store
  const store = await prisma.store.create({
    data: {
      name: '맛있는 식당',
      code: 'ST01',
    },
  });

  // Create admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      storeId: store.id,
      username: 'admin',
      passwordHash,
    },
  });

  // Create tables
  const tablePassword = await bcrypt.hash('1234', 10);
  for (let i = 1; i <= 5; i++) {
    await prisma.table.create({
      data: {
        storeId: store.id,
        tableNumber: i,
        passwordHash: tablePassword,
      },
    });
  }

  // Create categories
  const categories = ['메인', '사이드', '음료', '디저트'];
  const createdCategories = [];
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.category.create({
      data: { storeId: store.id, name: categories[i], sortOrder: i },
    });
    createdCategories.push(cat);
  }

  // Create menu items
  const menuItems = [
    { name: '김치찌개', price: 9000, categoryIdx: 0, description: '돼지고기 김치찌개', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Korean_stew-Kimchi_jjigae-05.jpg/500px-Korean_stew-Kimchi_jjigae-05.jpg' },
    { name: '된장찌개', price: 8000, categoryIdx: 0, description: '두부 된장찌개', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Doenjang-jjigae_3.jpg/500px-Doenjang-jjigae_3.jpg' },
    { name: '비빔밥', price: 10000, categoryIdx: 0, description: '야채 비빔밥', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Korean_cuisine-Bibimbap-08.jpg/500px-Korean_cuisine-Bibimbap-08.jpg' },
    { name: '불고기', price: 15000, categoryIdx: 0, description: '소불고기 정식', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Korean.cuisine-Bulgogi-01.jpg/500px-Korean.cuisine-Bulgogi-01.jpg' },
    { name: '계란말이', price: 5000, categoryIdx: 1, description: '치즈 계란말이', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Korean_Style_Omelette.jpg/500px-Korean_Style_Omelette.jpg' },
    { name: '김치전', price: 7000, categoryIdx: 1, description: '바삭한 김치전', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Korean_pancake-Haemul_kimchijeon-01.jpg' },
    { name: '콜라', price: 2000, categoryIdx: 2, description: '코카콜라 355ml', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/CocaColaCan.jpg/500px-CocaColaCan.jpg' },
    { name: '사이다', price: 2000, categoryIdx: 2, description: '칠성사이다 355ml', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Lemon_lime_soda.jpg/500px-Lemon_lime_soda.jpg' },
    { name: '아메리카노', price: 3000, categoryIdx: 2, description: '아이스 아메리카노', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Iced_americano.jpg/500px-Iced_americano.jpg' },
    { name: '떡볶이', price: 6000, categoryIdx: 3, description: '떡볶이 1인분', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tteok-bokki_4.jpg/500px-Tteok-bokki_4.jpg' },
  ];

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    await prisma.menuItem.create({
      data: {
        storeId: store.id,
        categoryId: createdCategories[item.categoryIdx].id,
        name: item.name,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl,
        sortOrder: i,
      },
    });
  }

  console.log('Seed data created successfully!');
  console.log(`Store: ${store.name} (${store.code})`);
  console.log(`Admin: admin / admin123`);
  console.log(`Tables: 1-5 / password: 1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
