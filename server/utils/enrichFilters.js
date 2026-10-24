const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config({ path: '../.env' });

const ISO_LANG_MAP = {
  en: { language: 'English', industry: 'Hollywood' },
  hi: { language: 'Hindi', industry: 'Bollywood' },
  ja: { language: 'Japanese', industry: 'Japanese' },
  ko: { language: 'Korean', industry: 'Korean' },
  zh: { language: 'Mandarin', industry: 'World' },
  cn: { language: 'Cantonese', industry: 'World' },
  fr: { language: 'French', industry: 'European' },
  it: { language: 'Italian', industry: 'European' },
  de: { language: 'German', industry: 'European' },
  es: { language: 'Spanish', industry: 'European' },
  sv: { language: 'Swedish', industry: 'European' },
  ru: { language: 'Russian', industry: 'European' },
  pt: { language: 'Portuguese', industry: 'World' }
};

const EXTRA_BOLLYWOOD = [
  {
    title: '3 Idiots',
    description: 'Two friends embark on a quest for a lost buddy. On this journey, they reminisce over their college days and the memories of their friend who inspired them to think differently.',
    releaseYear: 2009,
    genres: ['Comedy', 'Drama'],
    director: 'Rajkumar Hirani',
    cast: ['Aamir Khan', 'Madhavan', 'Mona Singh', 'Sharman Joshi', 'Kareena Kapoor'],
    duration: 170,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7TC9jVnOamjVd9ZfNqC0uK0xH6f.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.9,
    numRatings: 2150
  },
  {
    title: 'Dangal',
    description: 'Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.',
    releaseYear: 2016,
    genres: ['Action', 'Biography', 'Drama'],
    director: 'Nitesh Tiwari',
    cast: ['Aamir Khan', 'Fatima Sana Shaikh', 'Sanya Malhotra', 'Sakshi Tanwar'],
    duration: 161,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5129c9Iq3z9G1qHn1aDfg548R9q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.8,
    numRatings: 1890
  },
  {
    title: 'Sholay',
    description: 'After his family is murdered by a notorious and ruthless bandit of the ravines, a former police officer enlists the services of two outlaws to take revenge.',
    releaseYear: 1975,
    genres: ['Action', 'Adventure', 'Drama'],
    director: 'Ramesh Sippy',
    cast: ['Amitabh Bachchan', 'Dharmendra', 'Hema Malini', 'Sanjeev Kumar', 'Amjad Khan'],
    duration: 198,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/n5Xy2yFzG3d3w99bO9Qz0W9LpZk.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.7,
    numRatings: 1240
  },
  {
    title: 'Lagaan',
    description: 'The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers to avoid exorbitant taxes.',
    releaseYear: 2001,
    genres: ['Adventure', 'Drama', 'Musical'],
    director: 'Ashutosh Gowariker',
    cast: ['Aamir Khan', 'Gracy Singh', 'Rachel Shelley', 'Paul Blackthorne'],
    duration: 224,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/y1m6cKzH7Zc1s0XfX0X3h1Y4Q9.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/fQqA64t0ZlF6yO9qP3h4Qo38u2S.jpg',
    averageRating: 4.8,
    numRatings: 1540
  },
  {
    title: 'Sacred Games',
    description: 'A link in their pasts leads an honest cop to a fugitive gang boss, whose cryptic warning spurs the officer on a quest to save Mumbai from cataclysm.',
    releaseYear: 2018,
    genres: ['Crime', 'Drama', 'Thriller'],
    director: 'Anurag Kashyap & Vikramaditya Motwane',
    cast: ['Saif Ali Khan', 'Nawazuddin Siddiqui', 'Radhika Apte', 'Pankaj Tripathi'],
    duration: 50,
    language: 'Hindi',
    industry: 'Bollywood',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9h1x0QzL5tF6bB8C3X9Z1Y2X4Q.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/uLtVba9Ns1eZg39qHj7ukxT074p.jpg',
    averageRating: 4.8,
    numRatings: 980
  },
  {
    title: 'Mirzapur',
    description: 'A shocking incident at a wedding procession ignites a series of events entangling two families in the lawless city of Mirzapur.',
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
    averageRating: 4.7,
    numRatings: 1120
  }
];

const EXTRA_KOREAN = [
  {
    title: 'Parasite',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
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
    numRatings: 16800
  },
  {
    title: 'Squid Game',
    description: 'Hundreds of cash-strapped players accept a strange invitation to compete in children games. Inside, a tempting prize awaits with deadly high stakes.',
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
    numRatings: 14200
  },
  {
    title: 'Crash Landing on You',
    description: 'A paragliding mishap drops a South Korean heiress into North Korea -- and into the life of an army officer, who decides he will help her hide.',
    releaseYear: 2019,
    genres: ['Comedy', 'Romance', 'Drama'],
    director: 'Lee Jeong-hyo',
    cast: ['Hyun Bin', 'Son Ye-jin', 'Seo Ji-hye', 'Kim Jung-hyun'],
    duration: 75,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XG0X9s5C6V0Y7j4FhUuU4sUeA.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.9,
    numRatings: 8900
  },
  {
    title: 'Train to Busan',
    description: 'While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.',
    releaseYear: 2016,
    genres: ['Action', 'Horror', 'Thriller'],
    director: 'Yeon Sang-ho',
    cast: ['Gong Yoo', 'Ma Dong-seok', 'Jung Yu-mi', 'Kim Su-an'],
    duration: 118,
    language: 'Korean',
    industry: 'Korean',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vVpEOvdxVBP2aV166j5X0b1Y7z8.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    averageRating: 4.7,
    numRatings: 9400
  }
];

const EXTRA_JAPANESE = [
  {
    title: 'Spirited Away',
    description: 'During her family move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    releaseYear: 2001,
    genres: ['Animation', 'Family', 'Fantasy', 'Adventure'],
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'],
    duration: 125,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/393r8Vpq7hYqioJbT27Y2vFkWZ5.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/bXNvzjYE79yAgnOT5p49q8b8n0.jpg',
    averageRating: 4.9,
    numRatings: 15300
  },
  {
    title: 'Your Name.',
    description: 'Two teenagers share a profound, magical connection upon discovering they are swapping bodies. Things manage to become even more complicated when the boy and girl decide to meet in person.',
    releaseYear: 2016,
    genres: ['Animation', 'Romance', 'Drama', 'Fantasy'],
    director: 'Makoto Shinkai',
    cast: ['Ryunosuke Kamiki', 'Mone Kamishiraishi', 'Ryo Narita', 'Aoi Yuki'],
    duration: 107,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Movie',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6q2P6eGHstqz.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/dIWwZW7dJJNCiNp62C6k227J6a2.jpg',
    averageRating: 4.9,
    numRatings: 11200
  },
  {
    title: 'Attack on Titan',
    description: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    releaseYear: 2013,
    genres: ['Animation', 'Action', 'Adventure', 'Fantasy'],
    director: 'Tetsuro Araki',
    cast: ['Yuki Kaji', 'Yui Ishikawa', 'Marina Inoue', 'Hiroshi Kamiya'],
    duration: 25,
    language: 'Japanese',
    industry: 'Japanese',
    contentType: 'Web Series',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/bXNvzjYE79yAgnOT5p49q8b8n0.jpg',
    averageRating: 4.9,
    numRatings: 13500
  }
];

const EXTRA_WEBSERIES = [
  {
    title: 'Breaking Bad',
    description: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family financial future.',
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
    numRatings: 18200
  },
  {
    title: 'Stranger Things',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
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
    numRatings: 16500
  },
  {
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.',
    releaseYear: 2011,
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    director: 'David Benioff & D.B. Weiss',
    cast: ['Emilia Clarke', 'Kit Harington', 'Peter Dinklage', 'Lena Headey'],
    duration: 57,
    language: 'English',
    industry: 'Hollywood',
    contentType: 'Drama',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    bannerUrl: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6p0qYq2.jpg',
    averageRating: 4.8,
    numRatings: 22000
  }
];

async function updateFilters() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie_recommendation_db';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    console.log('Classifying existing movies into Hollywood, Japanese, Korean, European, and World...');
    
    // Default update all movies to Hollywood / English / Movie first
    await Movie.updateMany(
      { $or: [{ industry: { $exists: false } }, { language: { $exists: false } }] },
      { $set: { industry: 'Hollywood', language: 'English', contentType: 'Movie' } }
    );

    // Tag specific famous titles already in the TMDB database
    await Movie.updateMany(
      { title: { $regex: /rashomon|seven samurai|godzilla|spirited away/i } },
      { $set: { industry: 'Japanese', language: 'Japanese', contentType: 'Movie' } }
    );

    await Movie.updateMany(
      { title: { $regex: /cinderella|alice in wonderland|dune|batman|avengers|matrix|star wars/i } },
      { $set: { industry: 'Hollywood', language: 'English', contentType: 'Movie' } }
    );

    // Set some drama movies as 'Drama' contentType if genre includes Drama
    await Movie.updateMany(
      { genres: 'Drama', contentType: 'Movie', averageRating: { $gte: 4.6 } },
      { $set: { contentType: 'Drama' } }
    );

    // Insert rich Indian/Bollywood, Korean, Japanese, and Web Series collections
    const allExtras = [...EXTRA_BOLLYWOOD, ...EXTRA_KOREAN, ...EXTRA_JAPANESE, ...EXTRA_WEBSERIES];
    
    for (const item of allExtras) {
      const exists = await Movie.findOne({ title: item.title });
      if (!exists) {
        await Movie.create(item);
        console.log(`+ Added: [${item.industry} - ${item.contentType}] ${item.title}`);
      } else {
        await Movie.updateOne({ _id: exists._id }, { $set: item });
        console.log(`✓ Updated: [${item.industry} - ${item.contentType}] ${item.title}`);
      }
    }

    const counts = await Promise.all([
      Movie.countDocuments({ industry: 'Hollywood' }),
      Movie.countDocuments({ industry: 'Bollywood' }),
      Movie.countDocuments({ industry: 'Korean' }),
      Movie.countDocuments({ industry: 'Japanese' }),
      Movie.countDocuments({ contentType: 'Movie' }),
      Movie.countDocuments({ contentType: 'Web Series' }),
      Movie.countDocuments({ contentType: 'Drama' })
    ]);

    console.log('==============================================');
    console.log(`Industry Counts:
  • Hollywood:  ${counts[0]}
  • Bollywood:  ${counts[1]}
  • Korean:     ${counts[2]}
  • Japanese:   ${counts[3]}`);
    console.log(`Content Type Counts:
  • Movie:      ${counts[4]}
  • Web Series: ${counts[5]}
  • Drama:      ${counts[6]}`);
    console.log('==============================================');
    console.log('Filters and data updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating filters:', err);
    process.exit(1);
  }
}

updateFilters();
