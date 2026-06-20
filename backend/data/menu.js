/**
 * JAFS Gressvik Menu Data
 * Complete restaurant menu with categories, items, sizes, and options
 */

export const menu = {
  restaurant: {
    name: "JAFS Gressvik",
    tagline: "FABELAKTIG FASTFOOD",
    address: "Storveien 78, 1621 Gressvik",
    phone: "69 333 200",
    hours: {
      monday: "Stengt",
      tuesday: "14:00 - 23:00",
      wednesday: "14:00 - 23:00",
      thursday: "14:00 - 23:00",
      friday: "13:00 - 23:00",
      saturday: "13:00 - 23:00",
      sunday: "12:00 - 23:00"
    }
  },
  
  categories: [
    {
      id: "kebab",
      name: "Kebab",
      nameEn: "Kebab",
      items: [
        { id: "kebab-pita", name: "Kebab i pita", price: 95, description: "Classic kebab in pita bread" },
        { id: "kylling-kebab-pita", name: "Kyllingkebab i pita", price: 95, description: "Chicken kebab in pita bread" },
        { id: "kebab-tallerken", name: "Kebab tallerken", price: 149, description: "Kebab plate with sides" },
        { id: "kylling-tallerken", name: "Kylling tallerken", price: 149, description: "Chicken plate with sides" },
        { id: "kebabrull", name: "Kebabrull", price: 95, description: "Kebab wrap/roll" },
        { id: "kyllingrull", name: "Kyllingrull", price: 95, description: "Chicken wrap/roll" }
      ]
    },
    {
      id: "kebab-meny",
      name: "Kebab med drikke",
      nameEn: "Kebab Meals",
      description: "Inkluderer 0.5L drikke",
      items: [
        { id: "kebab-pita-meny", name: "Kebab i pita meny", price: 120, description: "Kebab pita with drink", includes: ["0.5L drink"] },
        { id: "kylling-kebab-pita-meny", name: "Kyllingkebab i pita meny", price: 120, description: "Chicken kebab pita with drink", includes: ["0.5L drink"] },
        { id: "kebabrull-meny", name: "Kebabrull meny", price: 120, description: "Kebab roll with drink", includes: ["0.5L drink"] },
        { id: "kyllingrull-meny", name: "Kyllingrull meny", price: 120, description: "Chicken roll with drink", includes: ["0.5L drink"] },
        { id: "kebab-meny", name: "Kebab meny", price: 175, description: "Kebab plate meal with drink", includes: ["0.5L drink", "pommes frites"] },
        { id: "kyllingkebab-meny", name: "Kyllingkebab meny", price: 175, description: "Chicken kebab plate meal", includes: ["0.5L drink", "pommes frites"] }
      ]
    },
    {
      id: "barnemeny",
      name: "Barnemeny",
      nameEn: "Kids Menu",
      description: "Med pommes frites",
      items: [
        { id: "barn-hamburger", name: "Hamburger (barn)", price: 99, description: "Kids hamburger with fries", includes: ["pommes frites"] },
        { id: "barn-nuggets", name: "Kyllingnuggets (5 stk)", price: 99, description: "5 chicken nuggets with fries", includes: ["pommes frites"] }
      ]
    },
    {
      id: "salater",
      name: "Salater",
      nameEn: "Salads",
      items: [
        { id: "salat-kylling", name: "Salat med Kylling", price: 120, description: "Fresh salad with chicken" },
        { id: "salat-skinke", name: "Salat med Skinke", price: 120, description: "Fresh salad with ham" }
      ]
    },
    {
      id: "hamburger",
      name: "Hamburger",
      nameEn: "Burgers",
      options: {
        addons: [
          { id: "pommes", name: "Pommes frites", price: 25 },
          { id: "ost-burger", name: "Ost", price: 5 },
          { id: "bacon-burger", name: "Bacon", price: 10 }
        ],
        glutenFree: { available: true, note: "Vi har også glutenfri hamburgerbrød" }
      },
      items: [
        { id: "hamburger-100g", name: "Hamburger 100g", price: 80, size: "100g" },
        { id: "hamburger-160g", name: "Hamburger 160g", price: 110, size: "160g" },
        { id: "hamburger-190g", name: "Hamburger 190g", price: 120, size: "190g" },
        { id: "hamburger-250g", name: "Hamburger 250g", price: 135, size: "250g" },
        { id: "jafs-burger-200g", name: "Jafs Burger 200g", price: 125, size: "200g", signature: true },
        { id: "jafs-burger-320g", name: "Jafs Burger 320g", price: 170, size: "320g", signature: true },
        { id: "jafs-burger-380g", name: "Jafs Burger 380g", price: 180, size: "380g", signature: true },
        { id: "vegetar-burger", name: "Vegetar Burger", price: 110, vegetarian: true },
        { id: "kyllingburger", name: "Kyllingburger", price: 110, description: "Chicken burger" },
        { id: "beefburger-200g", name: "Beefburger 200g", price: 130, size: "200g" },
        { id: "jafs-burger-500g", name: "Jafs Burger 500g", price: 250, size: "500g", signature: true }
      ]
    },
    {
      id: "hamburger-meny",
      name: "Hamburger Meny",
      nameEn: "Burger Meals",
      description: "Med 0.5 ltr drikke og pommes frites",
      options: {
        addons: [
          { id: "ost-meny", name: "Ost", price: 5 },
          { id: "bacon-meny", name: "Bacon", price: 10 }
        ]
      },
      items: [
        { id: "hamburger-100g-meny", name: "Hamburger 100g meny", price: 135, size: "100g", includes: ["0.5L drink", "pommes frites"] },
        { id: "hamburger-160g-meny", name: "Hamburger 160g meny", price: 165, size: "160g", includes: ["0.5L drink", "pommes frites"] },
        { id: "hamburger-190g-meny", name: "Hamburger 190g meny", price: 175, size: "190g", includes: ["0.5L drink", "pommes frites"] },
        { id: "hamburger-250g-meny", name: "Hamburger 250g meny", price: 190, size: "250g", includes: ["0.5L drink", "pommes frites"] },
        { id: "jafs-burger-200g-meny", name: "Jafs Burger 200g meny", price: 180, size: "200g", includes: ["0.5L drink", "pommes frites"], signature: true },
        { id: "jafs-burger-320g-meny", name: "Jafs Burger 320g meny", price: 225, size: "320g", includes: ["0.5L drink", "pommes frites"], signature: true },
        { id: "jafs-burger-380g-meny", name: "Jafs Burger 380g meny", price: 235, size: "380g", includes: ["0.5L drink", "pommes frites"], signature: true },
        { id: "vegetar-burger-meny", name: "Vegetar Burger meny", price: 165, includes: ["0.5L drink", "pommes frites"], vegetarian: true },
        { id: "kyllingburger-meny", name: "Kyllingburger meny", price: 165, includes: ["0.5L drink", "pommes frites"] },
        { id: "beefburger-200g-meny", name: "Beefburger 200g meny", price: 185, size: "200g", includes: ["0.5L drink", "pommes frites"] },
        { id: "jafs-burger-500g-meny", name: "Jafs Burger 500g meny", price: 305, size: "500g", includes: ["0.5L drink", "pommes frites"], signature: true }
      ]
    },
    {
      id: "menyer",
      name: "Menyer",
      nameEn: "Meals",
      description: "Med 0.5 ltr drikke og pommes frites",
      items: [
        { id: "biffsnadder-meny", name: "Biffsnadder meny", price: 179, includes: ["0.5L drink", "pommes frites"] },
        { id: "lovstek-meny", name: "Løvstek meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "nuggets-8-meny", name: "Nuggets (8 stk) meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "fish-chips-meny", name: "Fish & chips Meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "halv-kylling-meny", name: "1/2 Grillet kylling Meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "scampisnadder-meny", name: "Scampisnadder Meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "kylling-fajitas-meny", name: "Kylling fajitas meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "kebab-kylling-mix-tallerken", name: "Kebab og kylling mix tallerken", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "kylling-meny", name: "Kylling meny", price: 169, includes: ["0.5L drink", "pommes frites"] },
        { id: "kebab-kylling-mix-meny", name: "Kebab og kylling mix meny", price: 175, includes: ["0.5L drink", "pommes frites"] }
      ]
    },
    {
      id: "diverse",
      name: "Diverse Retter",
      nameEn: "Side Dishes",
      items: [
        { id: "pommes-liten", name: "Pommes frites", price: 40, size: "regular" },
        { id: "pommes-stor", name: "Pommes frites stor", price: 70, size: "large" },
        { id: "sotpotetfries", name: "Søtpotetfries", price: 45 },
        { id: "chilli-cheese-5", name: "Chilli cheese 5 stk", price: 55, quantity: 5 },
        { id: "chilli-cheese-10", name: "Chilli cheese 10 stk", price: 95, quantity: 10 },
        { id: "jalapeno-cheese-fries", name: "Jalapeno cheese fries", price: 55 },
        { id: "lokringer-6", name: "Løkringer 6stk", price: 45, quantity: 6 },
        { id: "lokringer-12", name: "Løkringer 12stk", price: 80, quantity: 12 }
      ]
    },
    {
      id: "pizza-amerikansk",
      name: "Amerikansk Pizza",
      nameEn: "American Pizza",
      sizes: [
        { id: "medium", name: "Medium", priceModifier: 0 },
        { id: "stor", name: "Stor", priceModifier: 40 }
      ],
      items: [
        { id: "pizza-1", number: 1, name: "Las Vegas", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "biff", "løk", "kjøttboller"] },
        { id: "pizza-2", number: 2, name: "American Way", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "pepperoni", "biff"] },
        { id: "pizza-3", number: 3, name: "Tropic", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "ananas"] },
        { id: "pizza-4", number: 4, name: "Orient", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "pepperoni", "biff", "løk", "fersk paprika", "champignon"] },
        { id: "pizza-5", number: 5, name: "Pepperoni pizza", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "biff", "skinke", "champignon"] },
        { id: "pizza-6", number: 6, name: "Gressvik spesial", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "pepperoni", "biff", "bacon", "løk", "paprika", "champignon"], signature: true },
        { id: "pizza-7", number: 7, name: "Sombrero", pricesMedium: 180, pricesLarge: 220, toppings: ["tacokjøttdeig", "skinke", "biff", "løk"] },
        { id: "pizza-8", number: 8, name: "Snippen spesial", pricesMedium: 180, pricesLarge: 220, toppings: ["marinert kylling", "tomat", "bbq saus", "bacon", "pepperoni"] },
        { id: "pizza-9", number: 9, name: "Husets spesial", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "salami", "bacon", "kjøttboller", "løk", "paprika", "champignon"], signature: true },
        { id: "pizza-10", number: 10, name: "Kylling pizza", pricesMedium: 180, pricesLarge: 220, toppings: ["marinert kylling", "purre", "fersk paprika", "mais", "bbq saus"] },
        { id: "pizza-11", number: 11, name: "Florida", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "biff", "løk", "fersk paprika", "grønn chili"] },
        { id: "pizza-12", number: 12, name: "Vegetar pizza", pricesMedium: 180, pricesLarge: 220, toppings: ["fersk paprika", "løk", "champignon", "tomat", "purre", "oliven"], vegetarian: true },
        { id: "pizza-13", number: 13, name: "Viking pizza", pricesMedium: 180, pricesLarge: 220, toppings: ["ost", "skinke"] },
        { id: "pizza-14", number: 14, name: "Kebab pizza", pricesMedium: 180, pricesLarge: 220, toppings: ["mais", "løk", "kebabkjøtt", "kebabsaus"] },
        { id: "pizza-15", number: 15, name: "New York", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "salami", "løk", "kjøttboller", "paprika"] },
        { id: "pizza-16", number: 16, name: "Samba", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "løk", "bacon", "salami", "hot krydder"], spicy: true },
        { id: "pizza-17", number: 17, name: "Tacopizza", pricesMedium: 210, pricesLarge: 240, toppings: ["tacokjøttdeig", "paprika", "jalapenos", "tortillachips", "salsasaus"] },
        { id: "pizza-18", number: 18, name: "Mamma Mia", pricesMedium: 210, pricesLarge: 240, toppings: ["biff", "purre", "rødløk", "bearnaise"], includes: ["pommes frites"] },
        { id: "pizza-19", number: 19, name: "Mexicana", pricesMedium: 180, pricesLarge: 220, toppings: ["tacokjøttdeig", "bacon", "purre", "tomat", "champignon"] },
        { id: "pizza-20", number: 20, name: "Kebab pizza m/salatmix", pricesMedium: 210, pricesLarge: 240, toppings: ["kebabkjøtt", "salat", "tomat", "agurk", "mais", "kebabsaus"] },
        { id: "pizza-21", number: 21, name: "Amigo", pricesMedium: 180, pricesLarge: 220, toppings: ["pepperoni", "skinke", "tacokjøttdeig", "paprika"] },
        { id: "pizza-22", number: 22, name: "Hawaii", pricesMedium: 180, pricesLarge: 220, toppings: ["skinke", "ananas"] },
        { id: "pizza-23", number: 23, name: "Bestem selv", pricesMedium: 210, pricesLarge: 240, toppings: [], customizable: true, note: "5 pålegg valgfritt" }
      ]
    },
    {
      id: "pizza-italiensk",
      name: "Italiensk Pizza",
      nameEn: "Italian Pizza",
      sizes: [
        { id: "medium", name: "Medium", priceModifier: 0 },
        { id: "stor", name: "Stor", priceModifier: 70 }
      ],
      items: [
        { id: "pizza-24", number: 24, name: "Napoli", pricesMedium: 150, pricesLarge: 220, toppings: ["pepperoni", "salami", "løk", "bacon"] },
        { id: "pizza-25", number: 25, name: "Palermo", pricesMedium: 150, pricesLarge: 220, toppings: ["skinke"] },
        { id: "pizza-26", number: 26, name: "Capricciosa", pricesMedium: 150, pricesLarge: 220, toppings: ["skinke", "kjøttdeig", "mais"] },
        { id: "pizza-27", number: 27, name: "Valentino", pricesMedium: 150, pricesLarge: 220, toppings: ["kyllingkjøtt", "purre", "mais", "fersk paprika"] },
        { id: "pizza-28", number: 28, name: "Vesuvio", pricesMedium: 150, pricesLarge: 220, toppings: ["pepperoni", "bacon", "purre", "rødløk", "fersk paprika"] },
        { id: "pizza-29", number: 29, name: "Rose", pricesMedium: 150, pricesLarge: 220, toppings: ["biff", "skinke", "fersk paprika", "løk"] },
        { id: "pizza-30", number: 30, name: "Rindal", pricesMedium: 150, pricesLarge: 220, toppings: ["skinke", "bacon", "løk"] },
        { id: "pizza-31", number: 31, name: "Bella", pricesMedium: 150, pricesLarge: 220, toppings: ["biff", "paprika", "løk", "champignon"] },
        { id: "pizza-32", number: 32, name: "Milano", pricesMedium: 150, pricesLarge: 220, toppings: ["pepperoni", "fersk paprika", "ananas"] }
      ]
    },
    {
      id: "pizza-innbakt",
      name: "Innbakt Pizza",
      nameEn: "Calzone",
      items: [
        { id: "calzone", number: 33, name: "Calzone", price: 140, toppings: ["tomatsaus", "ost", "skinke"] },
        { id: "super-calzone", number: 34, name: "Super Calzone", price: 140, toppings: ["tomatsaus", "ost", "tacokjøtt", "champignon"] }
      ]
    },
    {
      id: "pizza-pai",
      name: "Pizza Pai",
      nameEn: "Deep Dish Pizza",
      items: [
        { id: "hot-kylling-pai", number: 35, name: "Hot kylling pai", price: 240, toppings: ["masse ost", "tomatsaus", "løk", "jalapenos", "kyllingkjøtt"], spicy: true },
        { id: "kylling-pai", number: 36, name: "Kylling pai", price: 240, toppings: ["ost", "kyllingkjøtt", "fersk champignon", "purre", "fersk paprika"] },
        { id: "kjottdeig-pai", number: 37, name: "Kjøttdeig pai", price: 240, toppings: ["ost", "kjøttdeig", "skinke", "løk", "mais", "chili"], spicy: true },
        { id: "pepperoni-pai", number: 38, name: "Pepperoni pai", price: 240, toppings: ["masse ost", "purre", "pepperoni"] },
        { id: "kebab-pai", number: 39, name: "Kebab pai", price: 240, toppings: ["masse ost", "kebabkjøtt", "mais", "løk"] }
      ]
    },
    {
      id: "tilbehor",
      name: "Tilbehør",
      nameEn: "Extras",
      items: [
        { id: "bacon", name: "Bacon", price: 10 },
        { id: "ost", name: "Ost", price: 5 },
        { id: "fetaost", name: "Fetaost", price: 20 },
        { id: "ekstra-palegg", name: "Ekstra pålegg på pizza", price: 40 },
        { id: "ekstra-kjott", name: "Ekstra kjøtt", price: 40 },
        { id: "romme-saus", name: "Rømme saus", price: 15 },
        { id: "tomat-saus", name: "Tomat saus", price: 15 }
      ]
    },
    {
      id: "drikke",
      name: "Drikke",
      nameEn: "Drinks",
      items: [
        { id: "flaske-05", name: "Flaske 0.5L", price: 35, size: "0.5L" },
        { id: "flaske-15", name: "Flaske 1.5L", price: 50, size: "1.5L" },
        { id: "milkshake", name: "Milkshake", price: 50 },
        { id: "kuli", name: "Kuli", price: 20 },
        { id: "jarritos", name: "Jarritos", price: 45 },
        { id: "monster", name: "Monster", price: 45 }
      ]
    }
  ],
  
  // Global options
  globalOptions: {
    glutenFree: {
      available: true,
      additionalCost: 190,
      note: "Alle pizzaer kan lages glutenfri kr 190,-"
    }
  }
};

// Helper function to search menu items
export const searchMenuItem = (query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  for (const category of menu.categories) {
    for (const item of category.items) {
      const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
      const toppingsMatch = item.toppings?.some(t => t.toLowerCase().includes(normalizedQuery));
      
      if (nameMatch || toppingsMatch) {
        results.push({
          ...item,
          category: category.name,
          categoryId: category.id
        });
      }
    }
  }
  
  return results;
};

// Helper to get item by ID
export const getMenuItemById = (itemId) => {
  for (const category of menu.categories) {
    const item = category.items.find(i => i.id === itemId);
    if (item) {
      return { ...item, category: category.name, categoryId: category.id };
    }
  }
  return null;
};

// Get all items as flat list
export const getAllItems = () => {
  const items = [];
  for (const category of menu.categories) {
    for (const item of category.items) {
      items.push({
        ...item,
        category: category.name,
        categoryId: category.id
      });
    }
  }
  return items;
};

export default menu;
