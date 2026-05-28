import { sports as defaultSports } from "./sports";
import { contactInfo as defaultContactInfo } from "./contact";

export const SITE_CONTENT_STORAGE_KEY = "daksha_site_content_v1";

export const defaultSiteContent = {
  heroDates: {
    startDate: "21st March 2026",
    endDate: "23rd March 2026",
  },
  homeStats: {
    events: "9",
    athletes: "800+",
    duration: "3 Days",
    arena: "1",
  },
  pickYourBattleSports: [
    { id: 1, name: "Cricket", emoji: "🏏", players: "11v11" },
    { id: 2, name: "Volleyball", emoji: "🏐", players: "6v6" },
    { id: 3, name: "Kabaddi", emoji: "🤼", players: "7v7" },
    { id: 4, name: "Badminton", emoji: "🏸", players: "Singles/Doubles" },
    { id: 5, name: "Chess", emoji: "♟️", players: "1v1" },
    { id: 6, name: "Kho-Kho", emoji: "🏃", players: "12v12" },
  ],
  gallery: {
    sections: [
      {
        id: 2,
        sport: "Cricket",
        emoji: "🏏",
        gradient: "from-cyan-500 via-blue-500 to-indigo-600",
        glow: "rgba(6, 182, 212, 0.4)",
        images: [
          { id: "c1", url: "/cri1.jpg", title: "Perfect Swing", likes: 312 },
          { id: "c2", url: "/cri2.jpg", title: "Team Spirit", likes: 267 },
        ],
      },
      {
        id: 3,
        sport: "Volleyball",
        emoji: "🏐",
        gradient: "from-amber-500 via-orange-500 to-yellow-600",
        glow: "rgba(245, 158, 11, 0.4)",
        images: [
          { id: "v1", url: "/volley1.jpg", title: "Spike Attack", likes: 198 },
          { id: "v2", url: "/volley2.jpg", title: "Team Huddle", likes: 156 },
        ],
      },
      {
        id: 4,
        sport: "Kho-Kho",
        emoji: "🏃",
        gradient: "from-orange-500 via-red-500 to-rose-600",
        glow: "rgba(239, 68, 68, 0.4)",
        images: [
          { id: "b1", url: "/khokho.jpeg", title: "Slam Dunk", likes: 445 },
          { id: "b2", url: "/khokho1.jpeg", title: "Court Action", likes: 378 },
        ],
      },
      {
        id: 5,
        sport: "Badminton",
        emoji: "🏸",
        gradient: "from-lime-500 via-emerald-500 to-green-600",
        glow: "rgba(132, 204, 22, 0.4)",
        images: [
          { id: "bd1", url: "/bad2.jpeg", title: "Smash Shot", likes: 167 },
          { id: "bd2", url: "/bad1.jpeg", title: "Finals Match", likes: 145 },
        ],
      },
      {
        id: 7,
        sport: "Chess",
        emoji: "♟️",
        gradient: "from-slate-400 via-gray-500 to-zinc-600",
        glow: "rgba(148, 163, 184, 0.4)",
        images: [
          { id: "ch1", url: "/chess1.jpg", title: "Checkmate Moment", likes: 178 },
          { id: "ch2", url: "/chess2.jpg", title: "Strategic Play", likes: 156 },
        ],
      },
      {
        id: 8,
        sport: "Kabaddi",
        emoji: "🤼",
        gradient: "from-pink-500 via-rose-500 to-red-600",
        glow: "rgba(244, 63, 94, 0.4)",
        images: [
          { id: "t1", url: "/kab1.jpeg", title: "Rally Action", likes: 134 },
          { id: "t2", url: "/kab2.jpeg", title: "Championship Point", likes: 112 },
        ],
      },
    ],
  },
  registration: {
    isLive: true,
    isAccommodationLive: true,
    sports: defaultSports.map((sport) => ({
      ...sport,
      qrCode:
        sport.name === "Volleyball" ||
        sport.name === "Kho-Kho (Boys)" ||
        sport.name === "Kho-Kho (Girls)" ||
        sport.name === "Kabaddi (Boys)" ||
        sport.name === "Kabaddi (Girls)"
          ? "/3000.jpeg"
          : sport.name === "Badminton (Boys)"
            ? "/2000.jpeg"
            : sport.name === "Badminton (Girls)" || sport.name === "Chess"
              ? "/1500.jpeg"
              : sport.name === "Cricket"
                ? "/2800.png"
                : "",
    })),
    accommodationCharge: 550,
    accommodationQrCode: "/acco.jpeg",
    supportWhatsapp: "9875325878",
  },
  contact: {
    general: {
      ...defaultContactInfo.general,
    },
    teachersCommittee: [...(defaultContactInfo.teachersCommittee || [])],
    studentCommittee: [...(defaultContactInfo.studentCommittee || [])],
  },
};

