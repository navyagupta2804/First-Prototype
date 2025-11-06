// A Cloud Function that updates denormalized user data across all posts and comments.
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const {getFirestore} = require("firebase-admin/firestore");

// Initialize the Admin SDK once for the project
// admin.initializeApp();
// const db = admin.firestore("pantry1");
const app = admin.initializeApp();
const db = getFirestore(app, "pantry1");

exports.updateDenormalizedUserData = onDocumentWritten({
  database: "pantry1",
  region: "us-central1",
  document: "users/{userId}",
}, async (event) => {
  const change = event.data;

  if (!change) {
    console.log("No data change found.");
    return null;
  }

  const userId = event.params.userId;
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
  console.log("displayNameChanged:", displayNameChanged);
  console.log("photoURLChanged:", photoURLChanged);

  // Data structure to apply to all posts/comments
  const updatePayload = {};
  if (displayNameChanged) {
    updatePayload.displayName = newDisplayName;
  }
  if (photoURLChanged) {
    updatePayload.displayPhoto = newPhotoURL; // Assuming 'displayPhoto' is used in posts
  }
  console.log("updatePayload:", updatePayload);
  console.log("about to batch");
  const batch = db.batch();
  let documentsUpdated = 0;
  console.log("just finished batch:", batch);

  // --- 2. Update the User's Posts in the Global 'feed' Collection ---
  // Query for all documents in 'feed' where the 'uid' matches the user ID
  const feedPostsSnapshot = await db.collection("feed")
      .where("uid", "==", userId)
      .get();

  console.log("about to update feed");
  feedPostsSnapshot.forEach((doc) => {
    batch.update(doc.ref, updatePayload);
    documentsUpdated++;
  });
  console.log("finished updating user post");
  console.log("user posts:", feedPostsSnapshot);

  // --- 3. Update the User's Comments in all Post Subcollections ---
  // This is the most complex step as it requires a Collection Group Query.
  // NOTE: This requires a Firestore index. See next section.
  const commentsSnapshot = await db.collectionGroup("comments")
      .where("uid", "==", userId)
      .get();

  console.log("about to update comments");
  commentsSnapshot.forEach((doc) => {
  // Comments only need displayName
    const commentUpdate = {};
    if (displayNameChanged) {
      commentUpdate.displayName = newDisplayName;
    }
    // Only update if there are fields to change
    if (Object.keys(commentUpdate).length > 0) {
      batch.update(doc.ref, commentUpdate);
      documentsUpdated++;
    }
  });

  console.log("finished updating comments");
  console.log("comments:", commentsSnapshot);

  // --- 5. Commit the batch and return ---
  if (documentsUpdated > 0) {
    await batch.commit();
    console.log(`Successfully completed batch update for ${documentsUpdated} documents.`);
  } else {
    console.log("No documents found to update.");
  }

  return null;
});
