/**
 * Magic Scissors - Luxury Salon Data Source
 * Easily customizable for the client
 */
export const SALON_DATA = {
  brand: {
    name: "Magic Scissors",
    shortName: "MS",
    tagline: "Luxury Unisex Salon & Aesthetic Studio",
    subheading: "Refined styling, precise technique, and care designed around you.",
    founder: "Led by Senior Stylists",
    phone: "+91 99601 35849",
    phoneClean: "919960135849",
    whatsapp: "+91 99601 35849",
    whatsappClean: "919960135849",
    email: "concierge@magicscissors.com",
    address: {
      line1: "Shop No 1, near Gayatri Medical, Trimurti Chowk",
      line2: "Cidco, Durganagar",
      city: "Nashik",
      state: "Maharashtra",
      pincode: "422008",
      full: "Shop No 1, near Gayatri Medical, Trimurti Chowk, Cidco, Durganagar, Nashik, Maharashtra 422008",
      mapsLink: "https://maps.app.goo.gl/sFZADh6X1vKPpQgZ9"
    },
    instagram: {
      handle: "@magicscissorsunisexsalon",
      url: "https://www.instagram.com/magicscissorsunisexsalon?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
    },
    hours: [
      { days: "Monday - Saturday", time: "9:00 AM - 9:30 PM" },
      { days: "Sunday", time: "9:00 AM - 10:00 PM" }
    ],
    stats: [
      { value: "4.9★", label: "Google Rating", sub: "Based on 1,400+ reviews" },
      { value: "15+", label: "Master Stylists", sub: "Senior Stylists & Colorists" },
      { value: "25k+", label: "Happy Clients", sub: "Appointments Completed" },
      { value: "100%", label: "Hygiene Standard", sub: "Sterilized Tools & Fresh Linens" }
    ]
  },

  serviceCategories: [
    { id: "all", name: "All Services", icon: "✨" },
    { id: "hair", name: "Hair Craft & Color", icon: "✂️" },
    { id: "skin", name: "Skin & Facials", icon: "🌸" },
    { id: "bridal", name: "Bridal & Makeover", icon: "👑" },
    { id: "nails", name: "Nails & Art", icon: "💅" },
    { id: "mens", name: "Men's Grooming", icon: "🧔" }
  ],

  services: [
    {
      id: "signature-haircut",
      category: "hair",
      categoryName: "Hair Craft",
      title: "Signature Scissor Cut & Couture Blowdry",
      tag: "Most Popular",
      price: "₹899",
      priceNum: 899,
      duration: "45 mins",
      image: "assets/images/salon_hair_styling.jpg",
      shortDesc: "Tailored haircut shaped to your features and natural hair movement, complete with a clarifying wash, deep conditioning, and signature blowdry.",
      fullDesc: "Every cut begins with a consultation with a senior stylist to assess your hair texture, lifestyle, and styling routine. We finish with a relaxing wash, scalp massage, precise scissor shaping, and a polished blowdry.",
      steps: [
        "One-on-one consultation and hair texture analysis",
        "Relaxing hair wash and deep conditioning treatment",
        "Precision scissor shaping tailored to your features",
        "Heat protection and professional blowdry finish"
      ],
      benefits: ["Shapes around your natural hair movement", "Removes split ends while preserving volume", "Clean, long-lasting shape that styles easily at home"],
      products: ["Kérastase Nutritive", "Olaplex No. 7 Bonding Oil", "Schwarzkopf Professional"]
    },
    {
      id: "botox-keratin",
      category: "hair",
      categoryName: "Hair Craft",
      title: "Royal Caviar Botox & Nanoplastia Therapy",
      tag: "Signature Treatment",
      price: "₹4,499",
      priceNum: 4499,
      duration: "150 mins",
      image: "assets/images/salon_wash_spa.jpg",
      shortDesc: "Deep restorative hair treatment that seals in moisture, controls frizz, and leaves hair smooth and manageable.",
      fullDesc: "Enriched with hydrolyzed keratin and nourishing proteins to repair cuticle damage from heat and styling. Leaves hair soft, glossy, and humidity-resistant for months.",
      steps: [
        "Clarifying cleanse to prepare hair for deep absorption",
        "Section-by-section keratin and protein infusion",
        "Gentle thermal sealing with micro-mist hydration",
        "Cuticle-sealing rinse and lightweight smoothing serum"
      ],
      benefits: ["Long-lasting frizz control in humid weather", "Restores elasticity and natural softness", "Reduces everyday styling time"],
      products: ["Brazilian Blowout Pro", "GK Hair The Best", "Olaplex Bonding System"]
    },
    {
      id: "balayage-global",
      category: "hair",
      categoryName: "Hair Craft",
      title: "French Balayage & Seamless Global Toning",
      tag: "Trending",
      price: "₹5,200",
      priceNum: 5200,
      duration: "180 mins",
      image: "assets/images/salon_hair_styling.jpg",
      shortDesc: "Hand-painted color gradients and custom toning with built-in bond protection to maintain hair health.",
      fullDesc: "Seamless color transitions tailored to your skin tone and natural base. Designed to grow out softly without harsh lines, using bond protectors to keep strands healthy.",
      steps: [
        "Color consultation and undertone matching",
        "Freehand balayage application and foil placement",
        "Bonding treatment and neutralizing gloss glaze",
        "Color-lock conditioning mask and blowdry finish"
      ],
      benefits: ["Soft, low-maintenance root grow-out", "Multidimensional tone and natural depth", "Leaves hair soft and conditioned"],
      products: ["L'Oréal Professionnel French Balayage", "Wella Koleston Perfect", "Olaplex No. 1 & 2"]
    },
    {
      id: "hydrafacial-deluxe",
      category: "skin",
      categoryName: "Skin & Facials",
      title: "Deep Hydrating Hydra-Cleanse Facial",
      tag: "Client Favorite",
      price: "₹3,199",
      priceNum: 3199,
      duration: "60 mins",
      image: "assets/images/salon_interior.jpg",
      shortDesc: "Multi-step hydro-cleansing treatment that gently clears impurities and infuses skin with moisture and antioxidants.",
      fullDesc: "A refreshing skin therapy that decongests pores and deeply hydrates tired skin. Leaves your complexion feeling clean, plump, and calm with zero irritation or redness.",
      steps: [
        "Double botanical cleanse & gentle warm steam",
        "Hydro-dermabrasion gentle exfoliation",
        "Painless suction extractions for congested pores",
        "Cooling ice-globe massage & hyaluronic acid mask"
      ],
      benefits: ["Clean, breathable skin with a natural glow", "Unclogs stubborn congested pores", "Smooths rough patches and dehydration lines"],
      products: ["Hydra Derm Solutions", "Dermalogica Pro", "Bio-Cellulose Hyaluronic Sheets"]
    },
    {
      id: "botanical-glow-facial",
      category: "skin",
      categoryName: "Skin & Facials",
      title: "Phyto-Cellular Radiance & Glow Treatment",
      tag: "Signature Facial",
      price: "₹3,850",
      priceNum: 3850,
      duration: "75 mins",
      image: "assets/images/salon_bridal.jpg",
      shortDesc: "Restorative facial using cold-pressed botanical extracts, active peptides, and soothing stone massage.",
      fullDesc: "An intensive glow ritual designed to revive fatigued skin. Features gentle enzymatic peeling, soothing rose-quartz massage, and peptide-rich nourishment for an effortless, luminous look.",
      steps: [
        "Aromatic herbal oil cleanse & warm compress",
        "Enzymatic fruit peel & gentle exfoliation",
        "Facial acupressure & chilled rose-quartz massage",
        "Peptide infusion with barrier-repairing sheet mask"
      ],
      benefits: ["Deeply nourished, luminous complexion", "Relieves facial tension and puffiness", "Smooths skin texture with long-lasting hydration"],
      products: ["Dermalogica Active Resurface", "O3+ Radiance Solutions", "Esthemax Botanical Masks"]
    },
    {
      id: "royal-bridal-hd",
      category: "bridal",
      categoryName: "Bridal & Makeover",
      title: "Signature HD & Airbrush Bridal Makeover",
      tag: "Bridal Signature",
      price: "₹14,999",
      priceNum: 14999,
      duration: "240 mins",
      image: "assets/images/salon_bridal.jpg",
      shortDesc: "Long-lasting, camera-ready bridal makeup with personalized hair styling, premium lashes, and dupatta draping.",
      fullDesc: "Crafted for the bride who wants to look timeless and feel completely comfortable throughout the day. Our bridal team creates breathable, long-wearing makeup that stays fresh under venue lighting and through hours of celebration.",
      steps: [
        "Skin preparation and cooling eye treatment",
        "Custom lightweight HD airbrush base application",
        "Detailed eye makeup with lightweight lashes",
        "Bridal hair styling with fresh florals and dupatta draping"
      ],
      benefits: ["Long-wearing, sweat-resistant finish", "Looks soft and natural both in person and on camera", "Private bridal suite experience"],
      products: ["Charlotte Tilbury Hollywood Flawless", "Dior Backstage", "MAC Studio Fix", "Huda Beauty"]
    },
    {
      id: "russian-gel-nails",
      category: "nails",
      categoryName: "Nails & Art",
      title: "Russian Gel Manicure & French Ombré Art",
      tag: "Client Favorite",
      price: "₹1,899",
      priceNum: 1899,
      duration: "75 mins",
      image: "assets/images/salon_nails.jpg",
      shortDesc: "Dry hardware cuticle care with a strengthening gel overlay and custom French or minimalist nail art.",
      fullDesc: "Specialized dry hardware manicure that cleans the nail bed thoroughly for a seamless, long-lasting gel overlay that stays chip-free for up to four weeks.",
      steps: [
        "Diamond bit dry hardware cuticle cleansing",
        "Nail plate apex balancing with rubber base gel",
        "Custom chrome, French ombré, or minimalist hand-painted art",
        "High-gloss non-wipe top coat and nourishing cuticle oil"
      ],
      benefits: ["Zero peeling or chipping for up to 4 weeks", "Strengthens brittle, bending natural nails", "Clean, high-gloss finish"],
      products: ["OPI GelColor", "Kodi Professional", "Bio Seaweed Gel"]
    },
    {
      id: "royal-barber-shave",
      category: "mens",
      categoryName: "Men's Grooming",
      title: "Classic Hot Towel Shave & Beard Sculpt",
      tag: "Men's Classic",
      price: "₹999",
      priceNum: 999,
      duration: "50 mins",
      image: "assets/images/salon_men_grooming.jpg",
      shortDesc: "Warm towel wrap, straight-razor detailing, soothing herbal mist, and post-shave conditioning balm.",
      fullDesc: "Traditional barbering crafted for modern comfort. We shape your beard cleanly, soothe sensitive skin with warm towels and witch hazel, and finish with a rich conditioning balm.",
      steps: [
        "Warm towel wrap with natural essential oils",
        "Precision straight-razor edging and beard shaping",
        "Cooling herbal towel compress and toner",
        "Conditioning beard oil and relaxing shoulder massage"
      ],
      benefits: ["Clean, well-defined beard lines", "Reduces razor irritation and ingrown hairs", "Softens and tames coarse facial hair"],
      products: ["Proraso Firenze", "Truefitt & Hill", "Captain Fawcett"]
    }
  ],

  packages: [
    {
      title: "The Red Carpet Makeover",
      badge: "Best Value",
      price: "₹4,999",
      origPrice: "₹7,200",
      features: [
        "Signature Scissor Cut & Professional Blowdry",
        "Hydra-Glow Facial Treatment",
        "Deluxe Pedicure & Hand Care",
        "Olaplex Express Hair Repair"
      ]
    },
    {
      title: "VIP Bridal Package",
      badge: "Exclusive",
      price: "₹24,999",
      origPrice: "₹32,000",
      features: [
        "Complete Pre-Bridal Skin and Hair Care",
        "HD or Airbrush Bridal Makeover",
        "Gel Manicure with Custom Nail Art",
        "Private Bridal Suite with Refreshments",
        "Complimentary Groom Touch-up Service"
      ]
    },
    {
      title: "Gentleman's Grooming Suite",
      badge: "Top Rated",
      price: "₹2,499",
      origPrice: "₹3,500",
      features: [
        "Precision Scissor Haircut & Scalp Scrub",
        "Classic Beard Sculpt & Hot Towel Shave",
        "Charcoal Deep-Cleanse Facial",
        "Relaxing Neck & Shoulder Massage"
      ]
    }
  ],

  salonViews: [
    {
      id: "view-1",
      title: "Main Styling Floor",
      category: "interior",
      categoryName: "Styling Floor",
      caption: "Spacious styling floor with arched backlit mirrors, comfortable leather styling chairs, and dedicated consultation stations.",
      image: "assets/images/salon_styling_arena.jpg"
    },
    {
      id: "view-2",
      title: "Reception & Waiting Lounge",
      category: "interior",
      categoryName: "Reception Lounge",
      caption: "Modern reception desk and quiet waiting lounge with warm lighting and comfortable seating.",
      image: "assets/images/salon_reception_foyer.jpg"
    },
    {
      id: "view-3",
      title: "Pedicure & Spa Area",
      category: "wash",
      categoryName: "Pedicure Area",
      caption: "Dedicated pedicure stations with leather massage chairs and ceramic wash basins.",
      image: "assets/images/salon_pedicure_spa.jpg"
    },
    {
      id: "view-4",
      title: "Hair Wash & Treatment Suite",
      category: "wash",
      categoryName: "Wash Suite",
      caption: "Ergonomic wash basins designed for relaxing scalp treatments and hair washes.",
      image: "assets/images/salon_wash_suite.jpg"
    },
    {
      id: "view-5",
      title: "Private Bridal & Styling Suite",
      category: "bridal",
      categoryName: "Bridal Suite",
      caption: "Private styling suite with dedicated mirror stations and wash basin.",
      image: "assets/images/salon_vip_bridal.jpg"
    },
    {
      id: "view-6",
      title: "Hair Care & Styling Lounge",
      category: "interior",
      categoryName: "Styling Floor",
      caption: "Specialized styling stations equipped for precision cutting, styling, and restorative hair rituals.",
      image: "assets/images/salon_hair_styling.jpg"
    }
  ],

  testimonials: [
    {
      quote: "The attention to detail and cleanliness here is exceptional. My stylist took the time to understand exactly what I wanted, and the cut grew out beautifully.",
      name: "Pooja Deshmukh",
      role: "Fashion Entrepreneur",
      rating: 5,
      service: "French Balayage & HydraFacial"
    },
    {
      quote: "The team took care of everything in the private bridal suite on my wedding day. The makeup looked natural, felt lightweight, and stayed fresh all night.",
      name: "Dr. Aastha Sharma",
      role: "Bride & Surgeon",
      rating: 5,
      service: "Royal HD Bridal Suite"
    },
    {
      quote: "Great atmosphere and consistently sharp haircuts. The hot towel shave and beard trim is something I look forward to every month.",
      name: "Vikram Singhania",
      role: "Architect",
      rating: 5,
      service: "Classic Hot Towel Shave & Beard Sculpt"
    }
  ],

  faqs: [
    {
      q: "How do I book an appointment at Magic Scissors?",
      a: "You can book online through our website, message us directly on WhatsApp (+91 99601 35849), or call our front desk."
    },
    {
      q: "Do you offer walk-in appointments?",
      a: "Yes, walk-ins are always welcome. However, we recommend booking in advance to ensure your preferred time slot and stylist, especially on weekends."
    },
    {
      q: "What safety and hygiene standards do you follow?",
      a: "All metal tools undergo ultrasonic cleaning and autoclave sterilization before every service. Linens are freshly laundered, and disposable items are strictly single-use."
    },
    {
      q: "Can I customize bridal or party makeover packages?",
      a: "Yes. We offer pre-bridal consultations where our senior team discusses your wedding timeline, outfits, and styling preferences to create a package that works for you."
    }
  ]
};
