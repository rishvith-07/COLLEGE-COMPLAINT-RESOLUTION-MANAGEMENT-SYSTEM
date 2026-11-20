import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CampusResolve API Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to handle complaints, authentication, and administrative workflows.`);
});
