const Provider = require('../models/Provider');

exports.addOrUpdate = async (req, res) => {
  try {
    const ownerEmail = req.user?.email || req.body.ownerEmail;
    if (!ownerEmail) return res.status(400).json({ message: 'Owner email required' });

    const {
      name, location, foodType, perTiffinPrice, monthlyPrice, menu, openTime, contactNumber
    } = req.body;
    const weeklyMenu = req.body.weeklyMenu ? JSON.parse(req.body.weeklyMenu) : undefined;
    const uploaded = (req.files || []).map(f => `/uploads/${f.filename}`);

    let provider = await Provider.findOne({ ownerEmail });
    if (provider) {
      provider.name = name || provider.name;
      provider.location = location || provider.location;
      provider.foodType = foodType || provider.foodType;
      provider.perTiffinPrice = perTiffinPrice ? Number(perTiffinPrice) : provider.perTiffinPrice;
      provider.monthlyPrice = monthlyPrice ? Number(monthlyPrice) : provider.monthlyPrice;
      provider.menu = menu || provider.menu;
      provider.openTime = openTime || provider.openTime;
      provider.contactNumber = contactNumber || provider.contactNumber;
      if (weeklyMenu) provider.weeklyMenu = weeklyMenu;
      if (uploaded.length) provider.images = (provider.images || []).concat(uploaded);
      await provider.save();
      return res.json({ success: true, provider });
    } else {
      const toCreate = {
        ownerEmail, name, location, foodType,
        perTiffinPrice: perTiffinPrice ? Number(perTiffinPrice) : undefined,
        monthlyPrice: monthlyPrice ? Number(monthlyPrice) : undefined,
        menu, openTime, contactNumber, weeklyMenu, images: uploaded
      };
      provider = await Provider.create(toCreate);
      return res.status(201).json({ success: true, provider });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { q, foodType, minPrice, maxPrice, location } = req.query;
    const filter = {};
    
    // Search by name, location, or menu using 'q' parameter
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: regex }, 
        { location: regex }, 
        { menu: regex }
      ];
    }
    
    // Additional location-specific filter
    if (location && location.trim()) {
      filter.location = new RegExp(location.trim(), 'i');
    }
    
    // Food type filter
    if (foodType && foodType.trim()) {
      filter.foodType = foodType.toLowerCase().trim();
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.perTiffinPrice = {};
      if (minPrice) filter.perTiffinPrice.$gte = Number(minPrice);
      if (maxPrice) filter.perTiffinPrice.$lte = Number(maxPrice);
    }
    
    console.log('Search filter:', JSON.stringify(filter, null, 2));
    
    const providers = await Provider.find(filter).limit(200);
    console.log(`Found ${providers.length} providers`);
    
    res.json(providers);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};