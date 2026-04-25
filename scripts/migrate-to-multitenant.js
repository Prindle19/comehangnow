const admin = require('firebase-admin');
const fs = require('fs');

// Note: To run this script against a live database, you must have the
// GOOGLE_APPLICATION_CREDENTIALS environment variable set pointing to a valid service account JSON key,
// or run it locally while authenticated via `gcloud auth application-default login`.
// Example: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json" && node scripts/migrate-to-multitenant.js`

admin.initializeApp();

const db = admin.firestore();

const CLUB_ID = 'mryc';
const CLUB_DOMAIN = 'mryc.comehangnow.com'; // Change if using a different primary domain
const CLUB_NAME = 'MRYC';

async function migrate() {
    console.log(`Starting migration to multi-tenant for club: ${CLUB_NAME} (${CLUB_ID})`);

    // 1. Create the club document
    const clubRef = db.collection('clubs').doc(CLUB_ID);
    const clubDoc = await clubRef.get();
    
    // We will attempt to migrate admins from the old `clubSettings/main` doc if it exists
    let admins = ['wohltman@gmail.com']; // default fallback
    let logoUrl = '';
    
    try {
        const oldSettingsRef = db.collection('clubSettings').doc('main');
        const oldSettings = await oldSettingsRef.get();
        if (oldSettings.exists) {
            const data = oldSettings.data();
            if (data.logoUrl) logoUrl = data.logoUrl;
            if (data.name && data.name !== 'Come Hang Now') {
                console.log(`Found existing club name: ${data.name}`);
            }
        }
    } catch (e) {
        console.log("No existing clubSettings/main found or couldn't read it.");
    }

    if (!clubDoc.exists) {
        console.log(`Creating club document for ${CLUB_ID}...`);
        await clubRef.set({
            domain: CLUB_DOMAIN,
            name: CLUB_NAME,
            logoUrl: logoUrl,
            admins: admins
        });
        console.log('Club document created.');
    } else {
        console.log(`Club document ${CLUB_ID} already exists. Skipping creation.`);
    }

    // 2. Migrate Families
    console.log('Migrating families...');
    const familiesSnapshot = await db.collection('families').get();
    let familiesCount = 0;
    const familiesBatch = db.batch();
    
    familiesSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.clubId) {
            familiesBatch.update(doc.ref, { clubId: CLUB_ID });
            familiesCount++;
        }
    });
    
    if (familiesCount > 0) {
        await familiesBatch.commit();
        console.log(`Migrated ${familiesCount} families.`);
    } else {
        console.log('No families needed migration.');
    }

    // 3. Migrate Locations
    console.log('Migrating locations...');
    const locationsSnapshot = await db.collection('locations').get();
    let locationsCount = 0;
    const locationsBatch = db.batch();
    
    locationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.clubId) {
            locationsBatch.update(doc.ref, { clubId: CLUB_ID });
            locationsCount++;
        }
    });

    if (locationsCount > 0) {
        await locationsBatch.commit();
        console.log(`Migrated ${locationsCount} locations.`);
    } else {
        console.log('No locations needed migration.');
    }

    // 4. Migrate Check-ins
    console.log('Migrating check-ins...');
    const checkinsSnapshot = await db.collection('checkins').get();
    let checkinsCount = 0;
    const checkinsBatch = db.batch();
    
    checkinsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!data.clubId) {
            checkinsBatch.update(doc.ref, { clubId: CLUB_ID });
            checkinsCount++;
        }
    });

    if (checkinsCount > 0) {
        await checkinsBatch.commit();
        console.log(`Migrated ${checkinsCount} check-ins.`);
    } else {
        console.log('No check-ins needed migration.');
    }

    console.log('Migration completed successfully!');
}

migrate().catch(console.error).finally(() => process.exit(0));
