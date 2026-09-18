/**
 * Magic Scissors - Luxury Salon Data Source
 * Easily customizable for the client
 */
export const SALON_DATA = {
  brand: {
    name: "Magic Scissors",
    shortName: "MS",
    tagline: "Luxury Unisex Salon & Aesthetic Studio",
    subheading: "Where Master Artistry Meets Timeless Elegance",
    founder: "Curated by Master Stylists",
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
      { value: "15+", label: "Master Stylists", sub: "Certified International Artists" },
      { value: "25k+", label: "Happy Clients", sub: "Groomed & Pampered" },
      { value: "100%", label: "Hygiene Standard", sub: "Autoclave Sterilized Tools" }
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
      fullDesc: "Every cut begins with an in-depth consultation with a senior stylist to assess your lifestyle, hair texture, and styling preferences. We finish with a relaxing scalp massage, precision scissor shaping, and a polished blowout.",
      steps: [
        "Personal consultation & hair texture analysis",
        "Aromatherapeutic detox hair wash & deep conditioner",
        "Precision scissor cut tailored to your personal style",
        "Thermal heat-protection mist & signature blowout finish"
      ],
      benefits: ["Accentuate jawline and natural curls", "Split ends removal with zero volume loss", "Long-lasting weightless movement"],
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
      shortDesc: "Intense molecular hair restoration that infuses deep amino acids, eliminating frizz and imparting liquid glass shine.",
      fullDesc: "Formulated with hydrolyzed keratin, silk proteins, and caviar extract, this treatment deeply repairs damaged hair cuticles caused by heat and pollution. Imparts mirror-like glossy reflect that lasts up to 6 months.",
      steps: [
        "Clarifying scalp cleanse to open hair cuticles",
        "Strand-by-strand caviar keratin emulsion infusion",
        "Infrared thermal sealing with micro-mist hydration",
        "Cool-shot cuticle lock & silk protein serum application"
      ],
      benefits: ["100% frizz control in high humidity", "Restores elasticity and natural tensile strength", "Effortless styling for 20+ weeks"],
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
      shortDesc: "Hand-painted sun-kissed gradients, honey caramel or mushroom blonde dimensions with bond multiplier protection.",
      fullDesc: "Our colorists create seamless, custom color transitions that grow out naturally without harsh demarcation lines. Powered by bonder technology to protect keratin integrity throughout lightening.",
      steps: [
        "Custom color formulation based on undertone matching",
        "Freehand Balayage & Foilayage placement",
        "Post-lightening bonding bath & neutralizing gloss glaze",
        "Anti-fade lock masque & dynamic radiant blowout"
      ],
      benefits: ["Graceful, low-maintenance root grow-out", "Rich multidimensional depth and optical volume", "Zero straw-like dryness"],
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
      tag: "Signature Masterpiece",
      price: "₹14,999",
      priceNum: 14999,
      duration: "240 mins",
      image: "assets/images/salon_bridal.jpg",
      shortDesc: "Long-lasting, photo-ready bridal makeup with bespoke hair styling, premium lashes, and dupatta draping.",
      fullDesc: "Crafted for the bride who wants to look timeless and feel completely comfortable all day. Our bridal team creates breathable, waterproof makeup that stays fresh under venue lighting and through hours of celebration.",
      steps: [
        "Skin prep & soothing ice-roller treatment",
        "Customized lightweight HD airbrush base application",
        "Defined eye artistry with lightweight 3D lashes",
        "Bridal hair couture with fresh florals & dupatta draping"
      ],
      benefits: ["16-hour sweat and smudge-resistant finish", "Looks soft and seamless both in person and on camera", "Private VIP bridal suite experience"],
      products: ["Charlotte Tilbury Hollywood Flawless", "Dior Backstage", "MAC Studio Fix", "Huda Beauty"]
    },
    {
      id: "russian-gel-nails",
      category: "nails",
      categoryName: "Nails & Art",
      title: "Russian Gel Manicure & French Ombré Art",
      tag: "High Fashion",
      price: "₹1,899",
      priceNum: 1899,
      duration: "75 mins",
      image: "assets/images/salon_nails.jpg",
      shortDesc: "E-file precision cuticle work combined with indestructible gel overlay and custom chrome or minimalist art.",
      fullDesc: "The pinnacle of cuticle precision. Dry hardware technique provides clean nail beds, allowing gel application millimeter-close to the cuticles for an ultra-long-lasting manicure that looks fresh for 4+ weeks.",
      steps: [
        "Diamond bit dry hardware cuticle cleansing",
        "Nail plate apex balancing with rubber base gel",
        "Custom chrome, French ombré, or abstract hand-painted art",
        "High-gloss diamond non-wipe top coat & organic cuticle elixir"
      ],
      benefits: ["Zero peeling or chipping for 4 weeks", "Strengthens brittle, bending natural nails", "Exquisite high-fashion finish"],
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
      shortDesc: "Warm eucalyptus steam, straight-razor detailing, soothing herbal towels, and post-shave balm.",
      fullDesc: "Traditional barbering crafted for modern comfort. We shape your beard cleanly, soothe sensitive skin with warm towels and witch hazel, and finish with a rich conditioning balm.",
      steps: [
        "Warm towel infusion with natural essential oils",
        "Precision straight-razor edging & cheek definition",
        "Cooling herbal towel press & witch hazel tonic",
        "Deep conditioning beard oil & shoulder massage"
      ],
      benefits: ["Clean, well-defined beard lines", "Relieves razor irritation and ingrown hairs", "Softens and tames coarse facial hair"],
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
        "Signature Scissor Cut & Couture Blowdry",
        "Hydra-Glow Dermal Facial Ritual",
        "Deluxe Pedicure & Hand Reflexology",
        "Olaplex Express Hair Rebirth Therapy"
      ]
    },
    {
      title: "VIP Bridal Euphoria",
      badge: "Exclusive",
      price: "₹24,999",
      origPrice: "₹32,000",
      features: [
        "Full Pre-Bridal Skin, Hair & Body Rituals",
        "Royal HD / Airbrush Bridal Makeover",
        "Russian Sculpted Nails & Chrome Art",
        "Private VIP Bridal Lounge with Refreshments",
        "Complimentary Groom Touch-up Service"
      ]
    },
    {
      title: "Gentleman's Royal Suite",
      badge: "Top Rated",
      price: "₹2,499",
      origPrice: "₹3,500",
      features: [
        "Master Scissor Haircut & Scalp Scrub",
        "Classic Beard Sculpt & Hot Towel Shave",
        "Charcoal D-Tan & Pore Vacuum Facial",
        "Stress Relief Neck & Shoulder Massage"
      ]
    }
  ],

  salonViews: [
    {
      id: "view-1",
      title: "The Grand Styling Arena",
      category: "interior",
      categoryName: "Styling Arena",
      caption: "Spacious styling floor with custom arched backlit mirrors, cognac leather salon chairs, and dedicated portals to the Makeup & Skin Lounge.",
      image: "assets/images/salon_styling_arena.jpg"
    },
    {
      id: "view-2",
      title: "Welcome Foyer & Reception",
      category: "interior",
      categoryName: "Welcome Foyer",
      caption: "Contemporary luxury foyer featuring fluted black architectural desk, warm illuminated Magic Scissors signage, and designer pendant chandeliers.",
      image: "assets/images/salon_reception_foyer.jpg"
    },
    {
      id: "view-3",
      title: "Hydro-Therapy & Pedicure Spa Bay",
      category: "wash",
      categoryName: "Spa & Wash Bay",
      caption: "Dual ceramic shampoo wash stations paired with a diamond-quilted leather pedicure massage throne and illuminated hair care backbar.",
      image: "assets/images/salon_pedicure_spa.jpg"
    },
    {
      id: "view-4",
      title: "Head Spa & Wash Sanctuary",
      category: "wash",
      categoryName: "Head Spa Bay",
      caption: "Artisan hair wash stations equipped with reclining leather pods, professional backbar formulations, and custom Magic Scissors embroidered linens.",
      image: "assets/images/salon_wash_suite.jpg"
    },
    {
      id: "view-5",
      title: "Private VIP Bridal & Make-Up Suite",
      category: "bridal",
      categoryName: "VIP Bridal Suite",
      caption: "Exclusive private sanctuary featuring gold-trimmed ivory chairs, warm halo-lit vanity mirrors with etched MS crest, and personal vanity consoles.",
      image: "assets/images/salon_vip_bridal.jpg"
    }
  ],

  testimonials: [
    {
      quote: "Magic Scissors has set a totally new benchmark in luxury salon experience. The attention to detail, hygienic protocols, and the scissor precision of their stylists are unmatched.",
      name: "Pooja Deshmukh",
      role: "Fashion Entrepreneur",
      rating: 5,
      service: "French Balayage & HydraFacial"
    },
    {
      quote: "The royal bridal package was a dream. They took care of everything in the private VIP suite, and my makeup looked as fresh at 2 AM as it did at 4 PM. Highly recommended!",
      name: "Dr. Aastha Sharma",
      role: "Bride & Surgeon",
      rating: 5,
      service: "Royal HD Bridal Suite"
    },
    {
      quote: "Best men's grooming in town hands down. The beard shaping and hot towel ritual is pure therapy after a grueling work week.",
      name: "Vikram Singhania",
      role: "Architect",
      rating: 5,
      service: "Classic Hot Towel Shave & Beard Sculpt"
    }
  ],

  faqs: [
    {
      q: "How do I book an appointment at Magic Scissors?",
      a: "You can book directly by clicking our 'Book Appointment' button, chatting with us instantly on WhatsApp (+91 99601 35849), or by tapping the dialpad call button to speak directly with our front desk concierge."
    },
    {
      q: "Do you offer walk-in appointments?",
      a: "Yes, walk-ins are warmly welcomed! However, to guarantee your preferred master stylist and avoid waiting times, we recommend booking in advance, especially on weekends."
    },
    {
      q: "What safety and hygiene standards do you follow?",
      a: "We maintain hospital-grade cleanliness: every metal scissor, comb, and clipper undergoes 3-stage ultrasonic cleansing and medical autoclave UV sterilization prior to every client service. Disposables are strictly single-use."
    },
    {
      q: "Can I customize bridal or party makeover packages?",
      a: "Absolutely. We provide personalized pre-bridal consultations where our creative director designs a bespoke package aligned with your outfits, events, and skin timeline."
    }
  ]
};
