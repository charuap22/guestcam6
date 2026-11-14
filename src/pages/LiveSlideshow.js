// src/pages/LiveSlideshow.js
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  IconButton,
  Button,
  HStack,
  Text,
  Center,
  Fade,
  Select,
  Tooltip,
  useColorModeValue,
  useClipboard,
  Spinner,
} from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPause,
  FiPlay,
  FiX,
  FiShuffle,
  FiCopy,
  FiLink,
  FiMonitor,
} from "react-icons/fi";
import { useCollection } from "../hooks/useCollection";

/**
 * LiveSlideshow (React Router v5)
 * - Hardened init so currentBg always set once images available.
 * - Preload+decode next image, background-image layers for smooth swap.
 */
export default function LiveSlideshow({ kiosk = false, embed = false }) {
  const DEBUG = false; // set true to see console logs

  const { id: eventId, mode } = useParams();
  const history = useHistory();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const kioskMode =
    kiosk || mode === "kiosk" || searchParams.get("kiosk") === "1";
  const embedMode =
    embed || mode === "embed" || searchParams.get("embed") === "1";

  // fetch gallery images
  const {
    documents: images = [],
    error,
    isPending,
  } = useCollection(
    "gallery",
    ["eventId", "==", eventId],
    ["createdAt", "desc"]
  );

  const safeImages = useMemo(
    () => (images || []).filter((i) => i && i.url),
    [images]
  );

  // state
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [intervalMs, setIntervalMs] = useState(4000);
  const [shuffle, setShuffle] = useState(false);
  const [showControls, setShowControls] = useState(!kioskMode && !embedMode);

  // crossfade backgrounds
  const [currentBg, setCurrentBg] = useState(null);
  const [nextBg, setNextBg] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const orderRef = useRef(order);
  orderRef.current = order;
  const indexRef = useRef(index);
  indexRef.current = index;

  const { hasCopied, onCopy } = useClipboard(
    typeof window !== "undefined" ? window.location.href : ""
  );
  const bg = useColorModeValue("gray.100", "gray.900");

  // Build order and set initial currentBg synchronously when safeImages becomes available
  useEffect(() => {
    if (!safeImages || safeImages.length === 0) {
      setOrder([]);
      setIndex(0);
      setCurrentBg(null);
      return;
    }

    // build ids (ordered by safeImages which came from your hook sorting)
    const ids = safeImages.map((s) => s.id);

    // apply shuffle if needed
    const finalIds = shuffle
      ? (() => {
          const arr = [...ids];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          return arr;
        })()
      : ids;

    // set order synchronously
    setOrder(finalIds);

    // attempt to set an initial currentBg immediately to avoid blank screen
    const firstId = finalIds.length ? finalIds[0] : null;
    const firstImg = firstId
      ? safeImages.find((s) => s.id === firstId)
      : safeImages[0];
    if (firstImg && firstImg.url) {
      setCurrentBg(firstImg.url);
      setIndex(0);
      if (DEBUG) console.debug("LiveSlideshow initial image set", firstImg.url);
    } else {
      // fallback: set to first safeImages url if available
      if (safeImages[0] && safeImages[0].url) {
        setCurrentBg(safeImages[0].url);
        setIndex(0);
        if (DEBUG)
          console.debug(
            "LiveSlideshow fallback initial image set",
            safeImages[0].url
          );
      } else {
        setCurrentBg(null);
      }
    }
  }, [safeImages, shuffle, DEBUG]);

  // helper: get image object at an order index
  const imageObjAt = useCallback(
    (ordIdx) => {
      if (!order.length) return null;
      const idx = ((ordIdx % order.length) + order.length) % order.length;
      const id = order[idx];
      return safeImages.find((img) => img.id === id) || null;
    },
    [order, safeImages]
  );

  // preload + decode utility
  const preloadAndDecode = useCallback(async (url) => {
    if (!url) return;
    try {
      const img = new Image();
      img.src = url;
      if (img.decode) {
        await img.decode().catch(() => {});
      } else {
        await new Promise((res) => {
          img.onload = () => res(true);
          img.onerror = () => res(true);
        });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // autoplay: preload next image, then crossfade to it after decode
  useEffect(() => {
    if (!order.length) return;
    if (!playing) return;
    if (typeof document !== "undefined" && document.hidden) return;

    let cancelled = false;

    const tick = async () => {
      if (!orderRef.current.length) return;
      const nextIdx = (indexRef.current + 1) % orderRef.current.length;
      const nextObj = imageObjAt(nextIdx);
      if (!nextObj || !nextObj.url) return;

      // preload/decode
      await preloadAndDecode(nextObj.url);
      if (cancelled) return;

      // set next background and start transition
      setNextBg(nextObj.url);
      // start transition on next animation frame for reliable paint
      requestAnimationFrame(() => setIsTransitioning(true));

      const TRANS_MS = 350;
      setTimeout(() => {
        if (cancelled) return;
        setCurrentBg(nextObj.url);
        setIsTransitioning(false);
        setNextBg(null);
        setIndex((i) => (i + 1) % orderRef.current.length);
      }, TRANS_MS);
    };

    const idTimer = setInterval(() => {
      tick().catch((e) => {
        if (DEBUG) console.error("slideshow tick error", e);
      });
    }, intervalMs);

    // run once immediately (so user doesn't wait full interval for first advance)
    // (optional) you can remove immediate run if you prefer first interval wait
    // tick();

    return () => {
      cancelled = true;
      clearInterval(idTimer);
    };
  }, [playing, intervalMs, order.length, preloadAndDecode, imageObjAt, DEBUG]);

  // pause on tab hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setPlaying(false);
      else setPlaying(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // keyboard navigation
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        if (!embedMode) history.goBack();
      } else if (e.key === "ArrowLeft") {
        if (!orderRef.current.length) return;
        const prevIdx =
          (indexRef.current - 1 + orderRef.current.length) %
          orderRef.current.length;
        const prevObj = imageObjAt(prevIdx);
        if (prevObj) {
          preloadAndDecode(prevObj.url).then(() => {
            setCurrentBg(prevObj.url);
            setIndex(prevIdx);
          });
        }
      } else if (e.key === "ArrowRight") {
        if (!orderRef.current.length) return;
        const nextIdx = (indexRef.current + 1) % orderRef.current.length;
        const nextObj = imageObjAt(nextIdx);
        if (nextObj) {
          preloadAndDecode(nextObj.url).then(() => {
            setCurrentBg(nextObj.url);
            setIndex(nextIdx);
          });
        }
      } else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    },
    [history, embedMode, imageObjAt, preloadAndDecode]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // auto-hide controls
  useEffect(() => {
    if (kioskMode || embedMode) {
      setShowControls(false);
      return;
    }
    if (!showControls) return;
    const t = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(t);
  }, [showControls, index, kioskMode, embedMode]);

  const goPrev = () => {
    if (!order.length) return;
    const prevIdx = (index - 1 + order.length) % order.length;
    const prevObj = imageObjAt(prevIdx);
    if (prevObj) {
      preloadAndDecode(prevObj.url).then(() => {
        setCurrentBg(prevObj.url);
        setIndex(prevIdx);
      });
    }
  };
  const goNext = () => {
    if (!order.length) return;
    const nextIdx = (index + 1) % order.length;
    const nextObj = imageObjAt(nextIdx);
    if (nextObj) {
      preloadAndDecode(nextObj.url).then(() => {
        setCurrentBg(nextObj.url);
        setIndex(nextIdx);
      });
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const embedUrl = currentUrl.replace(/\/(kiosk|embed)?$/, "/embed");
  const kioskUrl = currentUrl.replace(/\/(kiosk|embed)?$/, "/kiosk");

  // renders
  if (error) {
    return (
      <Center minH="60vh">
        <Text color="red.500">Failed to load slideshow: {String(error)}</Text>
      </Center>
    );
  }
  if (isPending) {
    return (
      <Center minH="60vh">
        <Spinner />
        <Text ml={3}>Loading slideshow...</Text>
      </Center>
    );
  }
  if (!safeImages.length) {
    return (
      <Center minH="60vh">
        <Text>No photos available for slideshow.</Text>
      </Center>
    );
  }

  // crossfade / composite optimizations
  const TRANS_MS = 350;
  const layerBase = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) translateZ(0)", // promote to its own layer
    maxHeight: "92vh",
    maxWidth: "95vw",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "contain",
    willChange: "opacity, transform",
    borderRadius: 8,
  };

  return (
    <Box
      position="fixed"
      inset="0"
      bg="black"
      color="white"
      zIndex="overlay"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
      overflow="hidden"
    >
      {/* Top controls */}
      {showControls && (
        <Fade in={showControls}>
          <Flex
            position="absolute"
            top={4}
            left={4}
            right={4}
            justify="space-between"
            align="center"
            zIndex={80}
          >
            <HStack spacing={3}>
              {!embedMode && (
                <Button
                  variant="ghost"
                  leftIcon={<FiX />}
                  onClick={() => history.goBack()}
                  size="sm"
                  color="white"
                >
                  Exit
                </Button>
              )}

              <Tooltip label="Open Kiosk (new tab)">
                <IconButton
                  aria-label="kiosk"
                  icon={<FiMonitor />}
                  size="sm"
                  onClick={() => {
                    if (!window.confirm("Open kiosk slideshow in new tab?"))
                      return;
                    window.open(kioskUrl, "_blank", "noopener,noreferrer");
                  }}
                />
              </Tooltip>

              <Tooltip label="Shuffle">
                <IconButton
                  aria-label="shuffle"
                  icon={<FiShuffle />}
                  size="sm"
                  onClick={() => setShuffle((s) => !s)}
                  color={shuffle ? "yellow.300" : "white"}
                  variant="ghost"
                />
              </Tooltip>

              <Text fontSize="sm" color="whiteAlpha.800">
                {index + 1} / {order.length || safeImages.length}
              </Text>
            </HStack>

            <HStack spacing={3}>
              <Select
                size="sm"
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                bg="whiteAlpha.100"
                color="white"
                w="auto"
              >
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={4000}>4s</option>
                <option value={6000}>6s</option>
              </Select>

              <Button
                size="sm"
                onClick={() => setPlaying((p) => !p)}
                leftIcon={playing ? <FiPause /> : <FiPlay />}
              >
                {playing ? "Pause" : "Play"}
              </Button>

              <Tooltip label={hasCopied ? "Copied!" : "Copy link"}>
                <IconButton
                  aria-label="copy-link"
                  icon={<FiCopy />}
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(currentUrl);
                    onCopy();
                  }}
                />
              </Tooltip>

              <Tooltip label="Open embed URL">
                <IconButton
                  aria-label="embed"
                  icon={<FiLink />}
                  size="sm"
                  onClick={() => window.open(embedUrl, "_blank")}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </Fade>
      )}

      {/* viewport with two background layers to crossfade */}
      <Center h="100vh" w="100%" p={0}>
        <Box
          position="relative"
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* current layer */}
          <Box
            aria-hidden
            sx={{
              ...layerBase,
              zIndex: 10,
              opacity: isTransitioning ? 0 : 1,
              transition: `opacity ${TRANS_MS}ms ease`,
              backgroundImage: currentBg ? `url("${currentBg}")` : "none",
              width: currentBg ? "auto" : "0",
              height: currentBg ? "auto" : "0",
            }}
          />

          {/* next layer */}
          {nextBg && (
            <Box
              aria-hidden
              sx={{
                ...layerBase,
                zIndex: 20,
                opacity: isTransitioning ? 1 : 0,
                transition: `opacity ${TRANS_MS}ms ease`,
                backgroundImage: `url("${nextBg}")`,
              }}
            />
          )}

          {/* fallback placeholder */}
          {!currentBg && !nextBg && (
            <Center w="400px" h="300px" bg={bg}>
              <Text>Loading image...</Text>
            </Center>
          )}
        </Box>
      </Center>

      {/* nav buttons */}
      {showControls && (
        <>
          <IconButton
            aria-label="Prev"
            icon={<FiChevronLeft />}
            position="absolute"
            left={2}
            top="50%"
            transform="translateY(-50%)"
            size="lg"
            variant="ghost"
            color="white"
            zIndex={90}
            onClick={goPrev}
          />
          <IconButton
            aria-label="Next"
            icon={<FiChevronRight />}
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            size="lg"
            variant="ghost"
            color="white"
            zIndex={90}
            onClick={goNext}
          />
        </>
      )}

      {/* bottom credit */}
      {showControls && (
        <Fade in>
          <Flex
            position="absolute"
            bottom={6}
            left={0}
            right={0}
            justify="center"
            zIndex={80}
          >
            <HStack
              spacing={2}
              bg="blackAlpha.500"
              px={3}
              py={1}
              borderRadius="md"
            >
              <Text fontSize="sm">{/* optional name/filename */}</Text>
            </HStack>
          </Flex>
        </Fade>
      )}
    </Box>
  );
}
