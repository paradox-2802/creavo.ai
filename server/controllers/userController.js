import sql from "../configs/db.js";

/**
 * Retrieves all creations for a specific user.
 * Sorted by creation date in descending order.
 */
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creations = await sql`SELECT * FROM creations
                WHERE user_id = ${userId}
                ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error("Get User Creations Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Retrieves all published creations.
 * Used for the public feed/gallery.
 */
export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`SELECT * FROM creations
                WHERE publish = true
                ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error("Get Published Creations Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Toggles "like" status for a creation.
 * Adds userID to likes array if not present, removes if present.
 */
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations
                WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes || []; // Ensure likes is initialized
    const userIdStr = userId.toString();

    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    // Format array for PostgreSQL text[] type
    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    console.error("Toggle Like Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
