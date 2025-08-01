import { db, storage } from "./firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  audioUrl?: string
  authorId: string
  authorName: string
  authorPhotoURL?: string
  category?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export async function createBlogPost(
  title: string,
  content: string,
  authorId: string,
  authorName: string,
  category = "other",
  authorPhotoURL?: string,
  imageFile?: File,
  audioFile?: File,
  customCategoryId?: string, // Add this parameter
): Promise<string> {
  let imageUrl = ""
  let audioUrl = ""

  // Upload image if provided
  if (imageFile) {
    const imageRef = ref(storage, `blog-images/${authorId}/${Date.now()}-${imageFile.name}`)
    const uploadResult = await uploadBytes(imageRef, imageFile)
    imageUrl = await getDownloadURL(uploadResult.ref)
  }

  if (audioFile) {
    const audioRef = ref(storage, `blog-audio/${authorId}/${Date.now()}-${audioFile.name}`);
    const uploadResult = await uploadBytes(audioRef, audioFile);
    audioUrl = await getDownloadURL(uploadResult.ref);
  }

  // Create blog post document
  const blogData: any = {
    title,
    content,
    authorId,
    authorName,
    category: customCategoryId ? "" : category,
    customCategoryId: customCategoryId || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // Only add imageUrl if it exists
  if (imageUrl) {
    blogData.imageUrl = imageUrl
  }

  // same goes for audio 
  if (audioUrl) {
    blogData.audioUrl = audioUrl
  }

  // Only add authorPhotoURL if it exists
  if (authorPhotoURL) {
    blogData.authorPhotoURL = authorPhotoURL
  }

  const docRef = await addDoc(collection(db, "blogPosts"), blogData)
  return docRef.id
}

export async function updateBlogPost(
  postId: string,
  title: string,
  content: string,
  category = "other",
  imageFile?: File,
  currentImageUrl?: string,
  customCategoryId?: string, // Add this parameter
): Promise<void> {
  const postRef = doc(db, "blogPosts", postId)
  let imageUrl = currentImageUrl || ""

  // Handle image update
  if (imageFile) {
    // Delete old image if exists
    if (currentImageUrl) {
      try {
        const oldImageRef = ref(storage, currentImageUrl)
        await deleteObject(oldImageRef)
      } catch (error) {
        console.error("Error deleting old image:", error)
      }
    }

    // Upload new image
    const imageRef = ref(storage, `blog-images/${Date.now()}-${imageFile.name}`)
    const uploadResult = await uploadBytes(imageRef, imageFile)
    imageUrl = await getDownloadURL(uploadResult.ref)
  }

  // Update blog post
  const updateData: any = {
    title,
    content,
    category: customCategoryId ? "" : category,
    customCategoryId: customCategoryId || "",
    updatedAt: serverTimestamp(),
  }

  // Only add imageUrl if it exists
  if (imageUrl) {
    updateData.imageUrl = imageUrl
  }

  await updateDoc(postRef, updateData)
}

export async function deleteBlogPost(postId: string, imageUrl?: string): Promise<void> {
  // Delete image if exists
  if (imageUrl) {
    try {
      // Create a reference directly from the URL
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
    } catch (error) {
      console.error("Error deleting image:", error)
      // Continue with post deletion even if image deletion fails
    }
  }

  try {
    // Delete related comments
    const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId))
    const commentsSnapshot = await getDocs(commentsQuery)

    const commentDeletions = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))

    await Promise.all(commentDeletions)

    // Delete related likes
    const likesQuery = query(collection(db, "likes"), where("postId", "==", postId))
    const likesSnapshot = await getDocs(likesQuery)

    const likeDeletions = likesSnapshot.docs.map((doc) => deleteDoc(doc.ref))

    await Promise.all(likeDeletions)

    // Delete blog post document
    const postRef = doc(db, "blogPosts", postId)
    await deleteDoc(postRef)
  } catch (error) {
    console.error("Error deleting blog post or related data:", error)
    throw error
  }
}

export async function getBlogPost(postId: string): Promise<BlogPost | null> {
  const postRef = doc(db, "blogPosts", postId)
  const postSnap = await getDoc(postRef)

  if (postSnap.exists()) {
    return { id: postSnap.id, ...postSnap.data() } as BlogPost
  } else {
    return null
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const postsQuery = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(postsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BlogPost[]
}

export async function getUserBlogPosts(userId: string): Promise<BlogPost[]> {
  const postsQuery = query(collection(db, "blogPosts"), where("authorId", "==", userId), orderBy("createdAt", "desc"))

  const querySnapshot = await getDocs(postsQuery)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as BlogPost[]
}
