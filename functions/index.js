// A Cloud Function that updates denormalized user data across all posts and comments.
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK once
admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered when a user's document in the 'users' collection is updated.
 * It updates the denormalized displayName and photoURL in all their posts (feed and user subcollection)
 * and comments across the application.
 */
exports.updateDenormalizedUserData = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
      const userId = context.params.userId;
      const newData = change.after.data();
      const previousData = change.before.data();

      // 1. Identify what changed
      const newDisplayName = newData.displayName;
      const newPhotoURL = newData.photoURL;
      const oldDisplayName = previousData.displayName;
      const oldPhotoURL = previousData.photoURL;

      // We only proceed if the displayName or photoURL has changed
      const displayNameChanged = newDisplayName !== oldDisplayName;
      const photoURLChanged = newPhotoURL !== oldPhotoURL;

      if (!displayNameChanged && !photoURLChanged) {
        console.log("No relevant changes to displayName or photoURL. Exiting.");
        return null;
      }

      console.log(`Updating denormalized data for user: ${userId}`);

      // Data structure to apply to all posts/comments
      const updatePayload = {};
      if (displayNameChanged) {
        updatePayload.displayName = newDisplayName;
      }
      if (photoURLChanged) {
        updatePayload.displayPhoto = newPhotoURL; // Assuming 'displayPhoto' is used in posts
      }

      const batch = db.batch();
      let documentsUpdated = 0;

      // --- 2. Update the User's Posts in the Global 'feed' Collection ---
      // Query for all documents in 'feed' where the 'uid' matches the user ID
      const feedPostsSnapshot = await db.collection("feed")
          .where("uid", "==", userId)
          .get();

      feedPostsSnapshot.forEach((doc) => {
        batch.update(doc.ref, updatePayload);
        documentsUpdated++;
      });

      // --- 3. Update the User's Posts in their Subcollection ---
      // Query for all documents in 'users/{userId}/photos'
      const userPostsSnapshot = await db.collection("users").doc(userId).collection("photos")
          .get();

      userPostsSnapshot.forEach((doc) => {
        batch.update(doc.ref, updatePayload);
        documentsUpdated++;
      });

      // --- 4. Update the User's Comments in all Post Subcollections ---
      // This is the most complex step as it requires a Collection Group Query.
      // NOTE: This requires a Firestore index. See next section.
      const commentsSnapshot = await db.collectionGroup("comments")
          .where("uid", "==", userId)
          .get();

      commentsSnapshot.forEach((doc) => {
      // NOTE: Comments only need displayName (or displayPhoto, if you want avatars in comments)
      // We assume comments only need displayName
        batch.update(doc.ref, {displayName: newDisplayName});
        documentsUpdated++;
      });

      // --- 5. Commit the batch and return ---
      if (documentsUpdated > 0) {
        await batch.commit();
        console.log(`Successfully completed batch update for ${documentsUpdated} documents.`);
      } else {
        console.log("No documents found to update.");
      }

      return null;
    });
