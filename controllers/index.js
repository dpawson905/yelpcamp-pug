exports.indexPage = (req, res, next) => {
  res.render('index', { page: 'Home' });
}