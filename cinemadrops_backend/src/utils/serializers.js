/**
 * Utility serializer functions to transform Mongoose documents into API responses.
 */

// PUBLIC_INTERFACE
export function serializeVideo(doc) {
  /**
   * Convert a Video mongoose document (or plain object) to API response shape.
   */
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: String(o._id),
    videoUrl: o.videoUrl,
    name: o.name,
    creator: o.creator,
    categories: Array.isArray(o.categories) ? o.categories : [],
    rated: o.rated,
    dislikes: o.dislikes ?? 0,
    likes: o.likes ?? 0,
    loves: o.loves ?? 0,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}
