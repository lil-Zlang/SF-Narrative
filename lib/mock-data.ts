// Mock tweet data for demonstration
const mockHypeTweets = [
  {
    id: "1",
    text: "Dreamforce 2025 is absolutely incredible! The energy in SF is electric. So many innovative companies showcasing the future of tech. #Dreamforce #SF",
    author: "Sarah Chen",
    username: "sarahchen_tech",
    timestamp: "2025-10-13T10:30:00Z",
    likes: 1247,
    retweets: 89,
    sentiment: "hype" as const
  },
  {
    id: "2", 
    text: "Just walked through Dreamforce and wow! The city feels alive with possibility. This is why SF is the heart of innovation. Love seeing all the networking happening!",
    author: "Mike Rodriguez",
    username: "mike_rodriguez",
    timestamp: "2025-10-13T14:15:00Z",
    likes: 892,
    retweets: 156,
    sentiment: "hype" as const
  },
  {
    id: "3",
    text: "Dreamforce brings such positive energy to SF! The tech community is thriving and it's beautiful to see. Innovation is happening everywhere you look!",
    author: "Alex Kim",
    username: "alexkim_dev",
    timestamp: "2025-10-13T16:45:00Z",
    likes: 634,
    retweets: 78,
    sentiment: "hype" as const
  }
];

const mockBacklashTweets = [
  {
    id: "4",
    text: "Dreamforce has completely taken over SF. Can't even walk down the street without being overwhelmed by tech bros. The city doesn't feel like ours anymore.",
    author: "Maria Santos",
    username: "maria_sf_local",
    timestamp: "2025-10-13T11:20:00Z",
    likes: 2156,
    retweets: 423,
    sentiment: "backlash" as const
  },
  {
    id: "5",
    text: "Hotel prices are insane because of Dreamforce. $800/night for a basic room? This conference is pricing out regular people from their own city.",
    author: "David Park",
    username: "davidpark_sf",
    timestamp: "2025-10-13T13:30:00Z",
    likes: 1876,
    retweets: 312,
    sentiment: "backlash" as const
  },
  {
    id: "6",
    text: "Dreamforce feels like SF has been colonized by tech companies. The city's soul is being replaced by corporate events. Where's the real San Francisco?",
    author: "Lisa Thompson",
    username: "lisa_thompson",
    timestamp: "2025-10-13T15:10:00Z",
    likes: 1456,
    retweets: 267,
    sentiment: "backlash" as const
  }
];

const mockCommunitySentiment = {
  hype: 45,
  backlash: 55
};

export { mockHypeTweets, mockBacklashTweets, mockCommunitySentiment };
