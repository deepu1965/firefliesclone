import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ff: {
          // Light theme surfaces
          "bg-base":        "#F5F4F9",
          "bg-sidebar":     "#FFFFFF",
          "bg-elevated":    "#FFFFFF",
          "bg-surface":     "#F0EFFE",
          "bg-active":      "#EDE9FC",
          "bg-highlight":   "#F0EFFE",
          // Borders
          border:           "#EBEBEB",
          "border-active":  "#7B5DE8",
          // Purple accent palette (preserved)
          accent:           "#7B5DE8",
          "accent-light":   "#6050C8",
          "accent-subtle":  "#EDE9FC",
          // Text scale
          "text-primary":   "#1A1A2E",
          "text-body":      "#3D3D5C",
          "text-secondary": "#6B6B8E",
          "text-muted":     "#9898B8",
          "text-dim":       "#8888A8",
          "text-faint":     "#C8C8E0",
          // Semantic
          success:          "#10B981",
          "success-bg":     "#ECFDF5",
          "badge-bg":       "#F0EFFE",
          "badge-text":     "#6B6B8E",
          error:            "#EF4444",
          warning:          "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4" }],
        xs:   ["12px", { lineHeight: "1.55" }],
        sm:   ["13px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.6" }],
        md:   ["15px", { lineHeight: "1.5" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(123,93,232,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        "sidebar": "1px 0 0 #EBEBEB",
      },
    },
  },
  plugins: [],
};

export default config;
