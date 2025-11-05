import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Updates the publish status of a post in Firestore.
 * @param {string} postId - The ID of the post to update.
 * @param {boolean} isPublished - The new status (true for public, false for private/archived).
 */
export const updatePostPublishStatus = async (postId, isPublished) => {
    const postRef = doc(db, 'feed', postId);
    try {
        await updateDoc(postRef, {
            isPublished: isPublished,
        });
        console.log(`Post ${postId} status updated to published=${isPublished}`);
        return true;
    } catch (error) {
        console.error("Error updating publish status:", error);
        // You might want to display an error to the user here
        return false;
    }
};