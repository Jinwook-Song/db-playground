import * as mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/movies');

const moviesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  rating: {
    type: Number,
    required: true,
    min: [1, 'No movie deserves less than 1'],
    max: [10, 'No movie is better than 10'],
  },
});

const Movie = mongoose.model('Movie', moviesSchema);

// const movie = await Movie.create({
//   title: 'Mongoose',
//   rating: 40.5,
// });

const movies = await Movie.find({ director: 'Christopher Nolan' });

console.log(movies.map((m) => m.title));

await mongoose.disconnect();
