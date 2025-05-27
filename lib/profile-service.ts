import { auth, db, storage } from "./firebase"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { updateProfile } from "firebase/auth"

// Upload and set a new profile photo
export async function updateProfilePhoto(userId: string, imageFile: File): Promise<string> {
  try {
    // Create a reference to the new profile image
    const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}-${imageFile.name}`)

    // Upload the file
    const uploadResult = await uploadBytes(imageRef, imageFile)

    // Get the download URL
    const downloadURL = await getDownloadURL(uploadResult.ref)

    // Update the user's profile in Firebase Auth
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      })
    }

    // Update the user's document in Firestore
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    })

    return downloadURL
  } catch (error) {
    console.error("Error updating profile photo:", error)
    throw error
  }
}

// Delete the current profile photo
export async function deleteProfilePhoto(userId: string, photoURL: string): Promise<void> {
  try {
    // Delete the image from storage if it's a Firebase storage URL
    if (photoURL && photoURL.includes("firebasestorage")) {
      try {
        // Extract the path from the URL
        const storageRef = ref(storage, photoURL)
        await deleteObject(storageRef)
      } catch (error) {
        console.error("Error deleting image from storage:", error)
        // Continue even if storage deletion fails
      }
    }

    // Update the user's profile in Firebase Auth
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, {
        photoURL: "",
      })
    }

    // Update the user's document in Firestore
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      photoURL: "",
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error deleting profile photo:", error)
    throw error
  }
}
