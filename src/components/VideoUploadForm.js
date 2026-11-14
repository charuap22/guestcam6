import React, { useState } from "react";
import { Box, Button, Text, Input, Progress, VStack } from "@chakra-ui/react";
import firebase from "firebase/app";
import "firebase/storage";

export default function VideoUploadForm({
  user,
  eventId,
  onUploadComplete,
  onClose,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  /* ---------- FILE PICK ---------- */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (
      !selected.type.startsWith("image/") &&
      !selected.type.startsWith("video/")
    ) {
      setError("Only images and videos are allowed");
      return;
    }

    setError("");
    setFile(selected);
  };

  /* ---------- START UPLOAD ---------- */
  const startUpload = async () => {
    if (!file) return;

    setUploading(true);

    const type = file.type.startsWith("video/") ? "video" : "image";
    const folder = type === "video" ? "videos" : "images";

    const storageRef = firebase
      .storage()
      .ref(`guestbook/${eventId}/${folder}/${Date.now()}_${file.name}`);

    const uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(Math.round(pct));
      },
      (err) => {
        console.error(err);
        setError("Upload failed");
        setUploading(false);
      },
      async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();

        onUploadComplete({
          url,
          type,
        });

        setUploading(false);
        setProgress(0);
        setFile(null);
        onClose();
      }
    );
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="600">Upload photo or video</Text>

      <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />

      {file && (
        <Text fontSize="sm" color="gray.600">
          Selected: {file.name}
        </Text>
      )}

      {uploading && (
        <>
          <Progress value={progress} size="sm" />
          <Text fontSize="xs" textAlign="center">
            Uploading… {progress}%
          </Text>
        </>
      )}

      {error && (
        <Text fontSize="sm" color="red.500">
          {error}
        </Text>
      )}

      <Button
        bg="#EBD9A6"
        color="#3A2F2A"
        _hover={{ bg: "#D1B7A1" }}
        onClick={startUpload}
        isDisabled={!file || uploading}
      >
        Upload
      </Button>
    </VStack>
  );
}
