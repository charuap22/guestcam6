export function getUploaderName(img, user) {
  if (!img) return "Guest";

  // resolve uploader uid across schemas
  const uploaderUid = img.createdBy || img.userId || img.uploaderUid || null;

  // show "You" only for non-anonymous users
  if (uploaderUid && user?.uid === uploaderUid && !user?.isAnonymous) {
    return "You";
  }

  // resolve uploader name across schemas
  const name = img.createdByName || img.uploaderName;

  if (name && name.trim() !== "") {
    return name;
  }

  return "Guest";
}
