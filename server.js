const app = require('./app'); // Імпортуємо додаток
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
