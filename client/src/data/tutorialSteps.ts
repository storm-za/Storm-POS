export interface TutorialStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const englishTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    target: '.company-banner',
    title: 'Welcome to Storm POS!',
    description: 'This is your command center. Let\'s explore the key features that will help you run your business efficiently.',
    position: 'bottom'
  },
  {
    id: 'navigation',
    target: '.tabs-navigation',
    title: 'Navigation Tabs',
    description: 'These tabs give you access to all POS functions: Sales, Products, Customers, Open Accounts, Reports, and Usage tracking.',
    position: 'bottom'
  },
  {
    id: 'sales-tab',
    target: '[data-testid="tab-sales"]',
    title: 'Sales Tab - Your Main Workspace',
    description: 'This is where you\'ll process most transactions. Add products to cart, apply discounts, and complete sales.',
    position: 'bottom'
  },
  {
    id: 'product-selection',
    target: '[data-testid="product-selection-card"]',
    title: 'Product Selection',
    description: 'Browse and search your inventory here. Click any product to add it to the current sale.',
    position: 'right'
  },
  {
    id: 'current-sale',
    target: '[data-testid="current-sale-card"]',
    title: 'Current Sale Cart',
    description: 'Your active sale appears here. Adjust quantities, select customers, choose payment methods, and complete transactions.',
    position: 'left'
  },
  {
    id: 'products-tab',
    target: '[data-testid="tab-products"]',
    title: 'Products Management',
    description: 'Manage your inventory here - add new products, edit prices, track stock levels, and organize your catalog.',
    position: 'bottom'
  },
  {
    id: 'customers-tab',
    target: '[data-testid="tab-customers"]',
    title: 'Customer Management',
    description: 'Store customer information, manage trade vs retail customers, and track customer purchase history.',
    position: 'bottom'
  },
  {
    id: 'open-accounts',
    target: '[data-testid="tab-open-accounts"]',
    title: 'Open Accounts',
    description: 'Handle table service or customer accounts. Create running tabs that can be paid later.',
    position: 'bottom'
  },
  {
    id: 'reports',
    target: '[data-testid="tab-reports"]',
    title: 'Reports & Analytics',
    description: 'View detailed sales reports, track daily performance, analyze trends, and monitor your business growth.',
    position: 'bottom'
  },
  {
    id: 'usage',
    target: '[data-testid="tab-usage"]',
    title: 'Usage & Billing',
    description: 'Monitor your Storm POS service usage and billing information. Track your 0.5% monthly fee.',
    position: 'bottom'
  },
  {
    id: 'staff-management',
    target: '[data-testid="staff-dropdown"]',
    title: 'Staff Management',
    description: 'Switch between staff accounts, create management accounts, and control access levels.',
    position: 'bottom'
  },
  {
    id: 'profile-menu',
    target: '[data-testid="profile-dropdown"]',
    title: 'Profile & Settings',
    description: 'Access your profile settings, change your company logo, switch languages, or log out.',
    position: 'bottom'
  },
  {
    id: 'complete',
    target: '.company-banner',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tour! Start by adding some products, then begin processing your first sale. You can replay this tutorial anytime from the Tutorial button.',
    position: 'center'
  }
];

export const afrikaansTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    target: '.company-banner',
    title: 'Welkom by Storm POS!',
    description: 'Dit is jou beheersentrum. Kom ons verken die kernfunksies wat jou sal help om jou besigheid doeltreffend te bestuur.',
    position: 'bottom'
  },
  {
    id: 'navigation',
    target: '.tabs-navigation',
    title: 'Navigasie Afdelings',
    description: 'Hierdie afdelings gee jou toegang tot alle POS-funksies: Verkope, Produkte, Kliënte, Oop Rekeninge, Verslae, en Gebruiksdata.',
    position: 'bottom'
  },
  {
    id: 'sales-tab',
    target: '[data-testid="tab-sales"]',
    title: 'Verkope Afdeling - Jou Hoof Werkspasie',
    description: 'Hier verwerk jy die meeste transaksies. Voeg produkte by die winkelmandjie, pas afslag toe, en voltooi verkope.',
    position: 'bottom'
  },
  {
    id: 'product-selection',
    target: '[data-testid="product-selection-card"]',
    title: 'Produkkeuse',
    description: 'Blaai deur jou voorraad en soek hier. Kliek op enige produk om dit by die huidige verkoop te voeg.',
    position: 'right'
  },
  {
    id: 'current-sale',
    target: '[data-testid="current-sale-card"]',
    title: 'Huidige Winkelmandjie',
    description: 'Jou aktiewe verkoop verskyn hier. Pas hoeveelhede aan, kies kliënte, kies betaalmetodes, en voltooi transaksies.',
    position: 'left'
  },
  {
    id: 'products-tab',
    target: '[data-testid="tab-products"]',
    title: 'Produkbestuur',
    description: 'Bestuur jou voorraad hier - voeg nuwe produkte by, wysig pryse, hou voorraadvlakke dop, en organiseer jou katalogus.',
    position: 'bottom'
  },
  {
    id: 'customers-tab',
    target: '[data-testid="tab-customers"]',
    title: 'Kliëntebestuur',
    description: 'Stoor kliëntinligting, bestuur handels- vs kleinhandelkliënte, en hou kliënte se aankoopgeskiedenis dop.',
    position: 'bottom'
  },
  {
    id: 'open-accounts',
    target: '[data-testid="tab-open-accounts"]',
    title: 'Oop Rekeninge',
    description: 'Hanteer tafelbediening of kliënterekeninge. Skep lopende rekeninge wat later betaal kan word.',
    position: 'bottom'
  },
  {
    id: 'reports',
    target: '[data-testid="tab-reports"]',
    title: 'Verslae & Ontleding',
    description: 'Bekyk gedetailleerde verkopeverslae, hou daaglikse prestasie dop, ontleed tendense, en monitor jou besigheidsgroei.',
    position: 'bottom'
  },
  {
    id: 'usage',
    target: '[data-testid="tab-usage"]',
    title: 'Gebruik & Fakturering',
    description: 'Hou jou Storm POS diensgebruik en faktureringsinligting dop. Volg jou 0.5% maandelikse fooi.',
    position: 'bottom'
  },
  {
    id: 'staff-management',
    target: '[data-testid="staff-dropdown"]',
    title: 'Personeelbestuur',
    description: 'Wissel tussen personeelrekeninge, skep bestuursrekeninge, en beheer toegangsvlakke.',
    position: 'bottom'
  },
  {
    id: 'profile-menu',
    target: '[data-testid="profile-dropdown"]',
    title: 'Profiel & Instellings',
    description: 'Kry toegang tot jou profielinstellings, verander jou maatskappy se logo, wissel tale, of meld af.',
    position: 'bottom'
  },
  {
    id: 'complete',
    target: '.company-banner',
    title: 'Jy is Klaar!',
    description: 'Jy het die toer voltooi! Begin deur \"n paar produkte by te voeg, dan kan jy jou eerste verkoop verwerk. Jy kan hierdie tutoriaal enige tyd herhaal vanaf die Tutoriaal-knoppie.',
    position: 'center'
  }
];