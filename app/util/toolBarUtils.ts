// import React, { useState } from "react";
// import { Modes } from "~/util/types";

// export const elementsList: { type: Modes; label: string; icon: React.ReactNode }[] = [
//     {
//       type: Modes.GRAB,
//       label: "Grab",
//       icon: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             d="M7 11.5V5a1.5 1.5 0 113 0v6.5m0-6.5V3a1.5 1.5 0 113 0v8.5m0-8.5V4a1.5 1.5 0 113 0v7.5m0-6.5A1.5 1.5 0 0118 6.5V12a6 6 0 01-6 6h-1a6 6 0 01-4.243-1.757l-1.5-1.5"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.CONTAINER,
//       label: "Container",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.PICTURE,
//       label: "Image",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
//           <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
//           <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.TEXT,
//       label: "Text",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.AUDIO,
//       label: "Audio",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.VIDEO,
//       label: "Video",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//     },
//     {
//       type: Modes.AI,
//       label: "AI Assistant",
//       icon: (
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       ),
//     },
//   ];