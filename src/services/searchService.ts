import { APIError } from '../utils/errorHandling';

interface SearchResult {
  url: string;
  title: string;
  japaneseSource?: string;
}

// Cache for search results
const searchResultCache = new Map<string, SearchResult>();

// Cache key generator for search results
function generateSearchCacheKey(category: string, title: string, language: string): string {
  return `${category}:${title}:${language}`;
}

// Known IMDb IDs and Japanese movie links
const KNOWN_MOVIES: Record<string, { imdbId: string; eigaUrl?: string }> = {
  '羅生門': {
    imdbId: 'tt0042876',
    eigaUrl: 'https://eiga.com/movie/20687/'
  },
  '七人の侍': {
    imdbId: 'tt0047478',
    eigaUrl: 'https://eiga.com/movie/20688/'
  },
  'おくりびと': {
    imdbId: 'tt1069238',
    eigaUrl: 'https://eiga.com/movie/52747/'
  },
  '万引き家族': {
    imdbId: 'tt8075192',
    eigaUrl: 'https://eiga.com/movie/86853/'
  },
  'ドライブ・マイ・カー': {
    imdbId: 'tt14039582',
    eigaUrl: 'https://eiga.com/movie/94777/'
  }
};

// Known Goodreads IDs and Japanese book links
const KNOWN_BOOKS: Record<string, { goodreadsId: string; bookmeterUrl?: string }> = {
  'そして誰もいなくなった': {
    goodreadsId: '16299',
    bookmeterUrl: 'https://bookmeter.com/books/548658'
  },
  '斜陽': {
    goodreadsId: '2256661',
    bookmeterUrl: 'https://bookmeter.com/books/9785'
  },
  '容疑者Xの献身': {
    goodreadsId: '2193271',
    bookmeterUrl: 'https://bookmeter.com/books/5674'
  },
  '砂の女': {
    goodreadsId: '9998',
    bookmeterUrl: 'https://bookmeter.com/books/11284'
  },
  '百年の孤独': {
    goodreadsId: '320',
    bookmeterUrl: 'https://bookmeter.com/books/915'
  }
};

// Known recipe links on Japanese platforms
const KNOWN_RECIPES: Record<string, { cookpadUrl?: string }> = {
  '懐石料理': {
    cookpadUrl: 'https://cookpad.com/search/%E6%87%90%E7%9F%B3%E6%96%99%E7%90%86'
  },
  'ラープ': {
    cookpadUrl: 'https://cookpad.com/search/%E3%83%A9%E3%83%BC%E3%83%97'
  },
  '北京ダック': {
    cookpadUrl: 'https://cookpad.com/search/%E5%8C%97%E4%BA%AC%E3%83%80%E3%83%83%E3%82%AF'
  },
  'ビビンバ': {
    cookpadUrl: 'https://cookpad.com/search/%E3%83%93%E3%83%93%E3%83%B3%E3%83%90'
  },
  'フォー': {
    cookpadUrl: 'https://cookpad.com/search/%E3%83%95%E3%82%A9%E3%83%BC'
  }
};

async function searchIMDb(title: string, language: string = 'ja'): Promise<SearchResult> {
  const cacheKey = generateSearchCacheKey('movies', title, language);
  const cached = searchResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const movieInfo = KNOWN_MOVIES[title];
    let result: SearchResult;

    if (movieInfo) {
      if (language === 'ja' && movieInfo.eigaUrl) {
        result = {
          url: movieInfo.eigaUrl,
          title,
          japaneseSource: 'eiga.com'
        };
      } else {
        result = {
          url: `https://www.imdb.com/title/${movieInfo.imdbId}/?ref_=fn_al_tt_1`,
          title
        };
      }
    } else {
      result = language === 'ja' 
        ? {
            url: `https://eiga.com/search/${encodeURIComponent(title)}/`,
            title,
            japaneseSource: 'eiga.com'
          }
        : {
            url: `https://www.imdb.com/find/?q=${encodeURIComponent(title)}&ref_=nv_sr_sm`,
            title
          };
    }

    searchResultCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const fallback = {
      url: `https://www.imdb.com/find/?q=${encodeURIComponent(title)}&ref_=nv_sr_sm`,
      title
    };
    searchResultCache.set(cacheKey, fallback);
    return fallback;
  }
}

async function searchGoodreads(title: string, language: string = 'ja'): Promise<SearchResult> {
  const cacheKey = generateSearchCacheKey('books', title, language);
  const cached = searchResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const bookInfo = KNOWN_BOOKS[title];
    let result: SearchResult;

    if (bookInfo) {
      if (language === 'ja' && bookInfo.bookmeterUrl) {
        result = {
          url: bookInfo.bookmeterUrl,
          title,
          japaneseSource: 'Bookmeter'
        };
      } else {
        result = {
          url: `https://www.goodreads.com/book/show/${bookInfo.goodreadsId}`,
          title
        };
      }
    } else {
      result = language === 'ja'
        ? {
            url: `https://bookmeter.com/search?keyword=${encodeURIComponent(title)}`,
            title,
            japaneseSource: 'Bookmeter'
          }
        : {
            url: `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`,
            title
          };
    }

    searchResultCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const fallback = {
      url: `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`,
      title
    };
    searchResultCache.set(cacheKey, fallback);
    return fallback;
  }
}

async function searchRecipes(title: string, language: string = 'ja'): Promise<SearchResult> {
  const cacheKey = generateSearchCacheKey('food', title, language);
  const cached = searchResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const recipeInfo = KNOWN_RECIPES[title];
    let result: SearchResult;

    if (recipeInfo && recipeInfo.cookpadUrl && language === 'ja') {
      result = {
        url: recipeInfo.cookpadUrl,
        title,
        japaneseSource: 'Cookpad'
      };
    } else {
      result = language === 'ja'
        ? {
            url: `https://cookpad.com/search/${encodeURIComponent(title)}`,
            title,
            japaneseSource: 'Cookpad'
          }
        : {
            url: `https://www.allrecipes.com/search?q=${encodeURIComponent(title)}`,
            title
          };
    }

    searchResultCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const fallback = {
      url: `https://www.allrecipes.com/search?q=${encodeURIComponent(title)}`,
      title
    };
    searchResultCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function getSearchResult(category: string, title: string, language: string = 'ja'): Promise<SearchResult> {
  switch (category.toLowerCase()) {
    case 'movies':
      return searchIMDb(title, language);
    case 'books':
      return searchGoodreads(title, language);
    case 'food':
      return searchRecipes(title, language);
    default:
      throw new APIError('Invalid category', undefined, `Category ${category} not supported`);
  }
}
