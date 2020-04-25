const path = require('path');

function renderDashboardView(req, res) {
  res.render(path.resolve(__dirname, '../views/dashboard.pug'), {
    pageTitle: 'Template — Dashboard',
  });
}

module.exports = {
  renderDashboardView,
};
