/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,js}"],
    theme: {
        extend: {
            colors: {
            primary: "#2563eb",     // main action, brand
            secondary: "#dbb6eb", 
            secondaryText: "#dbb6eb",  // purple
            accentColour: "#ffc494", 
                 // orangeLight
            background: "#3d447a", 
            darkerBackground: "#2d2f49", // dark purple
            backgroundShade: "#34668b", //dark blue 
            pong: "#ffccac",     // cards, surfaces
            lightText: "#f8f8f8",        // main text
            muted: "#6b7280",       // muted text
            error: "#ef4444",       // error messages
            ballColour: "#8f97de",
            redColour: "#ff6a80",
            greenColour: "#c0df85",
            },
            fontFamily: {
            // headline: ["titular-alt", "system-ui", "sans-serif"], 
            //headline: ["alwyn-new-rounded-web", "system-ui", "sans-serif"], 
            //headline: ["gothiks-round", "system-ui", "sans-serif"],   
            //headline: ["Montserrat", "system-ui", "sans-serif"],  
            headline: ["Quicksand", "system-ui", "sans-serif"],        
            },
        },
    },
    plugins: [],
    safelist: [
    // exact classes
    'border-[0.15rem]',
    'border-[8px]',
    'border-greenColour',
    'border-accentColour',
    'border-secondaryText',
    // with variants if you need them:
    { pattern: /border-\[(?:0\.4rem|8px)\]/, variants: ['hover', 'focus'] }
  ],
};


//"gothiks-round"