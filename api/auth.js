import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

// Generate a consistent color for each user based on their ID
function generateUserColor(userId) {
  const colors = [
    '#FF6B6B', // red
    '#4ECDC4', // teal
    '#45B7D1', // blue
    '#FFA07A', // light salmon
    '#98D8C8', // mint
    '#F7DC6F', // yellow
    '#BB8FCE', // purple
    '#85C1E2', // sky blue
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return colors[Math.abs(hash) % colors.length];
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, roomId } = req.body;

    // Validate required fields
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'Missing userId or roomId' });
    }

    // Generate access token for the user
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: `Anonymous User ${userId.substring(0, 8)}`,
        color: generateUserColor(userId),
      },
    });

    // Grant permission to the specific room
    session.allow(roomId, session.FULL_ACCESS);

    // Return the token
    const { token } = await session.authorize();

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
