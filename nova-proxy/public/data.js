"use strict";
// Edit these lists to change the tiles on the Games / Apps pages.
// Every link opens through the proxy.

const GAMES = [
	{ name: "Poki", url: "https://poki.com", emoji: "🎮" },
	{ name: "CrazyGames", url: "https://www.crazygames.com", emoji: "🕹️" },
	{ name: "Y8", url: "https://www.y8.com", emoji: "👾" },
	{ name: "Miniclip", url: "https://www.miniclip.com", emoji: "🎯" },
	{ name: "2048", url: "https://play2048.co", emoji: "🔢" },
	{ name: "Slither.io", url: "https://slither.io", emoji: "🐍" },
	{ name: "Agar.io", url: "https://agar.io", emoji: "🟢" },
	{ name: "Krunker", url: "https://krunker.io", emoji: "🔫" },
	{ name: "Shell Shockers", url: "https://shellshock.io", emoji: "🥚" },
	{ name: "Cookie Clicker", url: "https://orteil.dashnet.org/cookieclicker/", emoji: "🍪" },
	{ name: "Little Alchemy 2", url: "https://littlealchemy2.com", emoji: "⚗️" },
	{ name: "Tetris", url: "https://tetris.com/play-tetris", emoji: "🧱" },
	{ name: "Wordle", url: "https://www.nytimes.com/games/wordle/index.html", emoji: "🔤" },
	{ name: "Lichess", url: "https://lichess.org", emoji: "♟️" },
	{ name: "Chess.com", url: "https://www.chess.com/play/online", emoji: "♞" },
	{ name: "Minecraft Classic", url: "https://classic.minecraft.net", emoji: "⛏️" },
];

const APPS = [
	{ name: "Google", url: "https://www.google.com", emoji: "🔎" },
	{ name: "DuckDuckGo", url: "https://duckduckgo.com", emoji: "🦆" },
	{ name: "YouTube", url: "https://www.youtube.com", emoji: "▶️" },
	{ name: "Reddit", url: "https://www.reddit.com", emoji: "👽" },
	{ name: "Wikipedia", url: "https://en.wikipedia.org", emoji: "📚" },
	{ name: "Discord", url: "https://discord.com/app", emoji: "💬" },
	{ name: "Spotify", url: "https://open.spotify.com", emoji: "🎧" },
	{ name: "Twitch", url: "https://www.twitch.tv", emoji: "📺" },
	{ name: "GitHub", url: "https://github.com", emoji: "🐙" },
	{ name: "Netflix", url: "https://www.netflix.com", emoji: "🎬" },
];

// Shown on the Home page by default (users can add their own too).
const QUICK = [
	{ name: "YouTube", url: "https://www.youtube.com", emoji: "▶️" },
	{ name: "Google", url: "https://www.google.com", emoji: "🔎" },
	{ name: "Poki", url: "https://poki.com", emoji: "🎮" },
	{ name: "Reddit", url: "https://www.reddit.com", emoji: "👽" },
	{ name: "Discord", url: "https://discord.com/app", emoji: "💬" },
	{ name: "Wikipedia", url: "https://en.wikipedia.org", emoji: "📚" },
];
