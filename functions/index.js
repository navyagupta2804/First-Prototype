const admin = require("firebase-admin");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered when a user's document in the 'users' collection is updated.
 * It updates the denormalized displayName and photoURL across all posts and comments.
 */
exports.updateDenormalizedUserData = onDocumentUpdated(
    // Path to the document we are watching
    {
      document: "users/{userId}",
    },

    async (event) => {
      // Check if the event contains data (it should, for an update)
      if (!event.data) {
        console.log("No data found in the event.");
        return null;
      }

      const userId = event.params.userId;
      const newData = event.data.after.data();
      const previousData = event.data.before.data();

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
      const feedPostsSnapshot = await db.collection("feed")
          .where("uid", "==", userId)
          .get();

      feedPostsSnapshot.forEach((doc) => {
        batch.update(doc.ref, updatePayload);
        documentsUpdated++;
      });

      // --- 3. Update the User's Posts in their Subcollection ('users/{userId}/photos') ---
      const userPostsSnapshot = await db.collection("users").doc(userId).collection("photos")
          .get();

      userPostsSnapshot.forEach((doc) => {
        batch.update(doc.ref, updatePayload);
        documentsUpdated++;
      });

      // --- 4. Update the User's Comments in all Post Subcollections (Collection Group Query) ---
      const commentsSnapshot = await db.collectionGroup("comments")
          .where("uid", "==", userId)
          .get();

      commentsSnapshot.forEach((doc) => {
        // Comments only need displayName (and potentially displayPhoto)
        batch.update(doc.ref, {
          displayName: newDisplayName,
          // If you decide to add photoURL to comments, uncomment:
          // displayPhoto: newPhotoURL
        });
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
