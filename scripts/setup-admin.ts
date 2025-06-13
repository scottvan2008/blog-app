import { initializeApp } from "firebase/app"
import { getFirestore, doc, updateDoc } from "firebase/firestore"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB8_KnGrrCEsXDYOU8jnGpytqngneVIvog",
  authDomain: "link-home-547c6.firebaseapp.com",
  projectId: "link-home-547c6",
  storageBucket: "link-home-547c6.firebasestorage.app",
  messagingSenderId: "407411122261",
  appId: "1:407411122261:web:ae5570a44f9e16b898f4dc",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

async function createSuperAdmin() {
  try {
    // Create super admin account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@inkdrop.com", // Change this to your email
      "admin123456", // Change this to a secure password
    )

    const user = userCredential.user

    // Update profile
    await updateProfile(user, {
      displayName: "Super Admin",
    })

    // Update user document with super admin role
    const userRef = doc(db, "users", user.uid)
    await updateDoc(userRef, {
      role: "super_admin",
      displayName: "Super Admin",
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log("✅ Super admin created successfully!")
    console.log("Email: admin@inkdrop.com")
    console.log("Password: admin123456")
    console.log("Role: super_admin")
  } catch (error) {
    console.error("❌ Error creating super admin:", error)
  }
}

// Run the script
createSuperAdmin()
