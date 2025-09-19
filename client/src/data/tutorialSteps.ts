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
    title: 'Navigasie Oortjies',
    description: 'Hierdie oortjies gee jou toegang tot alle POS-funksies: Verkope, Produkte, Kliënte, Oop Rekeninge, Verslae, en Gebruiksnakoming.',
    position: 'bottom'
  },
  {
    id: 'sales-tab',
    target: '[data-testid="tab-sales"]',
    title: 'Verkope Oortjie - Jou Hoof Werkspasie',
    description: 'Hier sal jy die meeste transaksies verwerk. Voeg produkte by die mandjie, pas afslag toe, en voltooi verkope.',
    position: 'bottom'
  },
  {
    id: 'product-selection',
    target: '[data-testid="product-selection-card"]',
    title: 'Produk Keuse',
    description: 'Blaai en soek jou voorraad hier. Kliek op enige produk om dit by die huidige verkoop te voeg.',
    position: 'right'
  },
  {
    id: 'current-sale',
    target: '[data-testid="current-sale-card"]',
    title: 'Huidige Verkoop Mandjie',
    description: 'Jou aktiewe verkoop verskyn hier. Stel hoeveelhede aan, kies kliënte, kies betaalmetodes, en voltooi transaksies.',
    position: 'left'
  },
  {
    id: 'products-tab',
    target: '[data-testid="tab-products"]',
    title: 'Produk Bestuur',
    description: 'Bestuur jou voorraad hier - voeg nuwe produkte by, wysig pryse, volg voorraadvlakke, en organiseer jou katalogus.',
    position: 'bottom'
  },
  {
    id: 'customers-tab',
    target: '[data-testid="tab-customers"]',
    title: 'Kliënt Bestuur',
    description: 'Stoor kliënt inligting, bestuur handels- vs kleinhandel kliënte, en volg kliënt aankoopgeskiedenis.',
    position: 'bottom'
  },
  {
    id: 'open-accounts',
    target: '[data-testid="tab-open-accounts"]',
    title: 'Oop Rekeninge',
    description: 'Hanteer tafelbediening of kliënt rekeninge. Skep lopende rekening wat later betaal kan word.',
    position: 'bottom'
  },
  {
    id: 'reports',
    target: '[data-testid="tab-reports"]',
    title: 'Verslae & Analise',
    description: 'Bekyk gedetailleerde verkope verslae, volg daaglikse prestasie, analiseer tendense, en monitor jou besigheidsgroei.',
    position: 'bottom'
  },
  {
    id: 'usage',
    target: '[data-testid="tab-usage"]',
    title: 'Gebruik & Fakturering',
    description: 'Monitor jou Storm POS diens gebruik en faktureringsinligting. Volg jou 0.5% maandelikse fooi.',
    position: 'bottom'
  },
  {
    id: 'staff-management',
    target: '[data-testid="staff-dropdown"]',
    title: 'Personeel Bestuur',
    description: 'Wissel tussen personeelrekeninge, skep bestuursrekeninge, en beheer toegangsvlakke.',
    position: 'bottom'
  },
  {
    id: 'profile-menu',
    target: '[data-testid="profile-dropdown"]',
    title: 'Profiel & Instellings',
    description: 'Kry toegang tot jou profiel instellings, verander jou maatskappy logo, wissel tale, of meld af.',
    position: 'bottom'
  },
  {
    id: 'complete',
    target: '.company-banner',
    title: 'Jy is Alles Gereed!',
    description: 'Jy het die toer voltooi! Begin deur \'n paar produkte by te voeg, dan begin om jou eerste verkoop te verwerk. Jy kan hierdie tutoriaal enige tyd herhaal vanaf die Tutoriaal knoppie.',
    position: 'center'
  }
];