const reservedUsernames: Set<string> = new Set([
  // Generic & System
  'admin', 'root', 'support', 'contact', 'info', 'help',
  'moderator', 'administrator', 'system', 'test', 'guest',
  'api', 'ftp', 'mail', 'pop', 'smtp', 'www', 'blog', 'shop',
  'staff', 'team', 'jobs', 'careers', 'press', 'abuse',

  // Brands
  'google', 'apple', 'microsoft', 'amazon', 'facebook', 'twitter', 'x',
  'instagram', 'linkedin', 'netflix', 'spotify', 'tesla', 'meta',
  'youtube', 'tiktok', 'snapchat', 'pinterest', 'reddit',

  // High-Profile Celebrities & Public Figures
  'beyonce', 'elonmusk', 'therock', 'dwaynejohnson', 'taylorswift', 
  'cristiano', 'ronaldo', 'leomessi', 'messi', 'arianagrande',
  'selenagomez', 'kyliejenner', 'kimkardashian', 'justinbieber',
  'katyperry', 'rihanna', 'billieeilish', 'champagnepapi', 'drake',
  'kevinhart4real', 'zendaya', 'oprah', 'billgates', 'barackobama',
  'michelleobama', 'nasa', 'natgeo', 'nike', 'adidas', 'marvel', 'disney'
]);

export const isUsernameReserved = (username: string): boolean => {
    return reservedUsernames.has(username.toLowerCase());
}
