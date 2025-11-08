import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  Button,
  Stack,
  Textarea,
  useToast,
  VStack,
  Avatar,
  Text,
  Center,
  AspectRatio,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Tag,
  Checkbox,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import {
  FiTrash2,
  FiDownload,
  FiMoreHorizontal,
  FiCheckSquare,
} from "react-icons/fi";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { timestamp } from "../firebase/config";
import { useAuthContext } from "../hooks/useAuthContext";
import { useDocument } from "../hooks/useDocument";
import { useFirestore } from "../hooks/useFirestore";
import VideoUploadForm from "../components/VideoUploadForm";
import { downloadUrlsAsZip } from "../utils/downloads";

import HeaderSpacer from "../components/HeaderSpacer";

/* ---------------- UTILITIES ---------------- */
function timeAgoFrom(createdAt) {
  if (!createdAt) return "";
  const ms = createdAt?.toDate
    ? createdAt.toDate().getTime()
    : new Date(createdAt).getTime();
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function canUserDeleteEntry(user, entry, isAdmin = false) {
  if (isAdmin) return true;
  if (!user) return false;
  if (entry?.userId && entry.userId === user.uid) return true;
  if (!entry.userId && entry.displayName && user.displayName) {
    return entry.displayName.trim() === user.displayName.trim();
  }
  return false;
}

/* ---------------- MAIN COMPONENT ---------------- */
const Guestbook = ({ guestMode = false, allowUpload = true }) => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { document: eventDoc, error: docError } = useDocument("events", id);
  const { updateDocument, response } = useFirestore("events");
  const toast = useToast();

  const [newComment, setNewComment] = useState("");
  const [videoCount, setVideoCount] = useState(12);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const {
    isOpen: videoUploadOpen,
    onOpen: openVideoUpload,
    onClose: closeVideoUpload,
  } = useDisclosure();

  /* ---------- Admin detection ---------- */
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user || !eventDoc) {
      setIsAdmin(false);
      return;
    }

    const uid = user.uid;
    const checkValue = (val) => {
      if (!val) return false;
      if (typeof val === "string") return val === uid;
      if (typeof val === "object") {
        return Object.values(val).some((nested) => checkValue(nested));
      }
      return false;
    };

    const ownerMatch = checkValue(eventDoc);
    setIsAdmin(ownerMatch);
  }, [user, eventDoc]);

  /* ---------- Guestbook data ---------- */
  const guestBookSafe =
    eventDoc && Array.isArray(eventDoc.guestBook) ? eventDoc.guestBook : [];

  const { textEntriesAll, videoEntriesAll } = useMemo(() => {
    const texts = [],
      vids = [];
    for (const e of guestBookSafe) {
      if (e?.type === "video") vids.push(e);
      else texts.push(e);
    }
    const sortNewest = (arr) =>
      arr.sort((a, b) => {
        const ta = a.createdAt?.toDate
          ? a.createdAt.toDate().getTime()
          : new Date(a.createdAt).getTime();
        const tb = b.createdAt?.toDate
          ? b.createdAt.toDate().getTime()
          : new Date(b.createdAt).getTime();
        return tb - ta;
      });
    sortNewest(texts);
    sortNewest(vids);
    return { textEntriesAll: texts, videoEntriesAll: vids };
  }, [guestBookSafe]);

  /* ---------- Add text message ---------- */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newEntry = {
      id: uuidv4(),
      displayName: user?.displayName || "Guest",
      photoURL: user?.photoURL || "",
      userId: user?.uid,
      type: "text",
      content: newComment,
      createdAt: timestamp.fromDate(new Date()),
    };

    await updateDocument(eventDoc.id, {
      guestBook: [...(eventDoc.guestBook || []), newEntry],
    });
    if (!response.error) {
      setNewComment("");
      toast({ title: "Message added", status: "success" });
    }
  };

  /* ---------- Video upload ---------- */
  const handleVideoUploadComplete = async (meta = {}, extra = {}) => {
    const videoUrl = meta?.url || meta?.downloadURL;
    if (!videoUrl) return;
    const entry = {
      id: uuidv4(),
      displayName: user?.displayName || "Guest",
      photoURL: user?.photoURL || "",
      userId: user?.uid,
      type: "video",
      videoUrl,
      thumbnailDataUrl: extra?.thumbnailDataUrl || null,
      content: extra?.caption || "",
      createdAt: timestamp.fromDate(new Date()),
    };
    await updateDocument(eventDoc.id, {
      guestBook: [...(eventDoc.guestBook || []), entry],
    });
    closeVideoUpload();
    toast({ title: "Video uploaded", status: "success" });
  };

  /* ---------- Delete entry ---------- */
  const deleteEntry = async (entry) => {
    const canDelete = canUserDeleteEntry(
      user,
      entry,
      guestMode ? false : isAdmin
    );
    if (!canDelete) {
      toast({
        title: "Not allowed",
        description: "You can delete only your own messages.",
        status: "error",
      });
      return;
    }
    if (!window.confirm("Delete this entry?")) return;
    const updated = (eventDoc.guestBook || []).filter((e) => e.id !== entry.id);
    await updateDocument(eventDoc.id, { guestBook: updated });
    toast({ title: "Deleted", status: "info" });
  };

  /* ---------- Downloads (Owner only) ---------- */
  const downloadAllText = () => {
    const allText = textEntriesAll
      .map(
        (t) =>
          `${t.displayName || "Guest"} (${timeAgoFrom(t.createdAt)}): ${
            t.content
          }`
      )
      .join("\n\n");
    const blob = new Blob([allText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `guestbook-text-${Date.now()}.txt`;
    a.click();
  };

  const downloadAllCSV = () => {
    const header = "Name,Message,Time\n";
    const rows = textEntriesAll
      .map(
        (t) =>
          `"${t.displayName || "Guest"}","${(t.content || "").replace(
            /"/g,
            '""'
          )}","${timeAgoFrom(t.createdAt)}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `guestbook-messages-${Date.now()}.csv`;
    a.click();
  };

  const downloadAllJSON = () => {
    const jsonData = JSON.stringify(textEntriesAll, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `guestbook-messages-${Date.now()}.json`;
    a.click();
  };

  const downloadAllVideosAsZip = async () => {
    const items = videoEntriesAll.map((v, i) => ({
      url: v.videoUrl,
      filename: `${v.displayName || "video"}-${i + 1}.mp4`,
    }));
    await downloadUrlsAsZip(items, {
      zipFilename: `guestbook-videos-${Date.now()}.zip`,
    });
  };

  const downloadSelectedVideosAsZip = async () => {
    if (selectedVideos.size === 0) {
      toast({ title: "No videos selected", status: "warning" });
      return;
    }
    const items = videoEntriesAll
      .filter((v) => selectedVideos.has(v.id))
      .map((v, i) => ({
        url: v.videoUrl,
        filename: `${v.displayName || "video"}-${i + 1}.mp4`,
      }));
    await downloadUrlsAsZip(items, {
      zipFilename: `guestbook-selected-videos-${Date.now()}.zip`,
    });
    setIsSelecting(false);
    setSelectedVideos(new Set());
  };

  /* ---------- UI ---------- */
  if (docError)
    return (
      <Center>
        <Text color="red.500">{docError}</Text>
      </Center>
    );
  if (!eventDoc)
    return (
      <Center minH="50vh">
        <Spinner />
      </Center>
    );

  return (
    <Box minH="100vh" bg="gray.50" pb={{ base: 10, md: 12 }}>
      <HeaderSpacer />
      {/* Top Bar */}
      {/* Top Bar (Responsive for mobile) */}
      <Flex
        px={{ base: 3, md: 8 }}
        mb={4}
        align="center"
        justify={{ base: "flex-start", md: "space-between" }}
        flexWrap="nowrap"
        overflowX="auto"
        whiteSpace="nowrap"
        gap={3}
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        }}
      >
        {/* Owner tag */}
        {!guestMode && isAdmin && (
          <Tag
            bg="yellow.100"
            color="brown"
            borderRadius="full"
            px={3}
            py={1}
            fontWeight="600"
            flexShrink={0}
          >
            Owner
          </Tag>
        )}

        {/* Select button */}
        {isAdmin && (
          <Button
            size="sm"
            variant={isSelecting ? "solid" : "outline"}
            colorScheme={isSelecting ? "purple" : "gray"}
            leftIcon={<FiCheckSquare />}
            onClick={() => setIsSelecting(!isSelecting)}
            flexShrink={0}
          >
            {isSelecting ? "Cancel Selection" : "Select Videos"}
          </Button>
        )}

        {/* Actions menu */}
        {!guestMode && isAdmin && (
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              size="sm"
              colorScheme="purple"
              leftIcon={<FiMoreHorizontal />}
              flexShrink={0}
            >
              Actions
            </MenuButton>
            <MenuList zIndex={50}>
              <MenuItem icon={<FiDownload />} onClick={downloadAllText}>
                Download All Messages (TXT)
              </MenuItem>
              <MenuItem icon={<FiDownload />} onClick={downloadAllCSV}>
                Download All Messages (CSV)
              </MenuItem>
              <MenuItem icon={<FiDownload />} onClick={downloadAllJSON}>
                Download All Messages (JSON)
              </MenuItem>
              <MenuItem icon={<FiDownload />} onClick={downloadAllVideosAsZip}>
                Download All Videos (ZIP)
              </MenuItem>
              <MenuItem
                icon={<FiDownload />}
                onClick={downloadSelectedVideosAsZip}
              >
                Download Selected Videos (ZIP)
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      <VStack spacing={8} px={{ base: 3, md: 8 }}>
        {/* --- Video Messages --- */}
        <Box w="full">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="bold" fontSize="lg">
              Video Messages
            </Text>
            {allowUpload && (
              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<AddIcon />}
                onClick={openVideoUpload}
              >
                Add Video
              </Button>
            )}
          </Flex>

          {videoEntriesAll.length === 0 ? (
            <Center py={8} color="gray.500">
              No video messages yet.
            </Center>
          ) : (
            <Flex wrap="wrap" gap={4}>
              {videoEntriesAll.map((v) => {
                const canDelete = canUserDeleteEntry(
                  user,
                  v,
                  guestMode ? false : isAdmin
                );
                const selected = selectedVideos.has(v.id);

                return (
                  <Box
                    key={v.id}
                    bg="white"
                    borderRadius="xl"
                    boxShadow="sm"
                    p={3}
                    w={{ base: "100%", sm: "45%", md: "30%" }}
                    position="relative"
                  >
                    {isSelecting && (
                      <Checkbox
                        isChecked={selected}
                        onChange={() => {
                          const newSet = new Set(selectedVideos);
                          newSet.has(v.id)
                            ? newSet.delete(v.id)
                            : newSet.add(v.id);
                          setSelectedVideos(newSet);
                        }}
                        position="absolute"
                        top="6px"
                        left="6px"
                        bg="whiteAlpha.800"
                        borderRadius="md"
                        zIndex={10}
                      />
                    )}

                    <AspectRatio ratio={16 / 9} mb={2}>
                      <video
                        src={v.videoUrl}
                        controls
                        style={{ width: "100%", borderRadius: "md" }}
                      />
                    </AspectRatio>

                    <Flex align="center" justify="space-between">
                      <Text fontSize="sm" fontWeight="600">
                        {v.displayName}
                      </Text>
                      {canDelete && (
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => deleteEntry(v)}
                        />
                      )}
                    </Flex>
                    <Text fontSize="xs" color="gray.500">
                      {timeAgoFrom(v.createdAt)}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          )}
        </Box>

        {/* --- Text Messages --- */}
        <Box w="full">
          <Text fontWeight="bold" fontSize="lg" mb={3}>
            Messages
          </Text>

          {allowUpload && (
            <form onSubmit={handleSendMessage}>
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={3}
                mb={6}
              >
                <Textarea
                  required
                  placeholder="Write your message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button colorScheme="purple" type="submit">
                  Send
                </Button>
              </Stack>
            </form>
          )}

          {textEntriesAll.length === 0 ? (
            <Center py={8} color="gray.500">
              No messages yet.
            </Center>
          ) : (
            <Flex wrap="wrap" gap={4}>
              {textEntriesAll.map((t) => {
                const canDelete = canUserDeleteEntry(
                  user,
                  t,
                  guestMode ? false : isAdmin
                );
                return (
                  <Box
                    key={t.id}
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    boxShadow="sm"
                    position="relative"
                    w={{ base: "100%", sm: "45%", md: "30%" }}
                  >
                    {canDelete && (
                      <IconButton
                        icon={<FiTrash2 />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top="6px"
                        right="6px"
                        onClick={() => deleteEntry(t)}
                      />
                    )}
                    <Flex align="center" mb={2}>
                      <Avatar
                        name={t.displayName}
                        src={t.photoURL}
                        size="sm"
                        mr={3}
                      />
                      <Box>
                        <Text fontWeight="600" fontSize="sm">
                          {t.displayName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {timeAgoFrom(t.createdAt)}
                        </Text>
                      </Box>
                    </Flex>
                    <Text fontSize="sm" color="gray.600">
                      {t.content}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          )}
        </Box>
      </VStack>

      {/* Video Upload Modal */}
      <Modal isOpen={videoUploadOpen} onClose={closeVideoUpload} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent borderRadius="xl" p={4}>
          <ModalCloseButton />
          <ModalBody>
            <VideoUploadForm
              user={user}
              onUploadComplete={handleVideoUploadComplete}
              onClose={closeVideoUpload}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Guestbook;
