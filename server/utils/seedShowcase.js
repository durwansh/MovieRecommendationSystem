const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config({ path: '../.env' });

const SHOWCASE_TITLES = [
  // 🇮🇳 BOLLYWOOD BLOCKBUSTERS & CLASSICS
  {
    title: '3 Idiots',
    description: 'Two friends embark on a quest for a lost buddy who inspired them to think independently, challenging the rigid Indian education system.',
    releaseYear: 2009,
    genres: ['Comedy', 'Drama'],
    director: 'Rajkumar Hirani',
    cast: ['Aamir Khan', 'R. Madhavan', 'Sharman Joshi', 'Kareena Kapoor'],
    duration: 170,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7TC9jVnOamjVd9ZfNqC0uK0xH6f.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.9,
    numRatings: 3450
  },
  {
    title: 'Dangal',
    description: 'Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class champions against societal prejudice.',
    releaseYear: 2016,
    genres: ['Action', 'Biography', 'Drama'],
    director: 'Nitesh Tiwari',
    cast: ['Aamir Khan', 'Fatima Sana Shaikh', 'Sanya Malhotra'],
    duration: 161,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5129c9Iq3z9G1qHn1aDfg548R9q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.8,
    numRatings: 2890
  },
  {
    title: 'Dilwale Dulhania Le Jayenge',
    description: 'Raj and Simran meet on a European rail holiday and fall in love, but must win over her strict, traditional father in Punjab.',
    releaseYear: 1995,
    genres: ['Romance', 'Drama', 'Musical'],
    director: 'Aditya Chopra',
    cast: ['Shah Rukh Khan', 'Kajol', 'Amrish Puri', 'Anupam Kher'],
    duration: 189,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.8,
    numRatings: 4100
  },
  {
    title: 'Sholay',
    description: 'An ex-policeman hires two small-time convicts, Jai and Veeru, to capture the ruthless dacoit Gabbar Singh who murdered his family.',
    releaseYear: 1975,
    genres: ['Action', 'Adventure', 'Drama'],
    director: 'Ramesh Sippy',
    cast: ['Amitabh Bachchan', 'Dharmendra', 'Hema Malini', 'Amjad Khan'],
    duration: 198,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/n5Xy2yFzG3d3w99bO9Qz0W9LpZk.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.8,
    numRatings: 2240
  },
  {
    title: 'RRR',
    description: 'A fearless revolutionary and an officer in the British force decide to join forces and chart an inspiring path against the despotic rulers.',
    releaseYear: 2022,
    genres: ['Action', 'Drama', 'History'],
    director: 'S.S. Rajamouli',
    cast: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
    duration: 182,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wE0Q24v50m0p64dEa4UqYpL388q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.9,
    numRatings: 5600
  },
  {
    title: 'K.G.F: Chapter 2',
    description: 'The blood-soaked land of Kolar Gold Fields has a new overlord now: Rocky, whose name strikes fear in the heart of his foes and government alike.',
    releaseYear: 2022,
    genres: ['Action', 'Crime', 'Drama'],
    director: 'Prashanth Neel',
    cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon', 'Srinidhi Shetty'],
    duration: 168,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/khSVd2Qn3L4R0X5Y6vFkWZ5.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.8,
    numRatings: 4200
  },

  // 📺 POPULAR WEBSERIES (BOLLYWOOD & HOLLYWOOD)
  {
    title: 'Sacred Games',
    description: 'An honest policeman is warned by an enigmatic crime lord that Mumbai has only 25 days before total destruction.',
    releaseYear: 2018,
    genres: ['Crime', 'Drama', 'Thriller'],
    director: 'Anurag Kashyap',
    cast: ['Saif Ali Khan', 'Nawazuddin Siddiqui', 'Radhika Apte', 'Pankaj Tripathi'],
    duration: 50,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9h1x0QzL5tF6bB8C3X9Z1Y2X4Q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.8,
    numRatings: 3100
  },
  {
    title: 'Mirzapur',
    description: 'The mafia don of Mirzapur and carpet exporter Akhandanand Tripathi rules with an iron fist, but rivalry ignites when two law-abiding brothers cross his hot-headed son.',
    releaseYear: 2018,
    genres: ['Action', 'Crime', 'Drama'],
    director: 'Karan Anshuman',
    cast: ['Pankaj Tripathi', 'Ali Fazal', 'Divyendu Sharma', 'Shweta Tripathi'],
    duration: 55,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7a1b0QzL5tF6bB8C3X9Z1Y2X4Q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.8,
    numRatings: 3400
  },
  {
    title: 'Breaking Bad',
    description: 'A terminally ill chemistry teacher teams up with a former student to manufacture crystal meth to secure his family financial freedom.',
    releaseYear: 2008,
    genres: ['Crime', 'Drama', 'Thriller'],
    director: 'Vince Gilligan',
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'Giancarlo Esposito'],
    duration: 49,
    language: 'English',
    industry: 'Hollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    averageRating: 4.9,
    numRatings: 18400
  },
  {
    title: 'Stranger Things',
    description: 'When a boy vanishes into thin air, a small town discovers government conspiracies, supernatural dimensions, and an extraordinary girl named Eleven.',
    releaseYear: 2016,
    genres: ['Sci-Fi', 'Drama', 'Mystery', 'Horror'],
    director: 'The Duffer Brothers',
    cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder', 'David Harbour'],
    duration: 50,
    language: 'English',
    industry: 'Hollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    averageRating: 4.8,
    numRatings: 16800
  },
  {
    title: 'The Boys',
    description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers rather than use them for good.',
    releaseYear: 2019,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    director: 'Eric Kripke',
    cast: ['Karl Urban', 'Jack Quaid', 'Antony Starr', 'Erin Moriarty'],
    duration: 60,
    language: 'English',
    industry: 'Hollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7Ns6tO3aYjppI5Lo0FcePs89Um1.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg',
    averageRating: 4.8,
    numRatings: 12500
  },

  // 🇰🇷 KOREAN MOVIES & K-DRAMAS
  {
    title: 'Parasite',
    description: 'A poor family schemes to become employed by a wealthy family by infiltrating their household and posing as unrelated, highly qualified individuals.',
    releaseYear: 2019,
    genres: ['Comedy', 'Thriller', 'Drama'],
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    duration: 132,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.9,
    numRatings: 16900
  },
  {
    title: 'Squid Game',
    description: 'Hundreds of cash-strapped players accept a deadly invitation to compete in children games for a tempting 45.6 billion won prize.',
    releaseYear: 2021,
    genres: ['Action', 'Mystery', 'Drama', 'Thriller'],
    director: 'Hwang Dong-hyuk',
    cast: ['Lee Jung-jae', 'Park Hae-soo', 'Wi Ha-jun', 'Jung Ho-yeon'],
    duration: 60,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/dDlGkWbtFvdL0YhUuU4sUeA3jG.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/oaGvjB0DvdurWhf967FAGbrPhEf.jpg',
    averageRating: 4.8,
    numRatings: 14500
  },
  {
    title: 'Crash Landing on You',
    description: 'A South Korean heiress accidentally crash-lands in North Korea after a paragliding storm, where an army captain protects her.',
    releaseYear: 2019,
    genres: ['Comedy', 'Romance', 'Drama'],
    director: 'Lee Jeong-hyo',
    cast: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye'],
    duration: 75,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XG0X9s5C6V0Y7j4FhUuU4sUeA.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.9,
    numRatings: 9100
  },
  {
    title: 'Vincenzo',
    description: 'A Korean-Italian mafia lawyer visits his motherland and gives an unrivaled conglomerate a taste of its own medicine with sidekick justice.',
    releaseYear: 2021,
    genres: ['Action', 'Comedy', 'Crime', 'Drama'],
    director: 'Kim Hee-won',
    cast: ['Song Joong-ki', 'Jeon Yeo-been', 'Ok Taec-yeon'],
    duration: 80,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7a1b0QzL5tF6bB8C3X9Z1Y2X4Q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.8,
    numRatings: 7800
  },
  {
    title: 'Train to Busan',
    description: 'While a zombie virus ravages South Korea, terrified passengers fight for survival on a high-speed train traveling from Seoul to Busan.',
    releaseYear: 2016,
    genres: ['Action', 'Horror', 'Thriller'],
    director: 'Yeon Sang-ho',
    cast: ['Gong Yoo', 'Ma Dong-seok', 'Jung Yu-mi'],
    duration: 118,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vVpEOvdxVBP2aV166j5X0b1Y7z8.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.8,
    numRatings: 9600
  },

  // 🇯🇵 JAPANESE ANIME & MASTERPIECES
  {
    title: 'Spirited Away',
    description: 'A young girl enters the world of spirits and gods, working in a wondrous bathhouse to rescue her parents turned into pigs.',
    releaseYear: 2001,
    genres: ['Animation', 'Family', 'Fantasy', 'Adventure'],
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    duration: 125,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/393r8Vpq7hYqioJbT27Y2vFkWZ5.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/bXNvzjYE79yAgnOT5p49q8b8n0.jpg',
    averageRating: 4.9,
    numRatings: 15400
  },
  {
    title: 'Your Name.',
    description: 'Two teenagers who live in different parts of Japan magically swap bodies and form an emotional bond across time and space.',
    releaseYear: 2016,
    genres: ['Animation', 'Romance', 'Drama', 'Fantasy'],
    director: 'Makoto Shinkai',
    cast: ['Ryunosuke Kamiki', 'Mone Kamishiraishi'],
    duration: 107,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6q2P6eGHstqz.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/dIWwZW7dJJNCiNp62C6k227J6a2.jpg',
    averageRating: 4.9,
    numRatings: 11400
  },
  {
    title: 'Attack on Titan',
    description: 'Humanity lives behind three massive walls protecting them from colossal man-eating humanoids known as Titans.',
    releaseYear: 2013,
    genres: ['Animation', 'Action', 'Adventure', 'Fantasy'],
    director: 'Tetsuro Araki',
    cast: ['Yuki Kaji', 'Yui Ishikawa', 'Marina Inoue'],
    duration: 25,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/bXNvzjYE79yAgnOT5p49q8b8n0.jpg',
    averageRating: 4.9,
    numRatings: 13800
  },
  {
    title: 'Demon Slayer: Mugen Train',
    description: 'Tanjiro and the Demon Slayer Corps join Flame Hashira Kyojuro Rengoku to investigate a series of mysterious disappearances aboard the Mugen Train.',
    releaseYear: 2020,
    genres: ['Animation', 'Action', 'Fantasy', 'Adventure'],
    director: 'Haruo Sotozaki',
    cast: ['Natsuki Hanae', 'Akari Kito', 'Hiro Shimono', 'Satoshi Hino'],
    duration: 117,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODIwYUtZv52iQW059.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/qjGar523nGQv7QzK1P5Z1Y2X4Q.jpg',
    averageRating: 4.9,
    numRatings: 12200
  },

  // 🎭 ACCLAIMED DRAMAS
  {
    title: 'Game of Thrones',
    description: 'Noble houses fight for the Iron Throne of Westeros while an army of the dead threatens to engulf the living world.',
    releaseYear: 2011,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    director: 'David Benioff',
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage'],
    duration: 57,
    language: 'English',
    industry: 'Hollywood',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6p0qYq2.jpg',
    averageRating: 4.8,
    numRatings: 22400
  },
  {
    title: 'The Crown',
    description: 'Chronicles the political rivalries and romances of Queen Elizabeth II reign and the events that shaped the second half of the twentieth century.',
    releaseYear: 2016,
    genres: ['Biography', 'Drama', 'History'],
    director: 'Peter Morgan',
    cast: ['Claire Foy', 'Olivia Colman', 'Imelda Staunton', 'Matt Smith'],
    duration: 58,
    language: 'English',
    industry: 'European',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/123XyZ5W6V7U8T9Q0P1O2N3M4L.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.7,
    numRatings: 8400
  }
];

async function seedShowcase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_recommendation_db';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    for (const item of SHOWCASE_TITLES) {
      const exists = await Movie.findOne({ title: item.title });
      if (!exists) {
        await Movie.create(item);
        console.log(`+ Added [${item.industry} | ${item.contentType} | ${item.language}]: ${item.title}`);
      } else {
        await Movie.updateOne({ _id: exists._id }, { $set: item });
        console.log(`✓ Updated [${item.industry} | ${item.contentType} | ${item.language}]: ${item.title}`);
      }
    }

    console.log('==============================================');
    console.log('Showcase catalog loaded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding showcase:', err);
    process.exit(1);
  }
}

seedShowcase();
