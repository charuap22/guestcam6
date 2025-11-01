// src/theme/horizonTheme.js
import { extendTheme } from "@chakra-ui/react";

const horizonTheme = extendTheme({
  fonts: {
    heading: `'DM Sans', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,
    body: `'DM Sans', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
  colors: {
    brand: {
      500: "#5142E6", // purple used in theme
      600: "#3b2fe8",
    },
    gold: {
      400: "#c59b00",
      500: "#a78200",
    },
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
    },
    Button: {
      baseStyle: { rounded: "full" },
      sizes: { lg: { fontSize: "md", px: 6, py: 3 } },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "yellow" ? "gold.400" : undefined,
        }),
      },
    },
    Input: {
      variants: {
        horizon: {
          field: {
            bg: "white",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "gray.200",
            boxShadow: "sm",
          },
        },
      },
    },
    Select: {
      variants: {
        horizon: {
          field: {
            bg: "white",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "gray.200",
            boxShadow: "sm",
          },
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: 600,
        mb: 2,
        color: "gray.700",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
    },
  },
});

export default horizonTheme;
