exports.scriptSrcUrls = () => {
  return [
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://*.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
  ];
};

exports.styleSrcUrls = () => {
  return [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://*.fontawesome.com",
  ];
};

exports.connectSrcUrls = () => {
  return [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://*.fontawesome.com",
    "https://events.mapbox.com",
  ];
};
exports.fontSrcUrls = () => {
  return [
    "https://*.fontawesome.com",
    "https://*.gstatic.com",
  ];
};
exports.imgSrcUrls = () => {
  return [
    "https://res.cloudinary.com/campcloud/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
    "https://images.unsplash.com",
  ];
};
