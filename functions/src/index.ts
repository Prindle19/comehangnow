import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const onCheckInCreated = onDocumentCreated("checkins/{checkinId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const checkInData = snap.data();
    if (!checkInData) return;

    const clubId = checkInData.clubId;
    const familyId = checkInData.familyId;
    const locationId = checkInData.locationId;

    if (!clubId || !familyId) {
        console.log("Check-in is missing clubId or familyId. Skipping notifications.");
        return;
    }

    try {
        // 1. Get the name of the family that checked in
        const checkingInFamilySnap = await admin.firestore().collection("families").doc(familyId).get();
        const checkingInFamilyName = checkingInFamilySnap.exists ? checkingInFamilySnap.data()?.name : "A family";

        // 2. Get the location name
        const locationSnap = await admin.firestore().collection("locations").doc(locationId).get();
        const locationName = locationSnap.exists ? locationSnap.data()?.name : "the club";

        const notificationPayload = {
            notification: {
                title: "Come Hang Now!",
                body: `The ${checkingInFamilyName} family just arrived at ${locationName}!`,
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                familyId: familyId,
                clubId: clubId
            }
        };

        // 3. Find all families in the same club
        const familiesQuery = await admin.firestore().collection("families").where("clubId", "==", clubId).get();
        
        const tokensToNotify: string[] = [];

        familiesQuery.forEach(doc => {
            // Don't notify the family that just checked in
            if (doc.id === familyId) return;

            const familyData = doc.data();
            const members = familyData.members || [];

            members.forEach((member: any) => {
                const subs = member.notificationSubscriptions || [];
                // If this member is subscribed to the checking-in family
                if (subs.includes(familyId)) {
                    const tokens = member.fcmTokens || [];
                    tokens.forEach((token: string) => {
                        if (!tokensToNotify.includes(token)) {
                            tokensToNotify.push(token);
                        }
                    });
                }
            });
        });

        if (tokensToNotify.length === 0) {
            console.log("No users subscribed to this family's check-ins.");
            return;
        }

        console.log(`Sending notification to ${tokensToNotify.length} devices.`);
        const response = await admin.messaging().sendEachForMulticast({
            tokens: tokensToNotify,
            notification: notificationPayload.notification,
            data: notificationPayload.data
        });

        console.log(`Successfully sent ${response.successCount} messages. Failed: ${response.failureCount}`);
        
        // Optional: Cleanup expired tokens
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokensToNotify[idx]);
                }
            });
            console.log("Tokens to potentially cleanup:", failedTokens);
            // In a production app, you would remove these tokens from the user's document
        }

    } catch (error) {
        console.error("Error sending check-in notification:", error);
    }
  });
