// A Cloud Function that updates denormalized user data across all posts and comments.
const {onDocumentWritten, onDocumentCreated} = require("firebase-functions/v2/firestore");
const {getFirestore} = require("firebase-admin/firestore");
const admin = require("firebase-admin");

// Initialize the Admin SDK once for the project
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

// Helper to determine the start of the calendar week (Sunday 00:00:00)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff); // Set the date to Sunday's date
  d.setHours(0, 0, 0, 0); // Set time to midnight
  return d;
};

exports.updateStreakOnNewPost = onDocumentCreated({
  document: "feed/{postId}",
  region: "us-central1",
}, async (event) => {
  const snapshot = event.data;

  if (!snapshot) {
    console.log("No data found in event snapshot.");
    return null;
  }

  const postData = snapshot.data();
  const userId = postData.uid;
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  // Basic check to ensure user data exists
  if (!userDoc.exists || !userData) {
    console.log(`User ${userId} not found or has no data. Cannot update streak.`);
    return null;
  }

  // 1. Get the current post's time (server's time in UTC)
  const now = new Date();

  // 2. Get the recorded streak start date (the Sunday midnight timestamp set by the client)
  const lastStartTimestamp = userData.streakStartDate;
  const lastRecordedStart = lastStartTimestamp ? lastStartTimestamp.toDate() : null;

  // 3. Calculate the Sunday midnight for the time the post was made (in UTC)
  const currentWeekStart = getStartOfWeek(now).getTime();

  // 4. Calculate the Sunday midnight for the recorded streak start (in UTC)
  // This value should be the exact Sunday midnight timestamp sent by the client.
  const lastWeekStart = lastRecordedStart ? getStartOfWeek(lastRecordedStart).getTime() : 0;

  // Check if the current calendar week start is LATER than the recorded week start
  const isNewWeek = currentWeekStart > lastWeekStart;

  // streak calculation
  let newCurrentWeekPosts = userData.currentWeekPosts || 0;
  let newStreakCount = userData.streakCount || 0;
  let newStreakStartDate = userData.streakStartDate;

  if (isNewWeek) {
    const weeklyGoal = userData.weeklyGoal || 1;

    if (newCurrentWeekPosts >= weeklyGoal) {
      newStreakCount += 1;
    } else {
      newStreakCount = 0;
    }

    // START NEW CALENDAR WEEK
    newCurrentWeekPosts = 1;
    newStreakStartDate = admin.firestore.Timestamp.fromDate(getStartOfWeek(now));
  } else {
    newCurrentWeekPosts += 1;
  }

  // 3. Update the user document
  await userRef.update({
    currentWeekPosts: newCurrentWeekPosts,
    streakCount: newStreakCount,
    streakStartDate: newStreakStartDate,
  });

  console.log(`Streak updated for user ${userId}.`);
  console.log(`Posts: ${newCurrentWeekPosts}, Streak: ${newStreakCount}`);
  return null;
});
