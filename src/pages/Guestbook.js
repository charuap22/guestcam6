import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Avatar,
  AspectRatio,
  IconButton,
  SimpleGrid,
  Spinner,
  Textarea,
  Button,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import HeaderSpacer from "../components/HeaderSpacer";
import { FiTrash2 } from "react-icons/fi";
import UniversalUploadModal from "../components/UniversalUploadModal";

import { useToast } from "@chakra-ui/react";
import { useRef } from "react";

/* ---------- utils ---------- */
const timeAgo = (ts) => {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Guestbook() {
  const { id: eventId } = useParams();
  const { user } = useAuthContext();
  const db = firebase.firestore();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);

  const toast = useToast();
  const inputRef = useRef(null);

  const bottomRef = React.useRef(null);

  /* ---------- Upload modal ---------- */
  const {
    isOpen: uploadOpen,
    onOpen: openUpload,
    onClose: closeUpload,
  } = useDisclosure();

const scrollToLastMessage = () => {
  if (!bottomRef.current) return;

  const NAVBAR_OFFSET = 200; // header + breathing space
  const rect = bottomRef.current.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  window.scrollTo({
    top: rect.top + scrollTop - NAVBAR_OFFSET,
    behavior: "smooth",
  });
};


useEffect(() => {
  scrollToLastMessage();
}, [messages]);


  /* ---------- LOAD EVENT (HOST) ---------- */
  useEffect(() => {
    if (!eventId) return;

    db.collection("events")
      .doc(eventId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setAdminId(doc.data().adminId);
        }
      });
  }, [eventId, db]);

  /* ---------- LOAD MESSAGES ---------- */
  useEffect(() => {
    if (!eventId) return;

    const unsub = db
      .collection("guestbook")
      .where("eventId", "==", eventId)
      .orderBy("createdAt", "asc")
      .onSnapshot((snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });

    return () => unsub();
  }, [eventId, db]);



  /* ---------- SEND TEXT ---------- */
  const sendText = async () => {
    const message = text.trim();
    if (!message) return;

    // 👇 FIX MOBILE: blur keyboard first
    inputRef.current?.blur();

    // Optimistic UI
    setText("");
 

    toast({
      title: "Message sent",
      status: "success",
      duration: 1500,
      position: "bottom",
      isClosable: false,
    });

    try {
      await db.collection("guestbook").add({
        eventId,
        type: "text",
        content: message,
        userId: user.uid,
        displayName: user.displayName || "Guest",
        photoURL: user.photoURL || "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        deleted: false,
      });
    } catch (err) {
      toast({
        title: "Failed to send message",
        status: "error",
        duration: 2000,
        position: "bottom",
      });
    }
  };
  const handleKeyDown = (e) => {
    // Desktop Enter → send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop newline
      sendText();
    }
  };

  /* ---------- MEDIA UPLOAD (IMAGE / VIDEO) ---------- */
  const handleMediaUpload = async ({ type, mediaUrl, content = "" }) => {
    await db.collection("guestbook").add({
      eventId,
      type,
      mediaUrl,
      content,
      userId: user.uid,
      displayName: user.displayName || "Guest",
      photoURL: user.photoURL || "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      deleted: false,
    });
  };

  /* ---------- SOFT DELETE ---------- */
  const softDelete = (id) =>
    db.collection("guestbook").doc(id).update({
      deleted: true,
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

  if (loading) {
    return (
      <Flex minH="60vh" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" pb="140px">
      <HeaderSpacer />

      <Box px={{ base: 3, md: 8 }}>
        <Flex direction={{ base: "column", md: "row" }} gap={10}>
          {/* ================= YOUR MESSAGES ================= */}
          <Box w={{ base: "100%", md: "30%" }}>
            <Text fontWeight="600" mb={4} pb={10}>
              Your Messages
            </Text>

            <Flex direction="column" gap={6}>
              {messages
                .filter((m) => m.userId === user.uid && !m.deleted)
                .map((m, index, arr) => {
                  const isLast = index === arr.length - 1;

                  return (
                    <Box key={m.id} ref={isLast ? bottomRef : null}>
                      <MessageCard
                        m={m}
                        role="self"
                        canDelete
                        onDelete={softDelete}
                      />
                    </Box>
                  );
                })}
            </Flex>
          </Box>

          {/* ================= GUEST MESSAGES ================= */}
          <Box w={{ base: "100%", md: "70%" }}>
            <Text fontWeight="600" mb={4} pb={10}>
              Guest Messages
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} spacing={6}>
              {messages
                .filter((m) => m.userId !== user.uid && !m.deleted)
                .map((m) => (
                  <MessageCard
                    key={m.id}
                    m={m}
                    role={m.userId === adminId ? "host" : "guest"}
                    canDelete={user.uid === adminId}
                    onDelete={softDelete}
                  />
                ))}
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>

      {/* ================= INPUT BAR ================= */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTop="1px solid #a57256"
        px={4}
        py={3}
      >
        <Flex maxW="900px" mx="auto" gap={2}>
          <Button variant="ghost" onClick={openUpload}>
            <AddIcon />
          </Button>

          <Textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            resize="none"
            rows={1}
            sx={{
              overflow: "hidden",
            }}
          />

          <Button
            bg="#EBD9A6"
            color="#3A2F2A"
            _hover={{ bg: "#D1B7A1" }}
            isDisabled={!text.trim()}
            onPointerDown={(e) => {
              e.preventDefault(); // 🚨 stops blur-first behavior
              sendText();
            }}
          >
            Send
          </Button>
        </Flex>
      </Box>

      {/* ================= UPLOAD MODAL ================= */}
      <UniversalUploadModal
        isOpen={uploadOpen}
        onClose={closeUpload}
        eventId={eventId}
        user={user}
        onUploadComplete={handleMediaUpload}
      />
    </Box>
  );
}

/* ======================================================
   MESSAGE CARD
====================================================== */
function MessageCard({ m, role, canDelete, onDelete }) {
  const bgMap = {
    host: "#e5e6eb",
    self: "#f9f7eeff",
    guest: "#FFFFFF",
  };

  return (
    <Box position="relative">
      <Box
        bg={bgMap[role]}
        px={6}
        pt={8}
        pb={6}
        borderRadius="36px"
        boxShadow="sm"
        minH="120px"
      >
        <Avatar
          src={m.photoURL || undefined}
          icon={<></>}
          size="lg"
          position="absolute"
          top="-20px"
          left="16px"
          border="4px solid #D1B7A1"
          bg="#FAEDE7"
          color="#3A2F2A"
          fontWeight="600"
          name=""
        >
          {!m.photoURL && m.displayName?.charAt(0).toUpperCase()}
        </Avatar>

        <Text fontSize="lg" fontWeight="600" textAlign="center">
          {m.displayName}
        </Text>

        {m.type === "text" && (
          <Text fontSize="sm" textAlign="center" mt={2}>
            {m.content}
          </Text>
        )}

        {m.type === "image" && (
          <img
            src={m.mediaUrl}
            alt=""
            style={{ maxWidth: "100%", borderRadius: 16, marginTop: 8 }}
          />
        )}

        {m.type === "video" && (
          <AspectRatio ratio={9 / 16} mt={2}>
            <video src={m.mediaUrl} controls />
          </AspectRatio>
        )}

        <Divider my={3} opacity={0.3} />

        <Text fontSize="xs" color="gray.400" textAlign="right">
          {timeAgo(m.createdAt)}
        </Text>
      </Box>

      {canDelete && (
        <IconButton
          icon={<FiTrash2 />}
          size="xs"
          aria-label="Delete message"
          variant="ghost"
          color="gray.400"
          _hover={{ color: "red.400", bg: "transparent" }}
          position="absolute"
          bottom="-14px"
          right="12px"
          onClick={() => onDelete(m.id)}
        />
      )}
    </Box>
  );
}
