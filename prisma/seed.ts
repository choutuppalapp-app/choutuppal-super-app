import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.bannerAd.deleteMany()
  await prisma.spinPrize.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.news.deleteMany()
  await prisma.story.deleteMany()
  await prisma.review.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.coinTransaction.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.realEstateListing.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.pushSubscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()

  // ─── Cities ────────────────────────────────────────
  console.log('Creating cities...')
  const choutuppal = await prisma.city.create({
    data: {
      name: 'Choutuppal',
      slug: 'choutuppal',
      state: 'Telangana',
      heroImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574535ed5?w=1200',
    },
  })

  const hyderabad = await prisma.city.create({
    data: {
      name: 'Hyderabad',
      slug: 'hyderabad',
      state: 'Telangana',
      heroImageUrl: 'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=1200',
    },
  })

  const warangal = await prisma.city.create({
    data: {
      name: 'Warangal',
      slug: 'warangal',
      state: 'Telangana',
      heroImageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
    },
  })

  // ─── Users ─────────────────────────────────────────
  console.log('Creating users...')
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      phone: '9999999999',
      email: 'admin@choutuppal.com',
      role: 'admin',
      subscriptionTier: 'premium',
      coinsBalance: 5000,
      whatsappNumber: '919999999999',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  })

  const ramesh = await prisma.user.create({
    data: {
      fullName: 'Ramesh Kumar',
      phone: '8888888881',
      email: 'ramesh@choutuppal.com',
      role: 'business',
      cityId: choutuppal.id,
      subscriptionTier: 'pro',
      coinsBalance: 1200,
      whatsappNumber: '918888888881',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  })

  const suresh = await prisma.user.create({
    data: {
      fullName: 'Suresh Reddy',
      phone: '8888888882',
      email: 'suresh@choutuppal.com',
      role: 'business',
      cityId: choutuppal.id,
      subscriptionTier: 'premium',
      coinsBalance: 2500,
      whatsappNumber: '918888888882',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  })

  const lakshmi = await prisma.user.create({
    data: {
      fullName: 'Lakshmi Devi',
      phone: '8888888883',
      email: 'lakshmi@choutuppal.com',
      role: 'business',
      cityId: choutuppal.id,
      subscriptionTier: 'pro',
      coinsBalance: 800,
      whatsappNumber: '918888888883',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  })

  const priya = await prisma.user.create({
    data: {
      fullName: 'Priya Sharma',
      phone: '7777777771',
      email: 'priya@choutuppal.com',
      role: 'user',
      cityId: choutuppal.id,
      subscriptionTier: 'free',
      coinsBalance: 350,
      whatsappNumber: '917777777771',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  })

  // ─── Listings ──────────────────────────────────────
  console.log('Creating listings...')
  const listingsData = [
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      slug: 'sri-venkateswara-tiffin-center',
      name: 'Sri Venkateswara Tiffin Center',
      category: 'tiffin',
      description:
        'Famous for authentic South Indian tiffin items. Serving crispy dosas, fluffy idlis, and piping hot vadas since 2005. A must-visit breakfast spot in Choutuppal town center.',
      services: JSON.stringify([
        { name: 'Masala Dosa', price: '₹60' },
        { name: 'Idli Sambar (2 pcs)', price: '₹40' },
        { name: 'Vada Sambar (2 pcs)', price: '₹50' },
        { name: 'Upma', price: '₹35' },
        { name: 'Pesarattu', price: '₹55' },
        { name: 'Filter Coffee', price: '₹20' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
      ]),
      whatsappNumber: '918888888881',
      address: 'Main Road, Near Bus Stand, Choutuppal, Telangana 508252',
      latitude: 17.2985,
      longitude: 78.9256,
      isApproved: true,
      isFeatured: true,
      isPremium: false,
      viewsCount: 1240,
      operatingHours: '6:00 AM - 10:00 PM',
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      slug: 'city-medical-store',
      name: 'City Medical Store',
      category: 'medical',
      description:
        'Your trusted neighborhood pharmacy offering a wide range of medicines, health products, and medical supplies. Open late with home delivery available within Choutuppal.',
      services: JSON.stringify([
        { name: 'Prescription Medicines', price: 'Variable' },
        { name: 'OTC Medicines', price: '₹50+' },
        { name: 'First Aid Kit', price: '₹250' },
        { name: 'Health Checkup (BP, Sugar)', price: '₹100' },
        { name: 'Home Delivery', price: 'Free' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800',
        'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800',
      ]),
      whatsappNumber: '918888888882',
      address: 'Market Center, Choutuppal, Telangana 508252',
      latitude: 17.2992,
      longitude: 78.9261,
      isApproved: true,
      isFeatured: true,
      isPremium: false,
      viewsCount: 980,
      operatingHours: '8:00 AM - 11:00 PM',
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      slug: 'lakshmi-beauty-salon',
      name: 'Lakshmi Beauty Salon',
      category: 'salon',
      description:
        'Premium beauty salon offering hair styling, facials, bridal makeup, and beauty treatments. Expert stylists with modern equipment. Walk-ins and appointments welcome.',
      services: JSON.stringify([
        { name: 'Haircut (Women)', price: '₹200' },
        { name: 'Facial', price: '₹350' },
        { name: 'Bridal Makeup', price: '₹5000' },
        { name: 'Hair Coloring', price: '₹800' },
        { name: 'Manicure & Pedicure', price: '₹500' },
        { name: 'Waxing (Full)', price: '₹600' },
        { name: 'Eyebrow Threading', price: '₹50' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800',
      ]),
      whatsappNumber: '918888888883',
      address: 'Temple Road, Near Hanuman Temple, Choutuppal, Telangana 508252',
      latitude: 17.2978,
      longitude: 78.9245,
      isApproved: true,
      isFeatured: false,
      isPremium: true,
      viewsCount: 2100,
      operatingHours: '9:00 AM - 8:00 PM',
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      slug: 'raju-plumbing-services',
      name: 'Raju Plumbing Services',
      category: 'plumber',
      description:
        'Reliable plumbing services for residential and commercial properties in Choutuppal. From leaky taps to complete pipeline installation, we handle it all with expertise.',
      services: JSON.stringify([
        { name: 'Tap Repair', price: '₹150' },
        { name: 'Pipe Fitting', price: '₹300' },
        { name: 'Water Tank Installation', price: '₹1500' },
        { name: 'Bathroom Fitting', price: '₹2000' },
        { name: 'Drain Cleaning', price: '₹250' },
        { name: 'Motor Repair', price: '₹500' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
      ]),
      whatsappNumber: '918888888881',
      address: 'Colony Area, Choutuppal, Telangana 508252',
      latitude: 17.3001,
      longitude: 78.9275,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 650,
      operatingHours: '7:00 AM - 9:00 PM',
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      slug: 'krishna-real-estate',
      name: 'Krishna Real Estate',
      category: 'realestate',
      description:
        'Leading real estate consultancy in Choutuppal. Buy, sell, or rent properties with confidence. Expert advice on plots, flats, villas, and commercial spaces.',
      services: JSON.stringify([
        { name: 'Property Consultation', price: 'Free' },
        { name: 'Property Listing', price: '₹500' },
        { name: 'Legal Verification', price: '₹3000' },
        { name: 'Property Valuation', price: '₹1000' },
        { name: 'Rental Agreement', price: '₹2000' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      ]),
      whatsappNumber: '918888888882',
      address: 'Main Road, Opposite Bus Stand, Choutuppal, Telangana 508252',
      latitude: 17.2988,
      longitude: 78.9259,
      isApproved: true,
      isFeatured: true,
      isPremium: false,
      viewsCount: 1800,
      operatingHours: '9:00 AM - 7:00 PM',
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      slug: 'choutuppal-xerox-internet',
      name: 'Choutuppal Xerox & Internet',
      category: 'services',
      description:
        'One-stop shop for all your documentation and internet needs. Xerox, scanning, printing, lamination, and high-speed internet browsing available.',
      services: JSON.stringify([
        { name: 'Xerox (Per Page)', price: '₹2' },
        { name: 'Color Print (Per Page)', price: '₹10' },
        { name: 'Lamination', price: '₹30' },
        { name: 'Scanning', price: '₹20' },
        { name: 'Internet Browsing (Per Hour)', price: '₹30' },
        { name: 'Passport Photo', price: '₹50' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800',
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      ]),
      whatsappNumber: '918888888883',
      address: 'Near Post Office, Choutuppal, Telangana 508252',
      latitude: 17.2980,
      longitude: 78.9250,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 420,
      operatingHours: '8:00 AM - 9:00 PM',
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      slug: 'annapurna-mess',
      name: 'Annapurna Mess',
      category: 'tiffin',
      description:
        'Home-style meals served fresh daily. Famous for our unlimited meals plate with rice, dal, sambar, curd, and pickle. Clean and hygienic dining experience.',
      services: JSON.stringify([
        { name: 'Unlimited Meals', price: '₹120' },
        { name: 'Mini Meals', price: '₹80' },
        { name: 'Biryani (Veg)', price: '₹150' },
        { name: 'Biryani (Chicken)', price: '₹200' },
        { name: 'Curd Rice', price: '₹60' },
        { name: 'Roti Curry', price: '₹70' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
      ]),
      whatsappNumber: '918888888881',
      address: 'Old Bus Stand Road, Choutuppal, Telangana 508252',
      latitude: 17.2975,
      longitude: 78.9268,
      isApproved: true,
      isFeatured: false,
      isPremium: true,
      viewsCount: 1650,
      operatingHours: '11:00 AM - 3:00 PM, 7:00 PM - 10:30 PM',
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      slug: 'sai-electronics',
      name: 'Sai Electronics',
      category: 'electronics',
      description:
        'Your one-stop electronics store in Choutuppal. Mobile phones, accessories, home appliances, and repair services. Authorized dealer for top brands.',
      services: JSON.stringify([
        { name: 'Mobile Screen Repair', price: '₹500' },
        { name: 'Battery Replacement', price: '₹300' },
        { name: 'TV Repair', price: '₹800' },
        { name: 'AC Service', price: '₹600' },
        { name: 'Laptop Repair', price: '₹1000' },
        { name: 'Mobile Accessories', price: '₹100+' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
      ]),
      whatsappNumber: '918888888882',
      address: 'Market Road, Choutuppal, Telangana 508252',
      latitude: 17.2995,
      longitude: 78.9248,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 780,
      operatingHours: '9:00 AM - 9:30 PM',
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      slug: 'sree-rama-automobiles',
      name: 'Sree Rama Automobiles',
      category: 'automobile',
      description:
        'Complete automobile service center offering bike and car servicing, spare parts, and accessories. Experienced mechanics with genuine parts guarantee.',
      services: JSON.stringify([
        { name: 'Bike Service', price: '₹400' },
        { name: 'Car Service', price: '₹1500' },
        { name: 'Oil Change (Bike)', price: '₹250' },
        { name: 'Tyre Replacement', price: '₹800+' },
        { name: 'Battery Replacement', price: '₹1200+' },
        { name: 'General Checkup', price: '₹200' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
        'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
      ]),
      whatsappNumber: '918888888883',
      address: 'Highway Road, Choutuppal, Telangana 508252',
      latitude: 17.3010,
      longitude: 78.9285,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 530,
      operatingHours: '8:00 AM - 8:00 PM',
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      slug: 'padmavathi-tailors',
      name: 'Padmavathi Tailors',
      category: 'tailor',
      description:
        'Expert tailoring for men and women. Custom stitching, alterations, and designer wear. Specializing in traditional Telangana attire and modern fashion.',
      services: JSON.stringify([
        { name: 'Shirt Stitching', price: '₹300' },
        { name: 'Pant Stitching', price: '₹250' },
        { name: 'Blouse Stitching', price: '₹200' },
        { name: 'Salwar Kameez', price: '₹500' },
        { name: 'Alterations', price: '₹100+' },
        { name: 'Lehenga Stitching', price: '₹2000' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
        'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=800',
      ]),
      whatsappNumber: '918888888881',
      address: 'Temple Road, Choutuppal, Telangana 508252',
      latitude: 17.2982,
      longitude: 78.9242,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 390,
      operatingHours: '9:00 AM - 8:00 PM',
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      slug: 'ganesh-hardware',
      name: 'Ganesh Hardware',
      category: 'hardware',
      description:
        'Complete hardware store for construction and home improvement. Cement, steel, paints, plumbing materials, electrical supplies, and tools all under one roof.',
      services: JSON.stringify([
        { name: 'Cement (Per Bag)', price: '₹380' },
        { name: 'Steel (Per Kg)', price: '₹65' },
        { name: 'Paint (Per Litre)', price: '₹250+' },
        { name: 'Electrical Fittings', price: '₹50+' },
        { name: 'Plumbing Materials', price: '₹20+' },
        { name: 'Tools & Equipment', price: '₹100+' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
      ]),
      whatsappNumber: '918888888882',
      address: 'Main Road, Near RTC Bus Stand, Choutuppal, Telangana 508252',
      latitude: 17.2991,
      longitude: 78.9263,
      isApproved: true,
      isFeatured: false,
      isPremium: false,
      viewsCount: 340,
      operatingHours: '7:30 AM - 8:30 PM',
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      slug: 'vijaya-educational-academy',
      name: 'Vijaya Educational Academy',
      category: 'education',
      description:
        'Premier coaching institute for school students and competitive exam preparation. Experienced faculty, personalized attention, and proven track record of results.',
      services: JSON.stringify([
        { name: 'Tuition (Class 6-10)', price: '₹1500/month' },
        { name: 'Inter Coaching', price: '₹3000/month' },
        { name: 'Spoken English', price: '₹2000/month' },
        { name: 'Computer Basics', price: '₹2500/month' },
        { name: 'Competitive Exam Prep', price: '₹4000/month' },
        { name: 'Handwriting Improvement', price: '₹1000/month' },
      ]),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
      ]),
      whatsappNumber: '918888888883',
      address: 'School Road, Choutuppal, Telangana 508252',
      latitude: 17.2970,
      longitude: 78.9255,
      isApproved: true,
      isFeatured: false,
      isPremium: true,
      viewsCount: 890,
      operatingHours: '6:00 AM - 9:00 PM',
    },
  ]

  const createdListings: Awaited<ReturnType<typeof prisma.listing.create>>[] = []
  for (const data of listingsData) {
    const listing = await prisma.listing.create({ data })
    createdListings.push(listing)
  }

  // ─── Real Estate Listings ──────────────────────────
  console.log('Creating real estate listings...')
  const reListings = [
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: '2BHK Flat for Sale',
      price: '₹35,00,000',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      ]),
      ownerPhone: '918888888882',
      address: 'Sai Residency, Near Bus Stand, Choutuppal, Telangana 508252',
      bedroomCount: 2,
      area: '1050 sq.ft',
      isApproved: true,
      isFeatured: true,
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: '3BHK Villa with Garden',
      price: '₹85,00,000',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ]),
      ownerPhone: '918888888882',
      address: 'Highway Road, Choutuppal, Telangana 508252',
      bedroomCount: 3,
      area: '2400 sq.ft',
      isApproved: true,
      isFeatured: true,
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Open Plot - 200 Sq.Yards',
      price: '₹22,00,000',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      ]),
      ownerPhone: '918888888881',
      address: 'Vaddera Colony, Choutuppal, Telangana 508252',
      bedroomCount: null,
      area: '200 sq.yards',
      isApproved: true,
      isFeatured: false,
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Commercial Space for Rent',
      price: '₹25,000/month',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
      ]),
      ownerPhone: '918888888881',
      address: 'Main Road, Opposite Bus Stand, Choutuppal, Telangana 508252',
      bedroomCount: null,
      area: '500 sq.ft',
      isApproved: true,
      isFeatured: false,
    },
  ]

  for (const data of reListings) {
    await prisma.realEstateListing.create({ data })
  }

  // ─── Stories ───────────────────────────────────────
  console.log('Creating stories...')
  const storiesData = [
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Grand Opening - Sri Venkateswara Tiffin Center New Branch!',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      isPremium: false,
      viewsCount: 320,
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      title: 'Bridal Season Special - 50% Off at Lakshmi Beauty Salon',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      isPremium: true,
      viewsCount: 580,
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: 'New Plot Listings Near Highway - Starting ₹10L',
      imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      isPremium: false,
      viewsCount: 450,
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Annapurna Mess - Now Delivering via WhatsApp!',
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      isPremium: false,
      viewsCount: 210,
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      title: 'Vijaya Academy - Top Results in Board Exams!',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
      isPremium: true,
      viewsCount: 670,
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: 'City Medical Store - Free Health Checkup Camp This Sunday',
      imageUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600',
      isPremium: false,
      viewsCount: 340,
    },
  ]

  for (const data of storiesData) {
    await prisma.story.create({ data })
  }

  // ─── News ──────────────────────────────────────────
  console.log('Creating news...')
  const newsData = [
    {
      cityId: choutuppal.id,
      title: 'Choutuppal Municipality Approves New Road Widening Project',
      content:
        'The Choutuppal Municipality has approved a ₹15 crore road widening project for the Main Road stretch from Bus Stand to Highway Junction. The project is expected to be completed within 18 months and will ease traffic congestion in the town center. Local businesses have welcomed the move while requesting minimal disruption during construction.',
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
      source: 'Telangana Today',
      isPublished: true,
    },
    {
      cityId: choutuppal.id,
      title: 'New Water Supply Scheme to Benefit 10,000 Households',
      content:
        'The state government has sanctioned a new water supply scheme for Choutuppal under the Mission Bhagiratha program. The scheme will provide clean drinking water to over 10,000 households in the town and surrounding areas. Pipeline laying work has already begun and is expected to be completed by March next year.',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
      source: 'Eenadu',
      isPublished: true,
    },
    {
      cityId: choutuppal.id,
      title: 'Choutuppal RDO Office Inaugurates Digital Services Center',
      content:
        'The RDO office in Choutuppal has inaugurated a new digital services center that will allow citizens to access various government services online. Services include land records, certificates, and pension applications. The center is equipped with 20 computers and trained staff to assist the public.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      source: 'Namaste Telangana',
      isPublished: true,
    },
    {
      cityId: choutuppal.id,
      title: 'Annual Choutuppal Jatara Festival Draws Record Crowds',
      content:
        'The annual Choutuppal Jatara festival celebrated at the ancient Sri Rama Temple drew record crowds this year with over 50,000 devotees attending the three-day event. The festival featured cultural programs, traditional dances, and a grand procession. Local authorities made elaborate arrangements for crowd management and security.',
      imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800',
      source: 'Sakshi',
      isPublished: true,
    },
  ]

  for (const data of newsData) {
    await prisma.news.create({ data })
  }

  // ─── Reviews ───────────────────────────────────────
  console.log('Creating reviews...')
  const reviewsData = [
    {
      userId: priya.id,
      listingId: createdListings[0].id,
      rating: 5,
      comment: 'Best tiffin center in Choutuppal! The masala dosa is amazing and the chutney varieties are excellent. Must try their filter coffee.',
    },
    {
      userId: priya.id,
      listingId: createdListings[1].id,
      rating: 4,
      comment: 'Good medical store with almost all medicines available. Home delivery is a great feature. Prices are reasonable.',
    },
    {
      userId: priya.id,
      listingId: createdListings[2].id,
      rating: 5,
      comment: 'Lakshmi didi is an expert! My bridal makeup was perfect. Very professional and hygienic salon. Highly recommended for bridal packages.',
    },
    {
      userId: admin.id,
      listingId: createdListings[0].id,
      rating: 4,
      comment: 'Consistent quality and taste. The place is always clean. Only issue is parking space during peak hours.',
    },
    {
      userId: priya.id,
      listingId: createdListings[6].id,
      rating: 5,
      comment: 'Home-style food at affordable prices. The unlimited meals plate is great value for money. Dal and sambar taste just like home!',
    },
    {
      userId: admin.id,
      listingId: createdListings[2].id,
      rating: 4,
      comment: 'Good salon with modern equipment. Staff is friendly and skilled. A bit expensive compared to others in the area.',
    },
    {
      userId: priya.id,
      listingId: createdListings[11].id,
      rating: 5,
      comment: 'Excellent coaching center! My daughter improved her grades significantly after joining. Teachers are very dedicated and supportive.',
    },
    {
      userId: admin.id,
      listingId: createdListings[4].id,
      rating: 4,
      comment: 'Knowledgeable real estate agent. Helped us find the right plot within our budget. Legal verification service is very useful.',
    },
  ]

  for (const data of reviewsData) {
    await prisma.review.create({ data })
  }

  // ─── Spin Prizes ───────────────────────────────────
  console.log('Creating spin prizes...')
  const spinPrizes = [
    { label: '50 Coins', prizeType: 'coins', prizeValue: 50, probability: 0.2, color: '#D4AF37' },
    { label: '100 Coins', prizeType: 'coins', prizeValue: 100, probability: 0.15, color: '#E8C547' },
    { label: '₹50 Discount', prizeType: 'discount', prizeValue: 50, probability: 0.1, color: '#4CAF50' },
    { label: 'Free Listing Day', prizeType: 'free_listing', prizeValue: 1, probability: 0.05, color: '#FF6B6B' },
    { label: '200 Coins', prizeType: 'coins', prizeValue: 200, probability: 0.08, color: '#FFD700' },
    { label: '₹100 Discount', prizeType: 'discount', prizeValue: 100, probability: 0.07, color: '#2196F3' },
    { label: '10 Coins', prizeType: 'coins', prizeValue: 10, probability: 0.25, color: '#FF9800' },
    { label: 'Try Again', prizeType: 'none', prizeValue: 0, probability: 0.1, color: '#9E9E9E' },
  ]

  for (const data of spinPrizes) {
    await prisma.spinPrize.create({ data })
  }

  // ─── Site Settings ─────────────────────────────────
  console.log('Creating site settings...')
  await prisma.siteSetting.create({
    data: {
      logoUrl: '/logo.png',
      affiliateBaseUrl: 'https://choutuppal.com',
      heroHeadline: 'Discover Choutuppal — Your Town, One App',
      heroDescription:
        'Find the best local businesses, services, real estate, news, and more — all in one super app built for Choutuppal.',
      primaryColor: '#D4AF37',
      accentColor: '#4169E1',
    },
  })

  // ─── Banner Ads ────────────────────────────────────
  console.log('Creating banner ads...')
  const bannerAds = [
    {
      title: 'List Your Business Free — Reach 50,000+ Choutuppal Users!',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
      linkUrl: '/business/signup',
      cityId: choutuppal.id,
      isActive: true,
    },
    {
      title: 'Premium Listings Get 3x More Enquiries — Upgrade Now!',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      linkUrl: '/premium',
      cityId: choutuppal.id,
      isActive: true,
    },
    {
      title: 'Spin & Win Daily Coins — Redeem for Discounts & Free Listings',
      imageUrl: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=1200',
      linkUrl: '/spin',
      cityId: choutuppal.id,
      isActive: true,
    },
  ]

  for (const data of bannerAds) {
    await prisma.bannerAd.create({ data })
  }

  // ─── Coin Transactions ─────────────────────────────
  console.log('Creating coin transactions...')
  const coinTransactions = [
    { userId: priya.id, amount: 50, reason: 'Daily login reward' },
    { userId: priya.id, amount: 100, reason: 'Spin wheel prize' },
    { userId: priya.id, amount: 200, reason: 'Referral bonus' },
    { userId: ramesh.id, amount: 500, reason: 'Premium subscription bonus' },
    { userId: ramesh.id, amount: -100, reason: 'Redeemed for discount' },
    { userId: suresh.id, amount: 1000, reason: 'Premium subscription bonus' },
    { userId: suresh.id, amount: -200, reason: 'Featured listing upgrade' },
    { userId: lakshmi.id, amount: 300, reason: 'Pro subscription bonus' },
    { userId: priya.id, amount: 10, reason: 'Daily login reward' },
  ]

  for (const data of coinTransactions) {
    await prisma.coinTransaction.create({ data })
  }

  // ─── Subscriptions ─────────────────────────────────
  console.log('Creating subscriptions...')
  await prisma.subscription.create({
    data: {
      userId: ramesh.id,
      plan: 'pro',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    },
  })
  await prisma.subscription.create({
    data: {
      userId: suresh.id,
      plan: 'premium',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    },
  })
  await prisma.subscription.create({
    data: {
      userId: lakshmi.id,
      plan: 'pro',
      status: 'active',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2026-01-31'),
    },
  })

  // ─── Leads ─────────────────────────────────────────
  console.log('Creating leads...')
  const leadsData = [
    {
      listingId: createdListings[0].id,
      userId: priya.id,
      customerPhone: '917777777771',
      customerName: 'Priya Sharma',
      requirementText: 'Want to book a table for 5 people for breakfast tomorrow',
      source: 'whatsapp',
      status: 'contacted',
    },
    {
      listingId: createdListings[2].id,
      userId: priya.id,
      customerPhone: '917777777771',
      customerName: 'Priya Sharma',
      requirementText: 'Need bridal makeup appointment for Dec 15th',
      source: 'form',
      status: 'new',
    },
    {
      listingId: createdListings[4].id,
      userId: null,
      customerPhone: '919876543210',
      customerName: 'Venkat Rao',
      requirementText: 'Looking for 2BHK flat within 40 lakhs',
      source: 'enquiry',
      status: 'converted',
    },
    {
      listingId: createdListings[1].id,
      userId: null,
      customerPhone: '919123456789',
      customerName: 'Anitha Reddy',
      requirementText: 'Need monthly medicine supply for diabetes',
      source: 'whatsapp',
      status: 'new',
    },
    {
      listingId: createdListings[3].id,
      userId: priya.id,
      customerPhone: '917777777771',
      customerName: 'Priya Sharma',
      requirementText: 'Bathroom tap leaking, need urgent repair',
      source: 'form',
      status: 'contacted',
    },
  ]

  for (const data of leadsData) {
    await prisma.lead.create({ data })
  }

  console.log('\n✅ Seeding complete!')
  console.log(`   Cities: 3`)
  console.log(`   Users: 5`)
  console.log(`   Listings: 12`)
  console.log(`   Real Estate Listings: 4`)
  console.log(`   Stories: 6`)
  console.log(`   News: 4`)
  console.log(`   Reviews: 8`)
  console.log(`   Spin Prizes: 8`)
  console.log(`   Site Settings: 1`)
  console.log(`   Banner Ads: 3`)
  console.log(`   Coin Transactions: 9`)
  console.log(`   Subscriptions: 3`)
  console.log(`   Leads: 5`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
