import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.verificationRequest.deleteMany()
  await prisma.like.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.adminRequest.deleteMany()
  await prisma.blog.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.bannerAd.deleteMany()
  await prisma.spinPrize.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.news.deleteMany()
  await prisma.story.deleteMany()
  await prisma.musicLibrary.deleteMany()
  await prisma.review.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.coinTransaction.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.realEstateListing.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.pushSubscription.deleteMany()
  await prisma.payoutRequest.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.platformSetting.deleteMany()
  await prisma.location.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()

  // ─── Cities ────────────────────────────────────────
  console.log('Creating cities...')
  const choutuppal = await prisma.city.create({
    data: {
      name: 'Choutuppal',
      slug: 'choutuppal',
      state: 'Telangana',
      brandName: 'Choutuppal App',
      primaryColor: '#4169E1',
      secondaryColor: '#D4AF37',
      latitude: 17.2985,
      longitude: 78.9256,
      heroImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574535ed5?w=1200',
    },
  })

  const hyderabad = await prisma.city.create({
    data: {
      name: 'Hyderabad',
      slug: 'hyderabad',
      state: 'Telangana',
      brandName: 'Hyderabad App',
      primaryColor: '#E91E63',
      secondaryColor: '#FFD700',
      latitude: 17.3850,
      longitude: 78.4867,
      heroImageUrl: 'https://images.unsplash.com/photo-1572435555646-7ad9a149ad91?w=1200',
    },
  })

  const warangal = await prisma.city.create({
    data: {
      name: 'Warangal',
      slug: 'warangal',
      state: 'Telangana',
      brandName: 'Warangal App',
      primaryColor: '#4CAF50',
      secondaryColor: '#FF9800',
      latitude: 17.9784,
      longitude: 79.5941,
      heroImageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200',
    },
  })

  // ─── Users ─────────────────────────────────────────
  console.log('Creating users...')
  const admin = await prisma.user.create({
    data: {
      fullName: 'Mosin Md',
      phone: '9999999999',
      email: 'admin@choutuppal.com',
      role: 'super_admin',
      managedCityId: choutuppal.id,
      subscriptionTier: 'premium',
      coinsBalance: 5000,
      whatsappNumber: '919912353705',
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

  // City Admin (Franchisee) for Choutuppal
  const choutuppalAdmin = await prisma.user.create({
    data: {
      fullName: 'Venkat Rao',
      phone: '5555555551',
      email: 'venkat@choutuppal.com',
      role: 'city_admin',
      cityId: choutuppal.id,
      managedCityId: choutuppal.id,
      subscriptionTier: 'premium',
      coinsBalance: 0,
      whatsappNumber: '915555555551',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      totalEarnings: 8500,
      pendingPayout: 3200,
      upiId: 'venkatrao@upi',
    },
  })

  // Approved Agent operating in Choutuppal
  const agentRajesh = await prisma.user.create({
    data: {
      fullName: 'Rajesh Agent',
      phone: '6666666662',
      email: 'rajesh@choutuppal.com',
      role: 'agent',
      cityId: choutuppal.id,
      agentCityId: choutuppal.id,
      isAgentApproved: true,
      subscriptionTier: 'free',
      coinsBalance: 0,
      whatsappNumber: '916666666662',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      totalEarnings: 4500,
      pendingPayout: 1800,
      upiId: 'rajesh@paytm',
    },
  })

  // ─── Public Figure Users (Social Network) ────────────
  console.log('Creating public figure users...')
  const politicianRamesh = await prisma.user.create({
    data: {
      fullName: 'Sri. Ramesh Kumar - Local MLA',
      phone: '4444444441',
      email: 'ramesh.mla@choutuppal.com',
      role: 'user',
      cityId: choutuppal.id,
      subscriptionTier: 'free',
      coinsBalance: 0,
      whatsappNumber: '914444444441',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  })

  const municipalChairman = await prisma.user.create({
    data: {
      fullName: 'Smt. Lakshmi Bai - Municipal Chairman',
      phone: '4444444442',
      email: 'lakshmi.chairman@choutuppal.com',
      role: 'user',
      cityId: choutuppal.id,
      subscriptionTier: 'free',
      coinsBalance: 0,
      whatsappNumber: '914444444442',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    },
  })

  const localInfluencer = await prisma.user.create({
    data: {
      fullName: 'Choutuppal Kiran - Social Influencer',
      phone: '4444444443',
      email: 'kiran@choutuppal.com',
      role: 'user',
      cityId: choutuppal.id,
      subscriptionTier: 'free',
      coinsBalance: 0,
      whatsappNumber: '914444444443',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
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

  // ─── Music Library (Royalty-Free) ──────────────────
  console.log('Creating music library...')
  const teluguFolk = await prisma.musicLibrary.create({
    data: { name: 'Telugu Folk Beat', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'Telugu', duration: 30, isActive: true },
  })
  const celebrationLofi = await prisma.musicLibrary.create({
    data: { name: 'Celebration Lo-Fi', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'Celebration', duration: 25, isActive: true },
  })
  const traditionalDrums = await prisma.musicLibrary.create({
    data: { name: 'Traditional Drums', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre: 'Traditional', duration: 20, isActive: true },
  })
  const festiveMelody = await prisma.musicLibrary.create({
    data: { name: 'Festive Melody', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', genre: 'Telugu', duration: 28, isActive: true },
  })
  const chillVibes = await prisma.musicLibrary.create({
    data: { name: 'Chill Vibes Telugu', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', genre: 'Lo-Fi', duration: 22, isActive: true },
  })
  const devotionalFlute = await prisma.musicLibrary.create({
    data: { name: 'Devotional Flute', artist: 'Royalty Free', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', genre: 'Devotional', duration: 30, isActive: true },
  })

  // ─── Stories (Instagram/WhatsApp Clone) ───────────────
  console.log('Creating stories...')
  const now = new Date()
  const storiesData = [
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Grand Opening - Sri Venkateswara Tiffin Center New Branch!',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      musicId: teluguFolk.id,
      musicName: teluguFolk.name,
      isPremium: false,
      viewsCount: 320,
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      title: 'Bridal Season Special - 50% Off at Lakshmi Beauty Salon',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      musicId: celebrationLofi.id,
      musicName: celebrationLofi.name,
      isPremium: true,
      viewsCount: 580,
      expiresAt: new Date(now.getTime() + 22 * 60 * 60 * 1000),
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: 'New Plot Listings Near Highway - Starting ₹10L',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      isPremium: false,
      viewsCount: 450,
      expiresAt: new Date(now.getTime() + 20 * 60 * 60 * 1000),
    },
    {
      userId: ramesh.id,
      cityId: choutuppal.id,
      title: 'Annapurna Mess - Now Delivering via WhatsApp!',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      musicId: traditionalDrums.id,
      musicName: traditionalDrums.name,
      isPremium: false,
      viewsCount: 210,
      expiresAt: new Date(now.getTime() + 18 * 60 * 60 * 1000),
    },
    {
      userId: lakshmi.id,
      cityId: choutuppal.id,
      title: 'Vijaya Academy - Top Results in Board Exams!',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600',
      isPremium: true,
      viewsCount: 670,
      expiresAt: new Date(now.getTime() + 15 * 60 * 60 * 1000),
    },
    {
      userId: suresh.id,
      cityId: choutuppal.id,
      title: 'City Medical Store - Free Health Checkup Camp This Sunday',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600',
      musicId: chillVibes.id,
      musicName: chillVibes.name,
      isPremium: false,
      viewsCount: 340,
      expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
    },
    {
      userId: politicianRamesh.id,
      cityId: choutuppal.id,
      title: 'చౌటుప్పల్ అభివృద్ధికి నా కట్టుబడి! 🙏',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
      musicId: devotionalFlute.id,
      musicName: devotionalFlute.name,
      isPremium: false,
      viewsCount: 1200,
      expiresAt: new Date(now.getTime() + 23 * 60 * 60 * 1000),
    },
    {
      userId: priya.id,
      cityId: choutuppal.id,
      title: 'Choutuppal Market Visit! 🛍️',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      isPremium: false,
      viewsCount: 150,
      expiresAt: new Date(now.getTime() + 10 * 60 * 60 * 1000),
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
      whatsappSupportNumber: '919912353705',
      whatsappCommunityLink: '',
      whatsappChannelLink: '',
      contactName: 'Mosin Md',
      contactAddress: 'Choutuppal, Yadadri, Telangana-508252',
      contactPhone: '9912353705',
    },
  })

  // ─── Banner Ads ────────────────────────────────────
  console.log('Creating banner ads...')
  const bannerAds = [
    {
      title: 'List Your Business Free — Reach 50,000+ Choutuppal Users!',
      imageUrl: null,
      shopName: 'Choutuppal Super App',
      offerText: 'ఉచితంగా లిస్ట్ చేయండి!',
      linkUrl: '/business/signup',
      cityId: choutuppal.id,
      isActive: true,
    },
    {
      title: 'Premium Listings Get 3x More Enquiries — Upgrade Now!',
      imageUrl: null,
      shopName: 'Choutuppal Premium',
      offerText: '3x ఎక్కువ ఎంక్వైరీలు!',
      linkUrl: '/premium',
      cityId: choutuppal.id,
      isActive: true,
    },
    {
      title: 'Spin & Win Daily Coins — Redeem for Discounts & Free Listings',
      imageUrl: null,
      shopName: 'Daily Spin Wheel',
      offerText: 'రోజూ కాయిన్స్ గెలుచ్చి!',
      linkUrl: '/spin',
      cityId: choutuppal.id,
      isActive: true,
    },
  ]

  for (const data of bannerAds) {
    await prisma.bannerAd.create({ data })
  }

  // ─── Announcements ─────────────────────────────────
  console.log('Creating announcements...')
  const announcements = [
    {
      text: '🚨 చౌటుప్పల్ సూపర్ యాప్ డౌన్‌లోడ్ చేసుకోండి! మీ షాప్ ని ఉచితంగా లిస్ట్ చేయండి!',
      isActive: true,
    },
    {
      text: '🎉 రమేష్ మెడికల్స్ పై 20% డిస్కౌంట్ - ఇప్పుడే ఆర్డర్ చేయండి!',
      isActive: true,
    },
    {
      text: '📱 చౌటుప్పల్ లో అన్ని షాపులు, రియల్ ఎస్టేట్, వార్తలు ఒకే యాప్‌లో!',
      isActive: true,
    },
  ]

  for (const data of announcements) {
    await prisma.announcement.create({ data })
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
  // Additional subscription history for richer charts
  await prisma.subscription.create({
    data: {
      userId: ramesh.id,
      plan: 'pro',
      status: 'expired',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    },
  })
  await prisma.subscription.create({
    data: {
      userId: suresh.id,
      plan: 'pro',
      status: 'expired',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
    },
  })
  await prisma.subscription.create({
    data: {
      userId: lakshmi.id,
      plan: 'free',
      status: 'cancelled',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-15'),
    },
  })
  await prisma.subscription.create({
    data: {
      userId: priya.id,
      plan: 'pro',
      status: 'active',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2026-03-14'),
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
    // Additional leads for a fuller dashboard
    {
      listingId: createdListings[5].id,
      userId: null,
      customerPhone: '919998887776',
      customerName: 'Srinivas Babu',
      requirementText: 'Need 50 color prints and lamination for certificates',
      source: 'whatsapp',
      status: 'contacted',
    },
    {
      listingId: createdListings[6].id,
      userId: null,
      customerPhone: '918877665544',
      customerName: 'Padma Latha',
      requirementText: 'Want veg biryani for 30 people — housewarming function',
      source: 'form',
      status: 'new',
    },
    {
      listingId: createdListings[7].id,
      userId: null,
      customerPhone: '917766554433',
      customerName: 'Karthik Reddy',
      requirementText: 'Samsung Galaxy screen replacement — how much?',
      source: 'whatsapp',
      status: 'new',
    },
    {
      listingId: createdListings[8].id,
      userId: null,
      customerPhone: '916655443322',
      customerName: 'Ravi Teja',
      requirementText: 'Honda Activa service — oil change + general checkup',
      source: 'enquiry',
      status: 'contacted',
    },
    {
      listingId: createdListings[9].id,
      userId: null,
      customerPhone: '915544332211',
      customerName: 'Swathi Devi',
      requirementText: 'Need blouse stitching for silk saree — wedding function',
      source: 'form',
      status: 'new',
    },
    {
      listingId: createdListings[10].id,
      userId: null,
      customerPhone: '914433221100',
      customerName: 'Nagaraju',
      requirementText: 'Need 10 bags cement + steel for house construction',
      source: 'whatsapp',
      status: 'converted',
    },
    {
      listingId: createdListings[11].id,
      userId: null,
      customerPhone: '913322110099',
      customerName: 'Lavanya',
      requirementText: 'Tuition for 9th class — maths and science',
      source: 'enquiry',
      status: 'new',
    },
    {
      listingId: createdListings[0].id,
      userId: null,
      customerPhone: '912211009988',
      customerName: 'Murali Krishna',
      requirementText: 'Catering order for 100 people — engagement ceremony',
      source: 'form',
      status: 'new',
    },
    {
      listingId: createdListings[4].id,
      userId: null,
      customerPhone: '911100998877',
      customerName: 'Janardhan Reddy',
      requirementText: '200 sq.yards plot near highway — budget 15-20 lakhs',
      source: 'whatsapp',
      status: 'contacted',
    },
    {
      listingId: createdListings[2].id,
      userId: null,
      customerPhone: '910099887766',
      customerName: 'Divya Sri',
      requirementText: 'Hair smoothing treatment — what are the charges?',
      source: 'enquiry',
      status: 'new',
    },
    {
      listingId: createdListings[1].id,
      userId: null,
      customerPhone: '919988776655',
      customerName: 'Rama Devi',
      requirementText: 'BP and sugar checkup — walk-in available?',
      source: 'form',
      status: 'contacted',
    },
    {
      listingId: createdListings[3].id,
      userId: null,
      customerPhone: '918877665544',
      customerName: 'Suresh Babu',
      requirementText: 'Water motor not working — need emergency repair',
      source: 'whatsapp',
      status: 'converted',
    },
    {
      listingId: createdListings[7].id,
      userId: null,
      customerPhone: '917766554433',
      customerName: 'Akhila',
      requirementText: 'Laptop keyboard replacement — Dell Inspiron',
      source: 'enquiry',
      status: 'lost',
    },
    {
      listingId: createdListings[9].id,
      userId: null,
      customerPhone: '916655443322',
      customerName: 'Sunitha',
      requirementText: 'Alteration needed for lehanga — can you do it in 2 days?',
      source: 'whatsapp',
      status: 'contacted',
    },
    {
      listingId: createdListings[8].id,
      userId: null,
      customerPhone: '915544332211',
      customerName: 'Prasad',
      requirementText: 'Car AC not cooling — need gas refill and checkup',
      source: 'form',
      status: 'new',
    },
  ]

  for (const data of leadsData) {
    await prisma.lead.create({ data })
  }

  // ─── Admin Requests ───────────────────────────────
  console.log('Creating admin requests...')
  await prisma.adminRequest.create({
    data: {
      userId: priya.id,
      cityName: 'Bhongir',
      reason: 'I want to bring the Choutuppal App experience to Bhongir and manage local business listings.',
      status: 'pending',
    },
  })

  // ─── Blogs ────────────────────────────────────────
  console.log('Creating blogs...')
  await prisma.blog.create({
    data: {
      title: '5 Hidden Gems in Choutuppal You Must Visit',
      slug: '5-hidden-gems-choutuppal',
      coverImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574535ed5?w=800',
      content: '<h2>Discover Choutuppal</h2><p>Choutuppal is a town rich in culture and history. Here are 5 places you absolutely must visit...</p>',
      authorId: admin.id,
      cityId: choutuppal.id,
      isPublished: true,
    },
  })
  await prisma.blog.create({
    data: {
      title: 'How Digital Platforms Are Transforming Small Towns',
      slug: 'digital-platforms-transforming-small-towns',
      coverImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      content: '<h2>The Digital Revolution</h2><p>Small towns across India are embracing digital transformation at an unprecedented rate...</p>',
      authorId: admin.id,
      cityId: null, // Global blog
      isPublished: true,
    },
  })
  await prisma.blog.create({
    data: {
      title: 'Best Street Food in Telangana Towns',
      slug: 'best-street-food-telangana',
      coverImageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
      content: '<h2>Street Food Paradise</h2><p>Telangana is famous for its incredible street food culture. From spicy mirchi bajji to sweet jalebi...</p>',
      authorId: ramesh.id,
      cityId: choutuppal.id,
      isPublished: true,
    },
  })

  // ─── Locations ──────────────────────────────────────────
  console.log('Creating locations...')
  const telanganaLoc = await prisma.location.create({
    data: {
      state: 'Telangana',
      district: 'Yadadri Bhuvanagiri',
      city: 'Choutuppal',
      mandal: 'Choutuppal',
      pincode: '508252',
      latitude: 17.2985,
      longitude: 78.9256,
    },
  })
  const hydLoc = await prisma.location.create({
    data: {
      state: 'Telangana',
      district: 'Hyderabad',
      city: 'Hyderabad',
      mandal: 'Khairatabad',
      pincode: '500001',
      latitude: 17.3850,
      longitude: 78.4867,
    },
  })
  const warangalLoc = await prisma.location.create({
    data: {
      state: 'Telangana',
      district: 'Warangal Urban',
      city: 'Warangal',
      mandal: 'Warangal',
      pincode: '506001',
      latitude: 17.9784,
      longitude: 79.5941,
    },
  })

  // Link cities to locations
  await prisma.city.update({ where: { id: choutuppal.id }, data: { locationId: telanganaLoc.id } })
  await prisma.city.update({ where: { id: hyderabad.id }, data: { locationId: hydLoc.id } })
  await prisma.city.update({ where: { id: warangal.id }, data: { locationId: warangalLoc.id } })

  // ─── City Admin (Franchisee) User ──────────────────────
  console.log('Creating city admin user...')
  const cityAdminHyd = await prisma.user.create({
    data: {
      fullName: 'Rajesh Gupta',
      phone: '7777777772',
      email: 'rajesh@hyderabad.app',
      role: 'city_admin',
      managedCityId: hyderabad.id,
      cityId: hyderabad.id,
      subscriptionTier: 'premium',
      coinsBalance: 2000,
      whatsappNumber: '917777777772',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      totalEarnings: 15000,
      pendingPayout: 5000,
      upiId: 'rajesh@upi',
    },
  })

  // ─── Agent User ─────────────────────────────────────────
  console.log('Creating agent user...')
  const agent = await prisma.user.create({
    data: {
      fullName: 'Venkat Rao',
      phone: '6666666661',
      email: 'venkat@choutuppal.com',
      role: 'agent',
      cityId: choutuppal.id,
      agentCityId: choutuppal.id,
      isAgentApproved: true,
      subscriptionTier: 'free',
      coinsBalance: 500,
      whatsappNumber: '916666666661',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      totalEarnings: 4500,
      pendingPayout: 1800,
      upiId: 'venkat@paytm',
    },
  })

  // ─── Platform Settings (Commission Engine) ──────────────
  console.log('Creating platform settings...')
  const platformSettings = [
    { key: 'city_admin_fee', value: '50000', label: 'City Admin Franchisee Fee (₹)' },
    { key: 'agent_commission_listing', value: '20', label: 'Agent Commission for Listings (%)' },
    { key: 'agent_commission_banner', value: '15', label: 'Agent Commission for Banners (%)' },
    { key: 'agent_commission_news', value: '10', label: 'Agent Commission for News Posts (%)' },
    { key: 'city_admin_commission_share', value: '30', label: 'City Admin Revenue Share (%)' },
    { key: 'listing_pro_price', value: '299', label: 'Pro Listing Price (₹)' },
    { key: 'listing_premium_price', value: '499', label: 'Premium Listing Price (₹)' },
    { key: 'banner_ad_price', value: '199', label: 'Banner Ad Price (₹/week)' },
    { key: 'news_post_price', value: '99', label: 'News Post Price (₹)' },
  ]

  for (const setting of platformSettings) {
    await prisma.platformSetting.create({ data: setting })
  }

  // ─── Transactions (Demo Financial Data) ─────────────────
  console.log('Creating transactions...')
  const transactionsData = [
    {
      userId: ramesh.id,
      agentId: agent.id,
      cityAdminId: admin.id,
      cityId: choutuppal.id,
      type: 'SUBSCRIPTION',
      amount: 299,
      agentCommission: 59.8,
      cityAdminShare: 71.8,
      superAdminShare: 167.4,
      description: 'Pro Plan Subscription - Ramesh Kumar',
      status: 'completed',
    },
    {
      userId: lakshmi.id,
      agentId: agent.id,
      cityAdminId: admin.id,
      cityId: choutuppal.id,
      type: 'LISTING',
      amount: 499,
      agentCommission: 99.8,
      cityAdminShare: 119.8,
      superAdminShare: 279.4,
      description: 'Premium Listing Upgrade - Lakshmi Beauty Salon',
      status: 'completed',
    },
    {
      userId: suresh.id,
      agentId: null,
      cityAdminId: admin.id,
      cityId: choutuppal.id,
      type: 'SUBSCRIPTION',
      amount: 499,
      agentCommission: 0,
      cityAdminShare: 149.7,
      superAdminShare: 349.3,
      description: 'Premium Plan Subscription - Suresh Reddy (Direct)',
      status: 'completed',
    },
    {
      userId: ramesh.id,
      agentId: agent.id,
      cityAdminId: admin.id,
      cityId: choutuppal.id,
      type: 'BANNER',
      amount: 199,
      agentCommission: 29.85,
      cityAdminShare: 47.7,
      superAdminShare: 121.45,
      description: 'Banner Ad - Sri Venkateswara Tiffin Center',
      status: 'completed',
    },
    {
      userId: priya.id,
      agentId: null,
      cityAdminId: admin.id,
      cityId: choutuppal.id,
      type: 'LISTING',
      amount: 299,
      agentCommission: 0,
      cityAdminShare: 89.7,
      superAdminShare: 209.3,
      description: 'Pro Listing - Priya Sharma (Direct)',
      status: 'completed',
    },
  ]

  for (const data of transactionsData) {
    await prisma.transaction.create({ data })
  }

  // ─── Payout Requests ────────────────────────────────────
  console.log('Creating payout requests...')
  await prisma.payoutRequest.create({
    data: {
      userId: agent.id,
      amount: 1800,
      status: 'pending',
      upiId: 'venkat@paytm',
    },
  })
  await prisma.payoutRequest.create({
    data: {
      userId: cityAdminHyd.id,
      amount: 5000,
      status: 'approved',
      upiId: 'rajesh@upi',
      note: 'First payout approved',
    },
  })

  // ─── Agent Admin Request ────────────────────────────────
  console.log('Creating agent admin request...')
  await prisma.adminRequest.create({
    data: {
      userId: priya.id,
      cityName: 'Choutuppal',
      type: 'agent',
      status: 'pending',
      reason: 'I want to help onboard businesses in my area',
      agentCityId: choutuppal.id,
    },
  })

  // ─── Additional Locations (Geographic Hierarchy) ─────
  console.log('Creating additional locations...')
  const additionalLocations = [
    { state: 'Telangana', district: 'Yadadri Bhuvanagiri', city: 'Choutuppal', mandal: 'Choutuppal', pincode: '508255', latitude: 17.3010, longitude: 78.9285 },
    { state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', mandal: 'Secunderabad', pincode: '500003', latitude: 17.4399, longitude: 78.4983 },
    { state: 'Telangana', district: 'Yadadri Bhuvanagiri', city: 'Bhongir', mandal: 'Bhongir', pincode: '508116', latitude: 17.5167, longitude: 78.8833 },
  ]
  for (const loc of additionalLocations) {
    await prisma.location.create({ data: loc })
  }

  // ─── Additional Platform Settings (Commission Engine) ──
  console.log('Creating additional platform settings...')
  const additionalPlatformSettings = [
    { key: 'agent_commission_news_post', value: '10', label: 'Agent Commission - News Post (%)' },
    { key: 'agent_commission_subscription', value: '20', label: 'Agent Commission - Subscription (%)' },
    { key: 'listing_price_pro', value: '299', label: 'Pro Listing Price (₹)' },
    { key: 'listing_price_premium', value: '499', label: 'Premium Listing Price (₹)' },
    { key: 'banner_price_monthly', value: '999', label: 'Banner Ad Monthly Price (₹)' },
    { key: 'min_payout_amount', value: '500', label: 'Minimum Payout Amount (₹)' },
  ]
  for (const setting of additionalPlatformSettings) {
    await prisma.platformSetting.create({ data: setting })
  }

  // ─── Additional Transactions (Financial Tracking) ─────
  console.log('Creating additional transactions...')
  const additionalTransactionsData = [
    // Agent-referred listings
    { userId: ramesh.id, agentId: agentRajesh.id, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'LISTING', amount: 299, agentCommission: 59.80, cityAdminShare: 71.76, superAdminShare: 167.44, status: 'completed', description: 'Pro Listing - Lakshmi Beauty Salon' },
    { userId: suresh.id, agentId: agentRajesh.id, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'LISTING', amount: 499, agentCommission: 99.80, cityAdminShare: 119.76, superAdminShare: 279.44, status: 'completed', description: 'Premium Listing - Vijaya Educational Academy' },
    { userId: lakshmi.id, agentId: agentRajesh.id, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'LISTING', amount: 299, agentCommission: 59.80, cityAdminShare: 71.76, superAdminShare: 167.44, status: 'completed', description: 'Pro Listing - Annapurna Mess' },
    // Banner ads sold by agent
    { userId: ramesh.id, agentId: agentRajesh.id, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'BANNER', amount: 999, agentCommission: 149.85, cityAdminShare: 254.78, superAdminShare: 594.37, status: 'completed', description: 'Banner Ad - Sri Venkateswara Tiffin Center' },
    // Direct purchases (no agent)
    { userId: suresh.id, agentId: null, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'SUBSCRIPTION', amount: 499, agentCommission: 0, cityAdminShare: 149.70, superAdminShare: 349.30, status: 'completed', description: 'Premium Subscription - Suresh' },
    { userId: ramesh.id, agentId: null, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'SUBSCRIPTION', amount: 299, agentCommission: 0, cityAdminShare: 89.70, superAdminShare: 209.30, status: 'completed', description: 'Pro Subscription - Ramesh' },
    { userId: lakshmi.id, agentId: null, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'SUBSCRIPTION', amount: 299, agentCommission: 0, cityAdminShare: 89.70, superAdminShare: 209.30, status: 'completed', description: 'Pro Subscription - Lakshmi' },
    // Franchisee fee
    { userId: choutuppalAdmin.id, agentId: null, cityAdminId: admin.id, cityId: choutuppal.id, type: 'FRANCHISEE_FEE', amount: 50000, agentCommission: 0, cityAdminShare: 0, superAdminShare: 50000, status: 'completed', description: 'Franchisee Fee - Choutuppal City' },
    // News post sold by agent
    { userId: suresh.id, agentId: agentRajesh.id, cityAdminId: choutuppalAdmin.id, cityId: choutuppal.id, type: 'NEWS_POST', amount: 200, agentCommission: 20, cityAdminShare: 54, superAdminShare: 126, status: 'completed', description: 'News Post - Krishna Real Estate' },
  ]
  for (const data of additionalTransactionsData) {
    await prisma.transaction.create({ data })
  }

  // ─── Additional Payout Requests ────────────────────────
  console.log('Creating additional payout requests...')
  const additionalPayoutRequestsData = [
    { userId: agentRajesh.id, amount: 1500, status: 'paid', upiId: 'rajesh@paytm', note: 'First payout - approved and paid' },
    { userId: agentRajesh.id, amount: 1800, status: 'pending', upiId: 'rajesh@paytm', note: null },
    { userId: choutuppalAdmin.id, amount: 3000, status: 'paid', upiId: 'venkatrao@upi', note: 'Monthly commission payout' },
    { userId: choutuppalAdmin.id, amount: 3200, status: 'pending', upiId: 'venkatrao@upi', note: null },
  ]
  for (const data of additionalPayoutRequestsData) {
    await prisma.payoutRequest.create({ data })
  }

  // ─── Additional Admin Requests (Franchisee/Agent Applications) ──
  console.log('Creating additional admin requests...')
  const additionalAdminRequestsData = [
    { userId: priya.id, cityName: 'Warangal', reason: 'I want to bring the Choutuppal App model to Warangal. I have extensive local business contacts.', type: 'city_admin', status: 'pending', franchiseeFeePaid: false },
    { userId: priya.id, cityName: 'Choutuppal', reason: 'I want to become an agent and help onboard businesses in my area.', type: 'agent', agentCityId: choutuppal.id, status: 'pending' },
  ]
  for (const data of additionalAdminRequestsData) {
    await prisma.adminRequest.create({ data })
  }

  // ─── Additional Blogs ─────────────────────────────────
  console.log('Creating additional blogs...')
  const additionalBlogsData = [
    {
      title: 'Why Every Local Business Needs a Digital Presence in 2025',
      slug: 'local-business-digital-presence-2025',
      coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      content: '<h2>The Digital Revolution is Here</h2><p>In 2025, having a digital presence is no longer optional for local businesses. With over 80% of consumers searching online before making a purchase decision, businesses that are not visible online are losing customers every day.</p><h3>Key Benefits</h3><ul><li>Increased visibility in local search results</li><li>Building trust with customer reviews</li><li>Reaching younger demographics who primarily use mobile</li><li>Competing with larger chains on a level playing field</li></ul><p>The Choutuppal Super App makes it easy for local businesses to establish their digital presence without needing technical expertise. Simply list your business, add your services, and start receiving enquiries via WhatsApp!</p>',
      authorId: admin.id,
      cityId: choutuppal.id,
      isPublished: true,
    },
    {
      title: 'How Agents Are Earning ₹20,000+ Monthly with Choutuppal App',
      slug: 'agent-earnings-guide-2025',
      coverImageUrl: 'https://images.unsplash.com/photo-1553729459-uj1ef3f78828?w=800',
      content: '<h2>The Agent Opportunity</h2><p>Choutuppal App agents are earning significant commissions by helping local businesses get online. Here is how the commission structure works and how you can maximize your earnings.</p><h3>Commission Structure</h3><ul><li><strong>Listings:</strong> 20% commission on every Pro (₹299) and Premium (₹499) listing you sell</li><li><strong>Banner Ads:</strong> 15% commission on monthly banner ad sales</li><li><strong>News Posts:</strong> 10% commission on sponsored news posts</li></ul><h3>Success Tips</h3><p>Top-performing agents focus on building relationships with business owners. Start with businesses you already know, show them the value of being listed, and the enquiries will speak for themselves.</p>',
      authorId: admin.id,
      cityId: null,
      isPublished: true,
    },
    {
      title: 'Own Your City: The Franchisee Opportunity',
      slug: 'franchisee-opportunity-guide',
      coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      content: '<h2>Become a City Admin</h2><p>The Choutuppal App franchisee model allows entrepreneurs to own and operate the platform in their city. As a City Admin, you get:</p><ul><li>Full management rights for your city</li><li>30% revenue share from all transactions in your city</li><li>Ability to recruit and manage agents</li><li>Complete content management for listings, news, and banners</li></ul><h3>Investment</h3><p>The one-time franchisee fee is ₹50,000. This gives you exclusive rights to operate in your city with full support from our platform team.</p>',
      authorId: admin.id,
      cityId: null,
      isPublished: true,
    },
  ]
  for (const data of additionalBlogsData) {
    await prisma.blog.create({ data })
  }

  console.log('\n✅ Seeding complete!')

  // ═══════════════════════════════════════════════════════════
  // SOCIAL NETWORK SEED DATA
  // ═══════════════════════════════════════════════════════════

  // ─── Profiles (Social Network) ──────────────────────
  console.log('Creating profiles...')
  const profilesData = [
    { userId: admin.id, bio: 'Super Admin of Choutuppal App. Building the future of hyper-local services! 🚀', isPublicFigure: false, isVerified: true, followersCount: 1250, followingCount: 45 },
    { userId: priya.id, bio: 'Love exploring Choutuppal! Foodie 🍛 | Shopper 🛍️ | Local guide 📍', isPublicFigure: false, isVerified: false, followersCount: 85, followingCount: 120 },
    { userId: ramesh.id, bio: 'Business owner in Choutuppal. Running Sri Venkateswara Tiffin Center since 2005! 🍽️', isPublicFigure: false, isVerified: false, followersCount: 210, followingCount: 50 },
    { userId: suresh.id, bio: 'Real estate & electronics entrepreneur. Serving Choutuppal with quality products! 🏠📱', isPublicFigure: false, isVerified: false, followersCount: 180, followingCount: 65 },
    { userId: lakshmi.id, bio: 'Beauty expert & salon owner. Making Choutuppal beautiful one person at a time! 💇‍♀️✨', isPublicFigure: false, isVerified: false, followersCount: 350, followingCount: 80 },
    // Public Figures (verified)
    { userId: politicianRamesh.id, bio: 'చౌటుప్పల్ నియోజకవర్గం ఎమ్మెలే. ప్రజల సేవలో ఎప్పుడూ! 🇮🇳 Serving the people of Choutuppal constituency.', isPublicFigure: true, publicFigureCategory: 'POLITICIAN', isVerified: true, followersCount: 15000, followingCount: 25 },
    { userId: municipalChairman.id, bio: 'చౌటుప్పల్ మున్సిపల్ చైర్మన్. పట్టణ అభివృద్ధి నా లక్ష్యం! 🏙️ Building a better Choutuppal.', isPublicFigure: true, publicFigureCategory: 'GOVT_OFFICIAL', isVerified: true, followersCount: 8500, followingCount: 30 },
    { userId: localInfluencer.id, bio: 'చౌటుప్పల్ కిరణ్ 📸 | Food blogger | Local events | తెలుగు content creator | Promoting local businesses 🤝', isPublicFigure: true, publicFigureCategory: 'INFLUENCER', isVerified: true, followersCount: 5200, followingCount: 450 },
    { userId: choutuppalAdmin.id, bio: 'City Admin & Franchisee of Choutuppal App. Empowering local businesses! 💼', isPublicFigure: false, isVerified: false, followersCount: 500, followingCount: 30 },
    { userId: agentRajesh.id, bio: 'Agent for Choutuppal. Helping businesses grow! 📈', isPublicFigure: false, isVerified: false, followersCount: 120, followingCount: 200 },
  ]

  for (const data of profilesData) {
    await prisma.profile.create({ data })
  }

  // ─── Posts (Social Network) ─────────────────────────
  console.log('Creating posts...')
  const postsData = [
    // Politician posts (Telugu)
    { authorId: politicianRamesh.id, content: 'చౌటుప్పల్ లో కొత్త రోడ్లు నిర్మాణం జరుగుతోంది... 🚧 మా ప్రభుత్వం ₹15 కోట్లు కేటాయించింది. త్వరలో ట్రాఫిక్ సమస్య తగ్గుతుంది! #ChoutuppalDevelopment #అభివృద్ధి', likesCount: 342, commentsCount: 45, isPinned: true },
    { authorId: politicianRamesh.id, content: 'నేడు చౌటుప్పల్ ప్రభుత్వ పాఠశాలలో డిజిటల్ క్లాస్‌రూమ్ ప్రారంభోత్సవం! 🏫💻 పిల్లల భవిష్యత్తు కోసం మేము కట్టుబడి ఉన్నాము. #Education #DigitalIndia', likesCount: 228, commentsCount: 32, isPinned: false },
    { authorId: politicianRamesh.id, content: 'చౌటుప్పల్ జాతర ఈ ఏడాది ఘనంగా జరుగుతుంది! 🙏 అందరం కలిసి పాల్గొనండి. భక్తుల సౌకర్యార్థం ప్రత్యేక ఏర్పాట్లు చేశాము. 🪔', likesCount: 456, commentsCount: 67, isPinned: false },

    // Municipal Chairman posts
    { authorId: municipalChairman.id, content: 'చౌటుప్పల్ మున్సిపాలిటీ నుండి మీ అందరికీ సందేశం! 🏙️ మంచినీటి సరఫరా పథకం పనులు వేగంగా జరుగుతున్నాయి. మార్చి నాటికి పూర్తవుతుంది! 💧 #MissionBhagiratha', likesCount: 189, commentsCount: 23, isPinned: true },
    { authorId: municipalChairman.id, content: 'స్వచ్ఛ చౌటుప్పల్ - ఆదివారం శుభ్రత కార్యక్రమం! 🧹 అందరం పాల్గొనండి. మన పట్టణం మన బాధ్యత! #SwachhChoutuppal #CleanCity', likesCount: 145, commentsCount: 18, isPinned: false },

    // Influencer posts
    { authorId: localInfluencer.id, content: 'చౌటుప్పల్ లో బెస్ట్ మసాలా దోశ! 🤤 శ్రీ వెంకటేశ్వర టిఫిన్ సెంటర్ లో ట్రై చేయండి రండి! నాకు ఇది ఎప్పటికీ ఫేవరెట్! ❤️ #ChoutuppalFood #LocalEats', mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1630383249896-424e482df921?w=600']), likesCount: 567, commentsCount: 89, isPinned: false },
    { authorId: localInfluencer.id, content: 'చౌటుప్పల్ జాతర వైభవం! 🎊✨ ఈ ఏడాది రికార్డు స్థాయిలో భక్తులు వచ్చారు. సాంస్కృతిక కార్యక్రమాలు అద్భుతంగా ఉన్నాయి! 🪔🙏', mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=600']), likesCount: 834, commentsCount: 112, isPinned: false },

    // Normal user posts
    { authorId: priya.id, content: 'ఈ రోజు చౌటుప్పల్ మార్కెట్ లో కొనుగోలు! 🛍️ కూరగాయల ధరలు ఈ వారం చాలా బాగున్నాయి. టమాటా ₹20/kg, ఉల్లిపచ్చి ₹25/kg 🍅🧅', likesCount: 45, commentsCount: 12, isPinned: false },
    { authorId: priya.id, content: 'Choutuppal App is so useful! Found the best salon in town through this app. Lakshmi Beauty Salon did an amazing job with my bridal makeup! 💄✨ Thank you @LakshmiDevi!', likesCount: 67, commentsCount: 8, isPinned: false },

    // Business owner posts
    { authorId: ramesh.id, content: 'శ్రీ వెంకటేశ్వర టిఫిన్ సెంటర్ లో ఈ వారం ప్రత్యేకం! 🔥 పెసరట్టు + ఫిల్టర్ కాఫీ కాంబో ₹70 మాత్రమే! రండి ఆస్వాదించండి! ☕🥘', likesCount: 89, commentsCount: 15, isPinned: false },
  ]

  const createdPosts: Awaited<ReturnType<typeof prisma.post.create>>[] = []
  for (const data of postsData) {
    const post = await prisma.post.create({ data })
    createdPosts.push(post)
  }

  // ─── Comments ────────────────────────────────────────
  console.log('Creating comments...')
  const commentsData = [
    { postId: createdPosts[0].id, userId: priya.id, content: 'చాలా బాగుంది సర్! రోడ్లు బాగుపడితే ట్రాఫిక్ సమస్య తీరుతుంది 👏' },
    { postId: createdPosts[0].id, userId: ramesh.id, content: 'మా షాపు ముందు రోడ్ చాలా చెడుగా ఉంది. దయచేసి త్వరగా పనులు మొదలుపెట్టండి 🙏' },
    { postId: createdPosts[0].id, userId: municipalChairman.id, content: 'అవును! మేము త్వరలో పనులు ప్రారంభిస్తాము. మీ సహకారానికి ధన్యవాదాలు! 🙏' },
    { postId: createdPosts[5].id, userId: priya.id, content: 'నిజమే! ఆ దోశ సూపర్! 🤤 నేను కూడా వారానికి రెండుసార్లు వెళ్తాను!' },
    { postId: createdPosts[5].id, userId: lakshmi.id, content: 'కిరణ్ గారు, మీ ఫుడ్ రివ్యూస్ చాలా బాగుంటాయి! 👏😊' },
    { postId: createdPosts[7].id, userId: localInfluencer.id, content: 'మార్కెట్ ధరలు షేర్ చేయడం చాలా మంచిది! థాంక్స్ ప్రియా! 🙌' },
    { postId: createdPosts[9].id, userId: priya.id, content: 'పెసరట్టు + కాఫీ కాంబో సూపర్! నేను ఈ వారం ట్రై చేశాను ☕😋' },
    { postId: createdPosts[1].id, userId: suresh.id, content: 'డిజిటల్ క్లాస్‌రూమ్ చాలా అవసరం. ధన్యవాదాలు సర్! 👏' },
  ]

  for (const data of commentsData) {
    await prisma.comment.create({ data })
  }

  // ─── Likes ───────────────────────────────────────────
  console.log('Creating likes...')
  const likesData = [
    { postId: createdPosts[0].id, userId: priya.id },
    { postId: createdPosts[0].id, userId: ramesh.id },
    { postId: createdPosts[0].id, userId: suresh.id },
    { postId: createdPosts[0].id, userId: municipalChairman.id },
    { postId: createdPosts[1].id, userId: priya.id },
    { postId: createdPosts[1].id, userId: suresh.id },
    { postId: createdPosts[2].id, userId: priya.id },
    { postId: createdPosts[2].id, userId: ramesh.id },
    { postId: createdPosts[2].id, userId: lakshmi.id },
    { postId: createdPosts[2].id, userId: localInfluencer.id },
    { postId: createdPosts[3].id, userId: politicianRamesh.id },
    { postId: createdPosts[3].id, userId: priya.id },
    { postId: createdPosts[5].id, userId: priya.id },
    { postId: createdPosts[5].id, userId: ramesh.id },
    { postId: createdPosts[5].id, userId: lakshmi.id },
    { postId: createdPosts[6].id, userId: politicianRamesh.id },
    { postId: createdPosts[6].id, userId: priya.id },
    { postId: createdPosts[6].id, userId: ramesh.id },
    { postId: createdPosts[7].id, userId: ramesh.id },
    { postId: createdPosts[7].id, userId: localInfluencer.id },
    { postId: createdPosts[9].id, userId: priya.id },
    { postId: createdPosts[9].id, userId: localInfluencer.id },
  ]

  for (const data of likesData) {
    await prisma.like.create({ data })
  }

  // ─── Follows ─────────────────────────────────────────
  console.log('Creating follows...')
  const followsData = [
    // Priya follows leaders
    { followerId: priya.id, followingId: politicianRamesh.id },
    { followerId: priya.id, followingId: municipalChairman.id },
    { followerId: priya.id, followingId: localInfluencer.id },
    { followerId: priya.id, followingId: admin.id },
    // Ramesh follows
    { followerId: ramesh.id, followingId: politicianRamesh.id },
    { followerId: ramesh.id, followingId: localInfluencer.id },
    // Suresh follows
    { followerId: suresh.id, followingId: politicianRamesh.id },
    { followerId: suresh.id, followingId: municipalChairman.id },
    // Lakshmi follows
    { followerId: lakshmi.id, followingId: politicianRamesh.id },
    { followerId: lakshmi.id, followingId: localInfluencer.id },
    // Influencer follows leaders
    { followerId: localInfluencer.id, followingId: politicianRamesh.id },
    { followerId: localInfluencer.id, followingId: municipalChairman.id },
    // Leaders follow each other
    { followerId: politicianRamesh.id, followingId: municipalChairman.id },
    { followerId: municipalChairman.id, followingId: politicianRamesh.id },
    { followerId: municipalChairman.id, followingId: localInfluencer.id },
  ]

  for (const data of followsData) {
    await prisma.follow.create({ data })
  }

  console.log('\n✅ Seeding complete with Social Network data!')
  console.log(`   Cities: 3`)
  console.log(`   Users: 9 (1 Super Admin, 2 City Admins, 2 Agents, 4 Regular)`)
  console.log(`   Listings: 12`)
  console.log(`   Real Estate Listings: 4`)
  console.log(`   Stories: 6`)
  console.log(`   News: 4`)
  console.log(`   Reviews: 8`)
  console.log(`   Spin Prizes: 8`)
  console.log(`   Site Settings: 1`)
  console.log(`   Platform Settings: 15`)
  console.log(`   Banner Ads: 3`)
  console.log(`   Announcements: 3`)
  console.log(`   Coin Transactions: 9`)
  console.log(`   Subscriptions: 7`)
  console.log(`   Leads: 20`)
  console.log(`   Admin Requests: 3`)
  console.log(`   Blogs: 6`)
  console.log(`   Locations: 6`)
  console.log(`   Transactions: 14`)
  console.log(`   Payout Requests: 6`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
