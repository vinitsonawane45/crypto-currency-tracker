// // // const API = {
// // //   prices: "/api/prices",
// // //   history: id => `/api/history/${id}`,
// // //   add: "/add",
// // //   remove: "/remove",
// // //   alerts: "/api/alerts",
// // //   notes: "/api/notes",
// // //   portfolio: "/api/portfolio",
// // //   compare: "/api/compare",
// // //   search: "/api/search",
// // //   summary: "/api/summary",
// // //   image: id => `/api/image/${id}`
// // // };

// // // // Cache for API responses
// // // const cache = new Map();
// // // const CACHE_DURATION = 60000; // 1 minute

// // // // Debounce utility
// // // function debounce(func, wait) {
// // //   let timeout;
// // //   return function executedFunction(...args) {
// // //     const later = () => {
// // //       clearTimeout(timeout);
// // //       func(...args);
// // //     };
// // //     clearTimeout(timeout);
// // //     timeout = setTimeout(later, wait);
// // //   };
// // // }

// // // // Theme Toggle
// // // function setupThemeToggle() {
// // //   const themeToggle = document.getElementById("themeToggle");
// // //   if (themeToggle) {
// // //     themeToggle.addEventListener("change", e => {
// // //       document.documentElement.classList.toggle("dark", e.target.checked);
// // //       localStorage.setItem("theme", e.target.checked ? "dark" : "light");
// // //     });
// // //     if (localStorage.getItem("theme") === "dark") {
// // //       document.documentElement.classList.add("dark");
// // //       themeToggle.checked = true;
// // //     }
// // //   } else {
// // //     console.warn("Theme toggle element not found");
// // //   }
// // // }

// // // // Sidebar Toggle
// // // function setupSidebarToggle() {
// // //   const menuToggle = document.getElementById("menuToggle");
// // //   const sidebar = document.getElementById("sidebar");
// // //   if (menuToggle && sidebar) {
// // //     menuToggle.addEventListener("click", () => {
// // //       sidebar.classList.toggle("-translate-x-full");
// // //     });
// // //   } else {
// // //     console.warn("Menu toggle or sidebar element not found");
// // //   }
// // // }

// // // // Tab Navigation
// // // function setupTabNavigation() {
// // //   const navLinks = document.querySelectorAll(".nav-link");
// // //   if (navLinks.length > 0) {
// // //     navLinks.forEach(link => {
// // //       link.addEventListener("click", e => {
// // //         e.preventDefault();
// // //         const tabId = link.dataset.tab;
// // //         const tabPane = document.getElementById(tabId);
// // //         if (tabPane) {
// // //           document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
// // //           tabPane.classList.remove("hidden");
// // //           document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("bg-indigo-100", "dark:bg-indigo-900"));
// // //           link.classList.add("bg-indigo-100", "dark:bg-indigo-900");
// // //           const sidebar = document.getElementById("sidebar");
// // //           if (sidebar) sidebar.classList.add("-translate-x-full");
// // //         } else {
// // //           console.warn(`Tab pane with ID ${tabId} not found`);
// // //         }
// // //       });
// // //     });
// // //   } else {
// // //     console.warn("No nav links found");
// // //   }
// // // }

// // // // Fetch with Cache
// // // async function fetchWithCache(url, cacheKey = url) {
// // //   const now = Date.now();
// // //   if (cache.has(cacheKey) && now - cache.get(cacheKey).timestamp < CACHE_DURATION) {
// // //     console.log(`Using cached data for ${cacheKey}`);
// // //     return cache.get(cacheKey).data;
// // //   }
// // //   try {
// // //     const response = await fetch(url);
// // //     if (!response.ok) throw new Error(`API failed: ${response.status} ${response.statusText}`);
// // //     const data = await response.json();
// // //     cache.set(cacheKey, { data, timestamp: now });
// // //     console.log(`Fetched and cached data for ${cacheKey}`);
// // //     return data;
// // //   } catch (error) {
// // //     console.error(`Error fetching ${url}:`, error);
// // //     cache.delete(cacheKey); // Clear cache on error to prevent stale data
// // //     throw error;
// // //   }
// // // }

// // // // Show Toast
// // // function showToast(message, type = "info") {
// // //   const toastContainer = document.getElementById("toastContainer");
// // //   if (!toastContainer) {
// // //     console.warn("Toast container not found");
// // //     return;
// // //   }
// // //   const toast = document.createElement("div");
// // //   const bgColor = {
// // //     info: "bg-indigo-600",
// // //     success: "bg-green-600",
// // //     warning: "bg-yellow-600",
// // //     danger: "bg-red-600"
// // //   }[type] || "bg-indigo-600";
// // //   toast.className = `flex items-center gap-2 p-4 rounded-lg text-white ${bgColor} shadow-lg animate-fadeIn`;
// // //   toast.innerHTML = `
// // //     ${message}
// // //     <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
// // //       <i class="fas fa-times"></i>
// // //     </button>
// // //   `;
// // //   toastContainer.appendChild(toast);
// // //   setTimeout(() => toast.remove(), 5000);
// // // }

// // // // Toggle Loading State
// // // function toggleLoading(button, isLoading) {
// // //   if (!button) return;
// // //   const loadingSpan = button.querySelector(".loading");
// // //   if (loadingSpan) loadingSpan.classList.toggle("hidden", !isLoading);
// // //   button.disabled = isLoading;
// // // }

// // // // Fetch Summary
// // // async function fetchSummary() {
// // //   try {
// // //     const summary = await fetchWithCache(API.summary);
// // //     const summaryBadge = document.getElementById("summaryBadge");
// // //     if (summaryBadge) {
// // //       summaryBadge.textContent = 
// // //         `Portfolio: $${summary.portfolio_value.toFixed(2)} | P/L: $${summary.portfolio_profit_loss.toFixed(2)}`;
// // //     } else {
// // //       console.warn("Summary badge element not found");
// // //       showToast("Portfolio summary unavailable", "warning");
// // //     }
// // //   } catch (error) {
// // //     console.error("Error fetching summary:", error);
// // //     const summaryBadge = document.getElementById("summaryBadge");
// // //     if (summaryBadge) {
// // //       summaryBadge.textContent = "Error fetching summary";
// // //     }
// // //     showToast("Failed to load portfolio summary", "danger");
// // //   }
// // // }

// // // // Refresh Data
// // // async function refresh() {
// // //   try {
// // //     await fetchSummary();

// // //     const coinsResponse = await fetch("/");
// // //     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
// // //     const coinsHtml = await coinsResponse.text();
// // //     const parser = new DOMParser();
// // //     const doc = parser.parseFromString(coinsHtml, "text/html");

// // //     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
// // //       const button = card.querySelector("button[onclick*='showChart']");
// // //       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// // //     }).filter(id => id);

// // //     const trendingCoins = Array.from(doc.querySelectorAll("#trendingCoins .card")).map(card => {
// // //       const button = card.querySelector("button[onclick*='addCoin']");
// // //       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// // //     }).filter(id => id);

// // //     const allCoinIds = [...new Set([...watchlistCoins, ...trendingCoins])];
// // //     console.log("Fetching prices for coins:", allCoinIds);
// // //     const prices = await fetchWithCache(API.prices);
// // //     console.log("Received prices:", prices);

// // //     const portfolioData = await fetchWithCache(API.portfolio);
// // //     const alertsData = await fetchWithCache(API.alerts);
// // //     const notesData = await fetchWithCache(API.notes);

// // //     updateWatchlist(watchlistCoins, prices);
// // //     updateTrending(trendingCoins, prices, watchlistCoins);
// // //     renderPortfolio(portfolioData);
// // //     renderAlerts(alertsData, prices);
// // //     populateCompareForm(watchlistCoins);
// // //   } catch (error) {
// // //     console.error("Error refreshing data:", error);
// // //     showToast(`Failed to refresh data: ${error.message}`, "danger");
// // //   }
// // // }

// // // // Update Watchlist
// // // async function updateWatchlist(coins, prices) {
// // //   const grid = document.getElementById("coinGrid");
// // //   if (!grid) {
// // //     console.warn("Coin grid element not found");
// // //     return;
// // //   }
// // //   if (coins.length === 0) {
// // //     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No coins in watchlist</p>";
// // //     return;
// // //   }
// // //   const coinList = await fetchWithCache(`${API.search}?q=`);
// // //   grid.innerHTML = "";
// // //   coins.forEach(id => {
// // //     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
// // //     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
// // //     console.log(`Rendering watchlist coin ${id}:`, priceData);
// // //     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
// // //     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
// // //     grid.innerHTML += `
// // //       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
// // //         <div class="flex items-center gap-2 mb-2">
// // //           <img src="${API.image(id)}" class="w-8 h-8 lazy-load" onerror="this.src='https://placehold.co/32x32'" alt="${coinInfo.name}" loading="lazy">
// // //           <h3 class="text-lg font-semibold text-capitalize">${coinInfo.name}</h3>
// // //         </div>
// // //         <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${priceDisplay}</p>
// // //         <p class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// // //           24h: ${changeDisplay}
// // //         </p>
// // //         <p class="text-gray-600 dark:text-gray-400">${coinInfo.symbol.toUpperCase()}</p>
// // //         <div class="flex gap-2 mt-2">
// // //           <button class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors" onclick="showChart('${id}')" aria-label="View chart for ${coinInfo.name}">
// // //             <i class="fas fa-chart-line"></i> Chart
// // //           </button>
// // //           <button class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors" onclick="removeCoin('${id}')" aria-label="Remove ${coinInfo.name} from watchlist">
// // //             <i class="fas fa-trash"></i> Remove
// // //           </button>
// // //         </div>
// // //       </div>
// // //     `;
// // //   });
// // // }

// // // // Update Trending Coins
// // // async function updateTrending(coins, prices, watchlistCoins) {
// // //   const grid = document.getElementById("trendingCoins");
// // //   const ticker = document.getElementById("ticker");
// // //   if (!grid || !ticker) {
// // //     console.warn("Trending coins grid or ticker element not found");
// // //     return;
// // //   }
// // //   if (coins.length === 0) {
// // //     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No trending coins available</p>";
// // //     ticker.innerHTML = "<p class='text-gray-600 dark:text-gray-400'>No trending coins available</p>";
// // //     return;
// // //   }
// // //   const coinList = await fetchWithCache(`${API.search}?q=`);
// // //   grid.innerHTML = "";
// // //   ticker.innerHTML = "";
// // //   coins.forEach(id => {
// // //     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
// // //     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
// // //     console.log(`Rendering trending coin ${id}:`, priceData);
// // //     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
// // //     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
// // //     const isInWatchlist = watchlistCoins.includes(id);
// // //     grid.innerHTML += `
// // //       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
// // //         <img src="${API.image(id)}" class="w-12 h-12 mx-auto mb-2 lazy-load" onerror="this.src='https://placehold.co/48x48'" alt="${coinInfo.name}" loading="lazy">
// // //         <h3 class="text-lg font-semibold text-center text-capitalize">${coinInfo.name}</h3>
// // //         <p class="text-center text-gray-600 dark:text-gray-400">${priceDisplay}</p>
// // //         <p class="text-center ${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// // //           ${changeDisplay}
// // //         </p>
// // //         <button class="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors ${isInWatchlist ? 'opacity-50 cursor-not-allowed' : ''}" 
// // //                 onclick="addCoin('${id}')" ${isInWatchlist ? 'disabled' : ''} aria-label="${isInWatchlist ? 'Already in watchlist' : 'Add ' + coinInfo.name + ' to watchlist'}">
// // //           <i class="fas fa-plus-circle"></i> ${isInWatchlist ? 'Watched' : 'Watch'}
// // //         </button>
// // //       </div>
// // //     `;
// // //     ticker.innerHTML += `
// // //       <span class="inline-block mx-4">
// // //         ${coinInfo.name}: ${priceDisplay}
// // //         <span class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// // //           ${changeDisplay}
// // //         </span>
// // //       </span>
// // //     `;
// // //   });
// // // }

// // // // Render Portfolio
// // // function renderPortfolio(portfolioData) {
// // //   const tableBody = document.getElementById("portfolioTableBody");
// // //   const totalValue = document.getElementById("portfolioTotalValue");
// // //   const totalProfitLoss = document.getElementById("portfolioProfitLoss");
// // //   if (!tableBody || !totalValue || !totalProfitLoss) {
// // //     console.warn("Portfolio table elements not found");
// // //     return;
// // //   }
// // //   tableBody.innerHTML = "";
// // //   if (portfolioData.length === 0) {
// // //     tableBody.innerHTML = "<tr><td colspan='7' class='text-center text-gray-600 dark:text-gray-400 p-4'>No coins in portfolio</td></tr>";
// // //     totalValue.textContent = "$0.00";
// // //     totalProfitLoss.textContent = "$0.00";
// // //     return;
// // //   }
// // //   let totalVal = 0, totalPL = 0;
// // //   portfolioData.forEach(entry => {
// // //     totalVal += entry.current_value || 0;
// // //     totalPL += entry.profit_loss || 0;
// // //     const priceDisplay = entry.current_price > 0 ? `$${entry.current_price.toFixed(2)}` : "N/A";
// // //     const valueDisplay = entry.current_value > 0 ? `$${entry.current_value.toFixed(2)}` : "N/A";
// // //     const profitDisplay = entry.profit_loss !== null ? `$${entry.profit_loss.toFixed(2)} (${entry.profit_loss_pct.toFixed(2)}%)` : "N/A";
// // //     tableBody.innerHTML += `
// // //       <tr class="border-b border-gray-200 dark:border-gray-700">
// // //         <td class="p-2 text-capitalize">${entry.coin}</td>
// // //         <td class="p-2">${entry.amount.toFixed(6)}</td>
// // //         <td class="p-2">$${entry.entry_price.toFixed(2)}</td>
// // //         <td class="p-2">${priceDisplay}</td>
// // //         <td class="p-2">${valueDisplay}</td>
// // //         <td class="p-2 ${entry.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}">
// // //           ${profitDisplay}
// // //         </td>
// // //         <td class="p-2">
// // //           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="removeFromPortfolio('${entry.coin}')" aria-label="Remove ${entry.coin} from portfolio">
// // //             <i class="fas fa-trash"></i>
// // //           </button>
// // //         </td>
// // //       </tr>
// // //     `;
// // //   });
// // //   totalValue.textContent = `$${totalVal.toFixed(2)}`;
// // //   totalProfitLoss.textContent = `$${totalPL.toFixed(2)}`;
// // //   totalProfitLoss.className = `text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`;
// // // }

// // // // Render Alerts
// // // function renderAlerts(alertsData, prices) {
// // //   const tableBody = document.getElementById("alertsTableBody");
// // //   if (!tableBody) {
// // //     console.warn("Alerts table body not found");
// // //     return;
// // //   }
// // //   tableBody.innerHTML = "";
// // //   if (alertsData.length === 0) {
// // //     tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-gray-600 dark:text-gray-400 p-4'>No active alerts</td></tr>";
// // //     return;
// // //   }
// // //   alertsData.forEach(alert => {
// // //     const currentPrice = prices[alert.coin.toLowerCase()]?.usd || 0;
// // //     const priceDisplay = currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : "N/A";
// // //     tableBody.innerHTML += `
// // //       <tr class="border-b border-gray-200 dark:border-gray-700">
// // //         <td class="p-2 text-capitalize">${alert.coin}</td>
// // //         <td class="p-2">${alert.low ? `$${alert.low.toFixed(2)}` : "-"}</td>
// // //         <td class="p-2">${alert.high ? `$${alert.high.toFixed(2)}` : "-"}</td>
// // //         <td class="p-2">${priceDisplay}</td>
// // //         <td class="p-2">
// // //           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="deleteAlert('${alert.coin}')" aria-label="Remove alert for ${alert.coin}">
// // //             <i class="fas fa-trash"></i>
// // //           </button>
// // //         </td>
// // //       </tr>
// // //     `;
// // //   });
// // // }

// // // // Populate Comparison Form
// // // function populateCompareForm(coins) {
// // //   const container = document.getElementById("compareSelectCoins");
// // //   if (!container) {
// // //     console.warn("Compare select coins container not found");
// // //     return;
// // //   }
// // //   container.innerHTML = "";
// // //   coins.forEach(coin => {
// // //     container.innerHTML += `
// // //       <label class="flex items-center gap-2">
// // //         <input type="checkbox" value="${coin}" class="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded focus:ring-indigo-500">
// // //         <span class="text-capitalize">${coin}</span>
// // //       </label>
// // //     `;
// // //   });
// // // }

// // // // Add Coin
// // // async function addCoin(id, button = null) {
// // //   if (button) toggleLoading(button, true);
// // //   try {
// // //     const coinsResponse = await fetch("/");
// // //     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
// // //     const coinsHtml = await coinsResponse.text();
// // //     const parser = new DOMParser();
// // //     const doc = parser.parseFromString(coinsHtml, "text/html");
// // //     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
// // //       const btn = card.querySelector("button[onclick*='showChart']");
// // //       return btn ? btn.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// // //     }).filter(id => id);

// // //     if (watchlistCoins.includes(id.toLowerCase())) {
// // //       showToast(`${id} is already in your watchlist`, "warning");
// // //       return;
// // //     }

// // //     const formData = new FormData();
// // //     formData.append("symbol", id.toLowerCase());
// // //     const response = await fetch(API.add, { method: "POST", body: formData });
// // //     if (!response.ok) {
// // //       const error = await response.json();
// // //       throw new Error(error.error || "Failed to add coin");
// // //     }
// // //     const coinSymbolInput = document.getElementById("coinSymbolInput");
// // //     const searchResults = document.getElementById("searchResults");
// // //     if (coinSymbolInput) coinSymbolInput.value = "";
// // //     if (searchResults) searchResults.classList.add("hidden");
// // //     await refresh();
// // //     showToast(`${id} added to watchlist`, "success");
// // //   } catch (error) {
// // //     console.error("Error adding coin:", error);
// // //     showToast(error.message.includes("already in watchlist") ? `${id} is already in your watchlist` : `Error adding coin: ${error.message}`, "danger");
// // //   } finally {
// // //     if (button) toggleLoading(button, false);
// // //   }
// // // }

// // // // Remove Coin
// // // async function removeCoin(id, button = null) {
// // //   if (button) toggleLoading(button, true);
// // //   try {
// // //     const response = await fetch(API.remove, {
// // //       method: "POST",
// // //       headers: { "Content-Type": "application/json" },
// // //       body: JSON.stringify({ id: id.toLowerCase() })
// // //     });
// // //     if (!response.ok) throw new Error("Failed to remove coin");
// // //     await refresh();
// // //     showToast(`${id} removed from watchlist`, "success");
// // //   } catch (error) {
// // //     console.error("Error removing coin:", error);
// // //     showToast("Failed to remove coin", "danger");
// // //   } finally {
// // //     if (button) toggleLoading(button, false);
// // //   }
// // // }

// // // // Show Chart
// // // let priceChart;
// // // async function showChart(id) {
// // //   const modal = document.getElementById("chartModal");
// // //   const chartTitle = document.getElementById("chartTitle");
// // //   const coinNotes = document.getElementById("coinNotes");
// // //   const saveNotes = document.getElementById("saveNotes");
// // //   if (!modal || !chartTitle || !coinNotes || !saveNotes) {
// // //     console.warn("Chart modal elements not found");
// // //     showToast("Unable to display chart", "danger");
// // //     return;
// // //   }
// // //   try {
// // //     modal.classList.remove("hidden");
// // //     const data = await fetchWithCache(`${API.history(id.toLowerCase())}?range=all`);
// // //     chartTitle.textContent = `${id} Price History`;
// // //     if (priceChart) priceChart.destroy();
// // //     priceChart = new Chart(document.getElementById("priceChart"), {
// // //       type: "line",
// // //       data: {
// // //         datasets: [{
// // //           label: `${id} Price (USD)`,
// // //           data: data.map(d => ({ x: new Date(d.t), y: d.p })),
// // //           borderColor: "#6366f1",
// // //           tension: 0.1,
// // //           pointRadius: 0
// // //         }]
// // //       },
// // //       options: {
// // //         responsive: true,
// // //         maintainAspectRatio: false,
// // //         scales: {
// // //           x: { type: "time", time: { unit: "day" } },
// // //           y: { beginAtZero: false }
// // //         },
// // //         plugins: {
// // //           tooltip: {
// // //             mode: "index",
// // //             intersect: false
// // //           },
// // //           legend: { display: false }
// // //         }
// // //       }
// // //     });

// // //     const notes = await fetchWithCache(API.notes);
// // //     coinNotes.value = notes.find(n => n.coin.toLowerCase() === id.toLowerCase())?.text || "";

// // //     saveNotes.onclick = async () => {
// // //       toggleLoading(saveNotes, true);
// // //       try {
// // //         await fetch(API.notes, {
// // //           method: "POST",
// // //           headers: { "Content-Type": "application/json" },
// // //           body: JSON.stringify({ coin: id.toLowerCase(), text: coinNotes.value })
// // //         });
// // //         cache.delete(API.notes);
// // //         showToast("Note saved successfully", "success");
// // //       } catch (error) {
// // //         console.error("Error saving note:", error);
// // //         showToast("Failed to save note", "danger");
// // //       } finally {
// // //         toggleLoading(saveNotes, false);
// // //       }
// // //     };

// // //     const timeRangeContainer = document.querySelector(".flex.gap-2.mb-4");
// // //     if (timeRangeContainer) {
// // //       timeRangeContainer.innerHTML = `
// // //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white active" data-range="24h">24h</button>
// // //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="7d">7d</button>
// // //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="30d">30d</button>
// // //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="90d">90d</button>
// // //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="all">All</button>
// // //       `;
// // //       timeRangeContainer.addEventListener("click", async (e) => {
// // //         const btn = e.target.closest(".time-range-btn");
// // //         if (!btn) return;
// // //         const range = btn.dataset.range;
// // //         document.querySelectorAll(".time-range-btn").forEach(b => b.classList.remove("active"));
// // //         btn.classList.add("active");
// // //         try {
// // //           const newData = await fetchWithCache(`${API.history(id.toLowerCase())}?range=${range}`);
// // //           priceChart.data.datasets[0].data = newData.map(d => ({ x: new Date(d.t), y: d.p }));
// // //           priceChart.update();
// // //         } catch (error) {
// // //           console.error("Error updating chart:", error);
// // //           showToast("Failed to update chart", "danger");
// // //         }
// // //       });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error showing chart:", error);
// // //     showToast("Failed to load chart data", "danger");
// // //   }
// // // }

// // // // Close Chart Modal
// // // function setupCloseChartModal() {
// // //   const closeButton = document.getElementById("closeChartModal");
// // //   const modal = document.getElementById("chartModal");
// // //   if (closeButton && modal) {
// // //     closeButton.addEventListener("click", () => {
// // //       modal.classList.add("hidden");
// // //     });
// // //   } else {
// // //     console.warn("Chart modal close button or modal not found");
// // //   }
// // // }

// // // // Portfolio Form Submission
// // // function setupPortfolioForm() {
// // //   const portfolioForm = document.getElementById("portfolioForm");
// // //   if (!portfolioForm) {
// // //     console.warn("Portfolio form not found");
// // //     return;
// // //   }
// // //   portfolioForm.addEventListener("submit", async e => {
// // //     e.preventDefault();
// // //     const button = e.submitter;
// // //     toggleLoading(button, true);
// // //     try {
// // //       const coin = document.getElementById("portfolioCoin")?.value.toLowerCase();
// // //       const amount = parseFloat(document.getElementById("portfolioAmount")?.value || 0);
// // //       const price = parseFloat(document.getElementById("portfolioPrice")?.value || 0);
// // //       if (!coin) {
// // //         showToast("Please select a coin", "warning");
// // //         return;
// // //       }
// // //       if (amount <= 0) {
// // //         showToast("Amount must be greater than 0", "warning");
// // //         return;
// // //       }
// // //       if (price < 0) {
// // //         showToast("Purchase price cannot be negative", "warning");
// // //         return;
// // //       }
// // //       const response = await fetch(API.portfolio, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ coin, amount, price })
// // //       });
// // //       if (!response.ok) throw new Error("Failed to add to portfolio");
// // //       portfolioForm.reset();
// // //       cache.delete(API.portfolio);
// // //       await refresh();
// // //       showToast("Portfolio updated successfully", "success");
// // //     } catch (error) {
// // //       console.error("Error saving portfolio:", error);
// // //       showToast("Failed to update portfolio", "danger");
// // //     } finally {
// // //       toggleLoading(button, false);
// // //     }
// // //   });
// // // }

// // // // Remove from Portfolio
// // // async function removeFromPortfolio(coinId, button) {
// // //   toggleLoading(button, true);
// // //   try {
// // //     const response = await fetch(`${API.portfolio}?coin=${coinId.toLowerCase()}`, { method: "DELETE" });
// // //     if (!response.ok) throw new Error("Failed to remove from portfolio");
// // //     cache.delete(API.portfolio);
// // //     await refresh();
// // //     showToast("Removed from portfolio", "success");
// // //   } catch (error) {
// // //     console.error("Error removing from portfolio:", error);
// // //     showToast("Failed to remove from portfolio", "danger");
// // //   } finally {
// // //     toggleLoading(button, false);
// // //   }
// // // }

// // // // Alerts Form Submission
// // // function setupAlertForm() {
// // //   const alertForm = document.getElementById("alertForm");
// // //   if (!alertForm) {
// // //     console.warn("Alert form not found");
// // //     return;
// // //   }
// // //   alertForm.addEventListener("submit", async e => {
// // //     e.preventDefault();
// // //     const button = e.submitter;
// // //     toggleLoading(button, true);
// // //     try {
// // //       const coin = document.getElementById("alertCoin")?.value.toLowerCase();
// // //       const high = parseFloat(document.getElementById("alertHigh")?.value || 0);
// // //       const low = parseFloat(document.getElementById("alertLow")?.value || 0);
// // //       if (!coin) {
// // //         showToast("Please select a coin", "warning");
// // //         return;
// // //       }
// // //       if (high <= 0 && low <= 0) {
// // //         showToast("At least one price threshold must be set", "warning");
// // //         return;
// // //       }
// // //       if (high < 0 || low < 0) {
// // //         showToast("Price thresholds cannot be negative", "warning");
// // //         return;
// // //       }
// // //       const response = await fetch(API.alerts, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ coin, high: high || null, low: low || null })
// // //       });
// // //       if (!response.ok) throw new Error("Failed to set alert");
// // //       alertForm.reset();
// // //       cache.delete(API.alerts);
// // //       await refresh();
// // //       showToast("Alert set successfully", "success");
// // //     } catch (error) {
// // //       console.error("Error setting alert:", error);
// // //       showToast("Failed to set alert", "danger");
// // //     } finally {
// // //       toggleLoading(button, false);
// // //     }
// // //   });
// // // }

// // // // Delete Alert
// // // async function deleteAlert(coin, button) {
// // //   toggleLoading(button, true);
// // //   try {
// // //     const response = await fetch(`${API.alerts}?coin=${coin.toLowerCase()}`, { method: "DELETE" });
// // //     if (!response.ok) throw new Error("Failed to remove alert");
// // //     cache.delete(API.alerts);
// // //     await refresh();
// // //     showToast("Alert removed successfully", "success");
// // //   } catch (error) {
// // //     console.error("Error removing alert:", error);
// // //     showToast("Failed to remove alert", "danger");
// // //   } finally {
// // //     toggleLoading(button, false);
// // //   }
// // // }

// // // // Compare Form Submission
// // // function setupCompareForm() {
// // //   const compareForm = document.getElementById("compareForm");
// // //   if (!compareForm) {
// // //     console.warn("Compare form not found");
// // //     return;
// // //   }
// // //   compareForm.addEventListener("submit", async e => {
// // //     e.preventDefault();
// // //     const button = e.submitter;
// // //     toggleLoading(button, true);
// // //     try {
// // //       const selected = Array.from(document.querySelectorAll("#compareSelectCoins input:checked")).map(input => input.value.toLowerCase());
// // //       if (selected.length < 2 || selected.length > 5) {
// // //         showToast("Please select 2-5 coins to compare", "warning");
// // //         return;
// // //       }
// // //       const response = await fetch(API.compare, {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({ coins: selected })
// // //       });
// // //       if (!response.ok) throw new Error("Failed to create comparison");
// // //       const { id } = await response.json();
// // //       cache.delete(API.compare);
// // //       await showComparison(id);
// // //     } catch (error) {
// // //       console.error("Error creating comparison:", error);
// // //       showToast("Failed to create comparison", "danger");
// // //     } finally {
// // //       toggleLoading(button, false);
// // //     }
// // //   });
// // // }

// // // // Show Comparison
// // // let compareChart;
// // // async function showComparison(id) {
// // //   const compareChartCanvas = document.getElementById("compareChart");
// // //   if (!compareChartCanvas) {
// // //     console.warn("Compare chart canvas not found");
// // //     showToast("Unable to display comparison", "danger");
// // //     return;
// // //   }
// // //   try {
// // //     const data = await fetchWithCache(`${API.compare}?id=${id}`);
// // //     if (compareChart) compareChart.destroy();
// // //     compareChart = new Chart(compareChartCanvas, {
// // //       type: "line",
// // //       data: {
// // //         datasets: Object.keys(data).map(coin => ({
// // //           label: coin,
// // //           data: data[coin].map(d => ({ x: new Date(d.date), y: d.price })),
// // //           borderColor: getRandomColor(),
// // //           tension: 0.1,
// // //           pointRadius: 0
// // //         }))
// // //       },
// // //       options: {
// // //         responsive: true,
// // //         maintainAspectRatio: false,
// // //         scales: {
// // //           x: { type: "time", time: { unit: "day" } },
// // //           y: { beginAtZero: false }
// // //         },
// // //         plugins: {
// // //           tooltip: {
// // //             mode: "index",
// // //             intersect: false
// // //           }
// // //         }
// // //       }
// // //     });

// // //     const recentList = document.getElementById("recentComparisons");
// // //     if (recentList) {
// // //       const comparisons = await fetchWithCache(API.compare);
// // //       recentList.innerHTML = "";
// // //       comparisons.forEach(comp => {
// // //         recentList.innerHTML += `
// // //           <button class="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" 
// // //                   onclick="showComparison('${comp.id}')" aria-label="View comparison: ${comp.coins.join(' vs ')}">
// // //             ${comp.coins.join(" vs ")} - ${new Date(comp.created_at).toLocaleString()}
// // //           </button>
// // //         `;
// // //       });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error showing comparison:", error);
// // //     showToast("Failed to load comparison", "danger");
// // //   }
// // // }

// // // function getRandomColor() {
// // //   return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
// // // }

// // // // Search Functionality
// // // const searchHandler = debounce(async e => {
// // //   const query = e.target.value.trim().toLowerCase();
// // //   const resultsDiv = document.getElementById("searchResults");
// // //   const resultsList = document.getElementById("searchResultsList");
// // //   if (!resultsDiv || !resultsList) {
// // //     console.warn("Search results elements not found");
// // //     return;
// // //   }
// // //   if (query.length < 2) {
// // //     resultsDiv.classList.add("hidden");
// // //     return;
// // //   }
// // //   try {
// // //     const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(query)}`);
// // //     resultsList.innerHTML = "";
// // //     if (results.length === 0) {
// // //       resultsList.innerHTML = "<div class='p-3 text-gray-600 dark:text-gray-400'>No results found</div>";
// // //     } else {
// // //       results.forEach(coin => {
// // //         const item = document.createElement("button");
// // //         item.className = "w-full text-left p-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-capitalize";
// // //         item.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
// // //         item.onclick = () => addCoin(coin.id.toLowerCase(), item);
// // //         resultsList.appendChild(item);
// // //       });
// // //     }
// // //     resultsDiv.classList.remove("hidden");
// // //   } catch (error) {
// // //     console.error("Error fetching search results:", error);
// // //     resultsList.innerHTML = "<div class='p-3 text-red-500'>Error fetching results</div>";
// // //     resultsDiv.classList.remove("hidden");
// // //   }
// // // }, 300);

// // // // Setup Search
// // // function setupSearch() {
// // //   const searchInput = document.getElementById("searchInput");
// // //   if (searchInput) {
// // //     searchInput.addEventListener("input", searchHandler);
// // //   } else {
// // //     console.warn("Search input not found");
// // //   }
// // //   document.addEventListener("click", e => {
// // //     const searchResults = document.getElementById("searchResults");
// // //     if (searchResults && !e.target.closest("#searchInput") && !e.target.closest("#searchResults")) {
// // //       searchResults.classList.add("hidden");
// // //     }
// // //   });
// // // }

// // // // Add Coin Form Submission
// // // function setupAddForm() {
// // //   const addForm = document.getElementById("addForm");
// // //   if (!addForm) {
// // //     console.warn("Add form not found");
// // //     return;
// // //   }
// // //   addForm.addEventListener("submit", async e => {
// // //     e.preventDefault();
// // //     const button = e.submitter;
// // //     toggleLoading(button, true);
// // //     const symbol = document.getElementById("coinSymbolInput")?.value.trim().toLowerCase();
// // //     try {
// // //       const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(symbol)}`);
// // //       const coin = results.find(c => c.id.toLowerCase() === symbol || c.symbol.toLowerCase() === symbol);
// // //       if (!coin) {
// // //         showToast(`Coin "${symbol}" not found`, "warning");
// // //         return;
// // //       }
// // //       await addCoin(coin.id.toLowerCase(), button);
// // //     } catch (error) {
// // //       console.error("Error validating coin:", error);
// // //       showToast(`Error validating coin: ${error.message}`, "danger");
// // //     } finally {
// // //       toggleLoading(button, false);
// // //     }
// // //   });
// // // }

// // // // Populate Portfolio and Alert Coin Selects
// // // async function populateSelects() {
// // //   try {
// // //     const coins = await fetchWithCache(`${API.search}?q=`);
// // //     const portfolioSelect = document.getElementById("portfolioCoin");
// // //     const alertSelect = document.getElementById("alertCoin");
// // //     if (portfolioSelect) {
// // //       portfolioSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
// // //       coins.forEach(coin => {
// // //         portfolioSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
// // //       });
// // //     }
// // //     if (alertSelect) {
// // //       alertSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
// // //       coins.forEach(coin => {
// // //         alertSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
// // //       });
// // //     }
// // //     if (!portfolioSelect || !alertSelect) {
// // //       console.warn("Portfolio or alert select not found");
// // //     }
// // //   } catch (error) {
// // //     console.error("Error populating selects:", error);
// // //     showToast("Failed to load coin list", "danger");
// // //   }
// // // }

// // // // Initialize
// // // function initialize() {
// // //   setupThemeToggle();
// // //   setupSidebarToggle();
// // //   setupTabNavigation();
// // //   setupCloseChartModal();
// // //   setupPortfolioForm();
// // //   setupAlertForm();
// // //   setupCompareForm();
// // //   setupSearch();
// // //   setupAddForm();
// // //   refresh();
// // //   populateSelects();
// // //   setInterval(refresh, 60000);
// // // }

// // // // Ensure DOM is loaded
// // // document.addEventListener("DOMContentLoaded", initialize);




// // const API = {
// //   prices: "/api/prices",
// //   history: id => `/api/history/${id}`,
// //   add: "/add",
// //   remove: "/remove",
// //   alerts: "/api/alerts",
// //   notes: "/api/notes",
// //   portfolio: "/api/portfolio",
// //   compare: "/api/compare",
// //   search: "/api/search",
// //   summary: "/api/summary",
// //   image: id => `/api/image/${id}`
// // };

// // // Cache for API responses
// // const cache = new Map();
// // const CACHE_DURATION = 60000; // 1 minute

// // // Debounce utility
// // function debounce(func, wait) {
// //   let timeout;
// //   return function executedFunction(...args) {
// //     const later = () => {
// //       clearTimeout(timeout);
// //       func(...args);
// //     };
// //     clearTimeout(timeout);
// //     timeout = setTimeout(later, wait);
// //   };
// // }

// // // Theme Toggle
// // function setupThemeToggle() {
// //   const themeToggle = document.getElementById("themeToggle");
// //   if (themeToggle) {
// //     themeToggle.addEventListener("change", e => {
// //       document.documentElement.classList.toggle("dark", e.target.checked);
// //       localStorage.setItem("theme", e.target.checked ? "dark" : "light");
// //     });
// //     if (localStorage.getItem("theme") === "dark") {
// //       document.documentElement.classList.add("dark");
// //       themeToggle.checked = true;
// //     }
// //   } else {
// //     console.warn("Theme toggle element not found");
// //   }
// // }

// // // Sidebar Toggle
// // function setupSidebarToggle() {
// //   const menuToggle = document.getElementById("menuToggle");
// //   const sidebar = document.getElementById("sidebar");
// //   if (menuToggle && sidebar) {
// //     menuToggle.addEventListener("click", () => {
// //       sidebar.classList.toggle("-translate-x-full");
// //     });
// //   } else {
// //     console.warn("Menu toggle or sidebar element not found");
// //   }
// // }

// // // Tab Navigation
// // function setupTabNavigation() {
// //   const navLinks = document.querySelectorAll(".nav-link");
// //   if (navLinks.length > 0) {
// //     navLinks.forEach(link => {
// //       link.addEventListener("click", e => {
// //         e.preventDefault();
// //         const tabId = link.dataset.tab;
// //         const tabPane = document.getElementById(tabId);
// //         if (tabPane) {
// //           document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
// //           tabPane.classList.remove("hidden");
// //           document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("bg-indigo-100", "dark:bg-indigo-900"));
// //           link.classList.add("bg-indigo-100", "dark:bg-indigo-900");
// //           const sidebar = document.getElementById("sidebar");
// //           if (sidebar) sidebar.classList.add("-translate-x-full");
// //         } else {
// //           console.warn(`Tab pane with ID ${tabId} not found`);
// //         }
// //       });
// //     });
// //   } else {
// //     console.warn("No nav links found");
// //   }
// // }

// // // Fetch with Cache
// // async function fetchWithCache(url, cacheKey = url) {
// //   const now = Date.now();
// //   if (cache.has(cacheKey) && now - cache.get(cacheKey).timestamp < CACHE_DURATION) {
// //     console.log(`Using cached data for ${cacheKey}`);
// //     return cache.get(cacheKey).data;
// //   }
// //   try {
// //     const response = await fetch(url);
// //     if (!response.ok) throw new Error(`API failed: ${response.status} ${response.statusText}`);
// //     const data = await response.json();
// //     cache.set(cacheKey, { data, timestamp: now });
// //     console.log(`Fetched and cached data for ${cacheKey}`);
// //     return data;
// //   } catch (error) {
// //     console.error(`Error fetching ${url}:`, error);
// //     cache.delete(cacheKey); // Clear cache on error to prevent stale data
// //     throw error;
// //   }
// // }

// // // Show Toast
// // function showToast(message, type = "info") {
// //   const toastContainer = document.getElementById("toastContainer");
// //   if (!toastContainer) {
// //     console.warn("Toast container not found");
// //     return;
// //   }
// //   const toast = document.createElement("div");
// //   const bgColor = {
// //     info: "bg-indigo-600",
// //     success: "bg-green-600",
// //     warning: "bg-yellow-600",
// //     danger: "bg-red-600"
// //   }[type] || "bg-indigo-600";
// //   toast.className = `flex items-center gap-2 p-4 rounded-lg text-white ${bgColor} shadow-lg animate-fadeIn`;
// //   toast.innerHTML = `
// //     ${message}
// //     <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
// //       <i class="fas fa-times"></i>
// //     </button>
// //   `;
// //   toastContainer.appendChild(toast);
// //   setTimeout(() => toast.remove(), 5000);
// // }

// // // Toggle Loading State
// // function toggleLoading(button, isLoading) {
// //   if (!button) return;
// //   const loadingSpan = button.querySelector(".loading");
// //   if (loadingSpan) loadingSpan.classList.toggle("hidden", !isLoading);
// //   button.disabled = isLoading;
// // }

// // // Fetch Summary
// // async function fetchSummary() {
// //   try {
// //     const summary = await fetchWithCache(API.summary);
// //     const summaryBadge = document.getElementById("summaryBadge");
// //     if (summaryBadge) {
// //       // Handle missing or malformed summary data
// //       const portfolioValue = summary.portfolio_value !== undefined ? summary.portfolio_value : 0.0;
// //       const profitLoss = summary.portfolio_profit_loss !== undefined ? summary.portfolio_profit_loss : 0.0;
// //       summaryBadge.textContent = `Portfolio: $${portfolioValue.toFixed(2)} | P/L: $${profitLoss.toFixed(2)}`;
// //       summaryBadge.className = `text-sm font-semibold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`;
// //     } else {
// //       console.warn("Summary badge element not found");
// //       showToast("Portfolio summary unavailable", "warning");
// //     }
// //   } catch (error) {
// //     console.error("Error fetching summary:", error);
// //     const summaryBadge = document.getElementById("summaryBadge");
// //     if (summaryBadge) {
// //       summaryBadge.textContent = "Error fetching summary";
// //       summaryBadge.className = "text-sm font-semibold text-red-500";
// //     }
// //     showToast("Failed to load portfolio summary", "danger");
// //   }
// // }

// // // Refresh Data
// // async function refresh() {
// //   try {
// //     await fetchSummary();

// //     const coinsResponse = await fetch("/");
// //     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
// //     const coinsHtml = await coinsResponse.text();
// //     const parser = new DOMParser();
// //     const doc = parser.parseFromString(coinsHtml, "text/html");

// //     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
// //       const button = card.querySelector("button[onclick*='showChart']");
// //       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// //     }).filter(id => id);

// //     const trendingCoins = Array.from(doc.querySelectorAll("#trendingCoins .card")).map(card => {
// //       const button = card.querySelector("button[onclick*='addCoin']");
// //       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// //     }).filter(id => id);

// //     const allCoinIds = [...new Set([...watchlistCoins, ...trendingCoins])];
// //     console.log("Fetching prices for coins:", allCoinIds);
// //     const prices = await fetchWithCache(API.prices);
// //     console.log("Received prices:", prices);

// //     const portfolioData = await fetchWithCache(Api.portfolio);
// //     const alertsData = await fetchWithCache(Api.alerts);
// //     const notesData = await fetchWithCache(Api.notes);

// //     updateWatchlist(watchlistCoins, prices);
// //     updateTrending(trendingCoins, prices, watchlistCoins);
// //     renderPortfolio(portfolioData);
// //     renderAlerts(alertsData, prices);
// //     populateCompareForm(watchlistCoins);
// //   } catch (error) {
// //     console.error("Error refreshing data:", error);
// //     showToast(`Failed to refresh data: ${error.message}`, "danger");
// //   }
// // }

// // // Update Watchlist
// // async function updateWatchlist(coins, prices) {
// //   const grid = document.getElementById("coinGrid");
// //   if (!grid) {
// //     console.warn("Coin grid element not found");
// //     return;
// //   }
// //   if (coins.length === 0) {
// //     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No coins in watchlist</p>";
// //     return;
// //   }
// //   const coinList = await fetchWithCache(`${API.search}?q=`);
// //   grid.innerHTML = "";
// //   coins.forEach(id => {
// //     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
// //     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
// //     console.log(`Rendering watchlist coin ${id}:`, priceData);
// //     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
// //     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
// //     grid.innerHTML += `
// //       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
// //         <div class="flex items-center gap-2 mb-2">
// //           <img src="${API.image(id)}" class="w-8 h-8 lazy-load" onerror="this.src='https://placehold.co/32x32'" alt="${coinInfo.name}" loading="lazy">
// //           <h3 class="text-lg font-semibold text-capitalize">${coinInfo.name}</h3>
// //         </div>
// //         <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${priceDisplay}</p>
// //         <p class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// //           24h: ${changeDisplay}
// //         </p>
// //         <p class="text-gray-600 dark:text-gray-400">${coinInfo.symbol.toUpperCase()}</p>
// //         <div class="flex gap-2 mt-2">
// //           <button class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors" onclick="showChart('${id}')" aria-label="View chart for ${coinInfo.name}">
// //             <i class="fas fa-chart-line"></i> Chart
// //           </button>
// //           <button class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors" onclick="removeCoin('${id}')" aria-label="Remove ${coinInfo.name} from watchlist">
// //             <i class="fas fa-trash"></i> Remove
// //           </button>
// //         </div>
// //       </div>
// //     `;
// //   });
// // }

// // // Update Trending Coins
// // async function updateTrending(coins, prices, watchlistCoins) {
// //   const grid = document.getElementById("trendingCoins");
// //   const ticker = document.getElementById("priceTicker");
// //   if (!grid || !ticker) {
// //     console.warn("Trending coins grid or ticker element not found");
// //     return;
// //   }
// //   if (coins.length === 0) {
// //     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No trending coins available</p>";
// //     ticker.innerHTML = "<p class='text-gray-600 dark:text-gray-400'>No trending coins available</p>";
// //     return;
// //   }
// //   const coinList = await fetchWithCache(`${API.search}?q=`);
// //   grid.innerHTML = "";
// //   ticker.innerHTML = "";
// //   coins.forEach(id => {
// //     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
// //     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
// //     console.log(`Rendering trending coin ${id}:`, priceData);
// //     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
// //     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
// //     const isInWatchlist = watchlistCoins.includes(id);
// //     grid.innerHTML += `
// //       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
// //         <img src="${API.image(id)}" class="w-12 h-12 mx-auto mb-2 lazy-load" onerror="this.src='https://placehold.co/48x48'" alt="${coinInfo.name}" loading="lazy">
// //         <h3 class="text-lg font-semibold text-center text-capitalize">${coinInfo.name}</h3>
// //         <p class="text-center text-gray-600 dark:text-gray-400">${priceDisplay}</p>
// //         <p class="text-center ${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// //           ${changeDisplay}
// //         </p>
// //         <button class="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors ${isInWatchlist ? 'opacity-50 cursor-not-allowed' : ''}" 
// //                 onclick="addCoin('${id}')" ${isInWatchlist ? 'disabled' : ''} aria-label="${isInWatchlist ? 'Already in watchlist' : 'Add ' + coinInfo.name + ' to watchlist'}">
// //           <i class="fas fa-plus-circle"></i> ${isInWatchlist ? 'Watched' : 'Watch'}
// //         </button>
// //       </div>
// //     `;
// //     ticker.innerHTML += `
// //       <span class="inline-block mx-4">
// //         ${coinInfo.name}: ${priceDisplay}
// //         <span class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
// //           ${changeDisplay}
// //         </span>
// //       </span>
// //     `;
// //   });
// // }

// // // Render Portfolio
// // function renderPortfolio(portfolioData) {
// //   const tableBody = document.getElementById("portfolioTableBody");
// //   const totalValue = document.getElementById("portfolioTotalValue");
// //   const totalProfitLoss = document.getElementById("portfolioProfitLoss");
// //   if (!tableBody || !totalValue || !totalProfitLoss) {
// //     console.warn("Portfolio table elements not found");
// //     return;
// //   }
// //   tableBody.innerHTML = "";
// //   if (portfolioData.length === 0) {
// //     tableBody.innerHTML = "<tr><td colspan='7' class='text-center text-gray-600 dark:text-gray-400 p-4'>No coins in portfolio</td></tr>";
// //     totalValue.textContent = "$0.00";
// //     totalProfitLoss.textContent = "$0.00";
// //     return;
// //   }
// //   let totalVal = 0, totalPL = 0;
// //   portfolioData.forEach(entry => {
// //     totalVal += entry.current_value || 0;
// //     totalPL += entry.profit_loss || 0;
// //     const priceDisplay = entry.current_price > 0 ? `$${entry.current_price.toFixed(2)}` : "N/A";
// //     const valueDisplay = entry.current_value > 0 ? `$${entry.current_value.toFixed(2)}` : "N/A";
// //     const profitDisplay = entry.profit_loss !== null ? `$${entry.profit_loss.toFixed(2)} (${entry.profit_loss_pct.toFixed(2)}%)` : "N/A";
// //     tableBody.innerHTML += `
// //       <tr class="border-b border-gray-200 dark:border-gray-700">
// //         <td class="p-2 text-capitalize">${entry.coin}</td>
// //         <td class="p-2">${entry.amount.toFixed(6)}</td>
// //         <td class="p-2">$${entry.entry_price.toFixed(2)}</td>
// //         <td class="p-2">${priceDisplay}</td>
// //         <td class="p-2">${valueDisplay}</td>
// //         <td class="p-2 ${entry.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}">
// //           ${profitDisplay}
// //         </td>
// //         <td class="p-2">
// //           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="removeFromPortfolio('${entry.coin}')" aria-label="Remove ${entry.coin} from portfolio">
// //             <i class="fas fa-trash"></i>
// //           </button>
// //         </td>
// //       </tr>
// //     `;
// //   });
// //   totalValue.textContent = `$${totalVal.toFixed(2)}`;
// //   totalProfitLoss.textContent = `$${totalPL.toFixed(2)}`;
// //   totalProfitLoss.className = `text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`;
// // }

// // // Render Alerts
// // function renderAlerts(alertsData, prices) {
// //   const tableBody = document.getElementById("alertsTableBody");
// //   if (!tableBody) {
// //     console.warn("Alerts table body not found");
// //     return;
// //   }
// //   tableBody.innerHTML = "";
// //   if (alertsData.length === 0) {
// //     tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-gray-600 dark:text-gray-400 p-4'>No active alerts</td></tr>";
// //     return;
// //   }
// //   alertsData.forEach(alert => {
// //     const currentPrice = prices[alert.coin.toLowerCase()]?.usd || 0;
// //     const priceDisplay = currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : "N/A";
// //     tableBody.innerHTML += `
// //       <tr class="border-b border-gray-200 dark:border-gray-700">
// //         <td class="p-2 text-capitalize">${alert.coin}</td>
// //         <td class="p-2">${alert.low ? `$${alert.low.toFixed(2)}` : "-"}</td>
// //         <td class="p-2">${alert.high ? `$${alert.high.toFixed(2)}` : "-"}</td>
// //         <td class="p-2">${priceDisplay}</td>
// //         <td class="p-2">
// //           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="deleteAlert('${alert.coin}')" aria-label="Remove alert for ${alert.coin}">
// //             <i class="fas fa-trash"></i>
// //           </button>
// //         </td>
// //       </tr>
// //     `;
// //   });
// // }

// // // Populate Comparison Form
// // function populateCompareForm(coins) {
// //   const container = document.getElementById("compareSelectCoins");
// //   if (!container) {
// //     console.warn("Compare select coins container not found");
// //     return;
// //   }
// //   container.innerHTML = "";
// //   coins.forEach(coin => {
// //     container.innerHTML += `
// //       <label class="flex items-center gap-2">
// //         <input type="checkbox" value="${coin}" class="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded focus:ring-indigo-500">
// //         <span class="text-capitalize">${coin}</span>
// //       </label>
// //     `;
// //   });
// // }

// // // Add Coin
// // async function addCoin(id, button = null) {
// //   if (button) toggleLoading(button, true);
// //   try {
// //     const coinsResponse = await fetch("/");
// //     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
// //     const coinsHtml = await coinsResponse.text();
// //     const parser = new DOMParser();
// //     const doc = parser.parseFromString(coinsHtml, "text/html");
// //     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
// //       const btn = card.querySelector("button[onclick*='showChart']");
// //       return btn ? btn.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
// //     }).filter(id => id);

// //     if (watchlistCoins.includes(id.toLowerCase())) {
// //       showToast(`${id} is already in your watchlist`, "warning");
// //       return;
// //     }

// //     const formData = new FormData();
// //     formData.append("symbol", id.toLowerCase());
// //     const response = await fetch(API.add, { method: "POST", body: formData });
// //     if (!response.ok) {
// //       const error = await response.json();
// //       throw new Error(error.error || "Failed to add coin");
// //     }
// //     const coinSymbolInput = document.getElementById("coinSymbolInput");
// //     const searchResults = document.getElementById("searchResults");
// //     if (coinSymbolInput) coinSymbolInput.value = "";
// //     if (searchResults) searchResults.classList.add("hidden");
// //     await refresh();
// //     showToast(`${id} added to watchlist`, "success");
// //   } catch (error) {
// //     console.error("Error adding coin:", error);
// //     showToast(error.message.includes("already in watchlist") ? `${id} is already in your watchlist` : `Error adding coin: ${error.message}`, "danger");
// //   } finally {
// //     if (button) toggleLoading(button, false);
// //   }
// // }

// // // Remove Coin
// // async function removeCoin(id, button = null) {
// //   if (button) toggleLoading(button, true);
// //   try {
// //     const response = await fetch(Api.remove, {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({ id: id.toLowerCase() })
// //     });
// //     if (!response.ok) throw new Error("Failed to remove coin");
// //     await refresh();
// //     showToast(`${id} removed from watchlist`, "success");
// //   } catch (error) {
// //     console.error("Error removing coin:", error);
// //     showToast("Failed to remove coin", "danger");
// //   } finally {
// //     if (button) toggleLoading(button, false);
// //   }
// // }

// // // Show Chart
// // let priceChart;
// // async function showChart(id) {
// //   const modal = document.getElementById("chartModal");
// //   const chartTitle = document.getElementById("chartTitle");
// //   const coinNotes = document.getElementById("coinNotes");
// //   const saveNotes = document.getElementById("saveNotes");
// //   if (!modal || !chartTitle || !coinNotes || !saveNotes) {
// //     console.warn("Chart modal elements not found");
// //     showToast("Unable to display chart", "danger");
// //     return;
// //   }
// //   try {
// //     modal.classList.remove("hidden");
// //     const data = await fetchWithCache(`${API.history(id.toLowerCase())}?range=all`);
// //     chartTitle.textContent = `${id} Price History`;
// //     if (priceChart) priceChart.destroy();
// //     priceChart = new Chart(document.getElementById("priceChart"), {
// //       type: "line",
// //       data: {
// //         datasets: [{
// //           label: `${id} Price (USD)`,
// //           data: data.map(d => ({ x: new Date(d.t), y: d.p })),
// //           borderColor: "#6366f1",
// //           tension: 0.1,
// //           pointRadius: 0
// //         }]
// //       },
// //       options: {
// //         responsive: true,
// //         maintainAspectRatio: false,
// //         scales: {
// //           x: { type: "time", time: { unit: "day" } },
// //           y: { beginAtZero: false }
// //         },
// //         plugins: {
// //           tooltip: {
// //             mode: "index",
// //             intersect: false
// //           },
// //           legend: { display: false }
// //         }
// //       }
// //     });

// //     const notes = await fetchWithCache(Api.notes);
// //     coinNotes.value = notes.find(n => n.coin.toLowerCase() === id.toLowerCase())?.text || "";

// //     saveNotes.onclick = async () => {
// //       toggleLoading(saveNotes, true);
// //       try {
// //         await fetch(Api.notes, {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ coin: id.toLowerCase(), text: coinNotes.value })
// //         });
// //         cache.delete(Api.notes);
// //         showToast("Note saved successfully", "success");
// //       } catch (error) {
// //         console.error("Error saving note:", error);
// //         showToast("Failed to save note", "danger");
// //       } finally {
// //         toggleLoading(saveNotes, false);
// //       }
// //     };

// //     const timeRangeContainer = document.querySelector(".flex.gap-2.mb-4");
// //     if (timeRangeContainer) {
// //       timeRangeContainer.innerHTML = `
// //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white active" data-range="24h">24h</button>
// //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="7d">7d</button>
// //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="30d">30d</button>
// //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="90d">90d</button>
// //         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="all">All</button>
// //       `;
// //       timeRangeContainer.addEventListener("click", async (e) => {
// //         const btn = e.target.closest(".time-range-btn");
// //         if (!btn) return;
// //         const range = btn.dataset.range;
// //         document.querySelectorAll(".time-range-btn").forEach(b => b.classList.remove("active"));
// //         btn.classList.add("active");
// //         try {
// //           const newData = await fetchWithCache(`${API.history(id.toLowerCase())}?range=${range}`);
// //           priceChart.data.datasets[0].data = newData.map(d => ({ x: new Date(d.t), y: d.p }));
// //           priceChart.update();
// //         } catch (error) {
// //           console.error("Error updating chart:", error);
// //           showToast("Failed to update chart", "danger");
// //         }
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Error showing chart:", error);
// //     showToast("Failed to load chart data", "danger");
// //   }
// // }

// // // Close Chart Modal
// // function setupCloseChartModal() {
// //   const closeButton = document.getElementById("closeChartModal");
// //   const modal = document.getElementById("chartModal");
// //   if (closeButton && modal) {
// //     closeButton.addEventListener("click", () => {
// //       modal.classList.add("hidden");
// //     });
// //   } else {
// //     console.warn("Chart modal close button or modal not found");
// //   }
// // }

// // // Portfolio Form Submission
// // function setupPortfolioForm() {
// //   const portfolioForm = document.getElementById("portfolioForm");
// //   if (!portfolioForm) {
// //     console.warn("Portfolio form not found");
// //     return;
// //   }
// //   portfolioForm.addEventListener("submit", async e => {
// //     e.preventDefault();
// //     const button = e.submitter;
// //     toggleLoading(button, true);
// //     try {
// //       const coin = document.getElementById("portfolioCoin")?.value.toLowerCase();
// //       const amount = parseFloat(document.getElementById("portfolioAmount")?.value || 0);
// //       const price = parseFloat(document.getElementById("portfolioPrice")?.value || 0);
// //       if (!coin) {
// //         showToast("Please select a coin", "warning");
// //         return;
// //       }
// //       if (amount <= 0) {
// //         showToast("Amount must be greater than 0", "warning");
// //         return;
// //       }
// //       if (price < 0) {
// //         showToast("Purchase price cannot be negative", "warning");
// //         return;
// //       }
// //       const response = await fetch(Api.portfolio, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ coin, amount, price })
// //       });
// //       if (!response.ok) throw new Error("Failed to add to portfolio");
// //       portfolioForm.reset();
// //       cache.delete(Api.portfolio);
// //       await refresh();
// //       showToast("Portfolio updated successfully", "success");
// //     } catch (error) {
// //       console.error("Error saving portfolio:", error);
// //       showToast("Failed to update portfolio", "danger");
// //     } finally {
// //       toggleLoading(button, false);
// //     }
// //   });
// // }

// // // Remove from Portfolio
// // async function removeFromPortfolio(coinId, button) {
// //   toggleLoading(button, true);
// //   try {
// //     const response = await fetch(`${API.portfolio}?coin=${coinId.toLowerCase()}`, { method: "DELETE" });
// //     if (!response.ok) throw new Error("Failed to remove from portfolio");
// //     cache.delete(Api.portfolio);
// //     await refresh();
// //     showToast("Removed from portfolio", "success");
// //   } catch (error) {
// //     console.error("Error removing from portfolio:", error);
// //     showToast("Failed to remove from portfolio", "danger");
// //   } finally {
// //     toggleLoading(button, false);
// //   }
// // }

// // // Alerts Form Submission
// // function setupAlertForm() {
// //   const alertForm = document.getElementById("alertForm");
// //   if (!alertForm) {
// //     console.warn("Alert form not found");
// //     return;
// //   }
// //   alertForm.addEventListener("submit", async e => {
// //     e.preventDefault();
// //     const button = e.submitter;
// //     toggleLoading(button, true);
// //     try {
// //       const coin = document.getElementById("alertCoin")?.value.toLowerCase();
// //       const high = parseFloat(document.getElementById("alertHigh")?.value || 0);
// //       const low = parseFloat(document.getElementById("alertLow")?.value || 0);
// //       if (!coin) {
// //         showToast("Please select a coin", "warning");
// //         return;
// //       }
// //       if (high <= 0 && low <= 0) {
// //         showToast("At least one price threshold must be set", "warning");
// //         return;
// //       }
// //       if (high < 0 || low < 0) {
// //         showToast("Price thresholds cannot be negative", "warning");
// //         return;
// //       }
// //       const response = await fetch(Api.alerts, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ coin, high: high || null, low: low || null })
// //       });
// //       if (!response.ok) throw new Error("Failed to set alert");
// //       alertForm.reset();
// //       cache.delete(Api.alerts);
// //       await refresh();
// //       showToast("Alert set successfully", "success");
// //     } catch (error) {
// //       console.error("Error setting alert:", error);
// //       showToast("Failed to set alert", "danger");
// //     } finally {
// //       toggleLoading(button, false);
// //     }
// //   });
// // }

// // // Delete Alert
// // async function deleteAlert(coin, button) {
// //   toggleLoading(button, true);
// //   try {
// //     const response = await fetch(`${API.alerts}?coin=${coin.toLowerCase()}`, { method: "DELETE" });
// //     if (!response.ok) throw new Error("Failed to remove alert");
// //     cache.delete(Api.alerts);
// //     await refresh();
// //     showToast("Alert removed successfully", "success");
// //   } catch (error) {
// //     console.error("Error removing alert:", error);
// //     showToast("Failed to remove alert", "danger");
// //   } finally {
// //     toggleLoading(button, false);
// //   }
// // }

// // // Compare Form Submission
// // function setupCompareForm() {
// //   const compareForm = document.getElementById("compareForm");
// //   if (!compareForm) {
// //     console.warn("Compare form not found");
// //     return;
// //   }
// //   compareForm.addEventListener("submit", async e => {
// //     e.preventDefault();
// //     const button = e.submitter;
// //     toggleLoading(button, true);
// //     try {
// //       const selected = Array.from(document.querySelectorAll("#compareSelectCoins input:checked")).map(input => input.value.toLowerCase());
// //       if (selected.length < 2 || selected.length > 5) {
// //         showToast("Please select 2-5 coins to compare", "warning");
// //         return;
// //       }
// //       const response = await fetch(Api.compare, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ coins: selected })
// //       });
// //       if (!response.ok) throw new Error("Failed to create comparison");
// //       const { id } = await response.json();
// //       cache.delete(Api.compare);
// //       await showComparison(id);
// //     } catch (error) {
// //       console.error("Error creating comparison:", error);
// //       showToast("Failed to create comparison", "danger");
// //     } finally {
// //       toggleLoading(button, false);
// //     }
// //   });
// // }

// // // Show Comparison
// // let compareChart;
// // async function showComparison(id) {
// //   const compareChartCanvas = document.getElementById("compareChart");
// //   if (!compareChartCanvas) {
// //     console.warn("Compare chart canvas not found");
// //     showToast("Unable to display comparison", "danger");
// //     return;
// //   }
// //   try {
// //     const data = await fetchWithCache(`${API.compare}?id=${id}`);
// //     if (compareChart) compareChart.destroy();
// //     compareChart = new Chart(compareChartCanvas, {
// //       type: "line",
// //       data: {
// //         datasets: Object.keys(data).map(coin => ({
// //           label: coin,
// //           data: data[coin].map(d => ({ x: new Date(d.date), y: d.price })),
// //           borderColor: getRandomColor(),
// //           tension: 0.1,
// //           pointRadius: 0
// //         }))
// //       },
// //       options: {
// //         responsive: true,
// //         maintainAspectRatio: false,
// //         scales: {
// //           x: { type: "time", time: { unit: "day" } },
// //           y: { beginAtZero: false }
// //         },
// //         plugins: {
// //           tooltip: {
// //             mode: "index",
// //             intersect: false
// //           }
// //         }
// //       }
// //     });

// //     const recentList = document.getElementById("recentComparisons");
// //     if (recentList) {
// //       const comparisons = await fetchWithCache(Api.compare);
// //       recentList.innerHTML = "";
// //       comparisons.forEach(comp => {
// //         recentList.innerHTML += `
// //           <button class="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" 
// //                   onclick="showComparison('${comp.id}')" aria-label="View comparison: ${comp.coins.join(' vs ')}">
// //             ${comp.coins.join(" vs ")} - ${new Date(comp.created_at).toLocaleString()}
// //           </button>
// //         `;
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Error showing comparison:", error);
// //     showToast("Failed to load comparison", "danger");
// //   }
// // }

// // function getRandomColor() {
// //   return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
// // }

// // // Search Functionality
// // const searchHandler = debounce(async e => {
// //   const query = e.target.value.trim().toLowerCase();
// //   const resultsDiv = document.getElementById("searchResults");
// //   const resultsList = document.getElementById("searchResultsList");
// //   if (!resultsDiv || !resultsList) {
// //     console.warn("Search results elements not found");
// //     return;
// //   }
// //   if (query.length < 2) {
// //     resultsDiv.classList.add("hidden");
// //     return;
// //   }
// //   try {
// //     const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(query)}`);
// //     resultsList.innerHTML = "";
// //     if (results.length === 0) {
// //       resultsList.innerHTML = "<div class='p-3 text-gray-600 dark:text-gray-400'>No results found</div>";
// //     } else {
// //       results.forEach(coin => {
// //         const item = document.createElement("button");
// //         item.className = "w-full text-left p-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-capitalize";
// //         item.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
// //         item.onclick = () => addCoin(coin.id.toLowerCase(), item);
// //         resultsList.appendChild(item);
// //       });
// //     }
// //     resultsDiv.classList.remove("hidden");
// //   } catch (error) {
// //     console.error("Error fetching search results:", error);
// //     resultsList.innerHTML = "<div class='p-3 text-red-500'>Error fetching results</div>";
// //     resultsDiv.classList.remove("hidden");
// //   }
// // }, 300);

// // // Setup Search
// // function setupSearch() {
// //   const searchInput = document.getElementById("searchInput");
// //   if (searchInput) {
// //     searchInput.addEventListener("input", searchHandler);
// //   } else {
// //     console.warn("Search input not found");
// //   }
// //   document.addEventListener("click", e => {
// //     const searchResults = document.getElementById("searchResults");
// //     if (searchResults && !e.target.closest("#searchInput") && !e.target.closest("#searchResults")) {
// //       searchResults.classList.add("hidden");
// //     }
// //   });
// // }

// // // Add Coin Form Submission
// // function setupAddForm() {
// //   const addForm = document.getElementById("addForm");
// //   if (!addForm) {
// //     console.warn("Add form not found");
// //     return;
// //   }
// //   addForm.addEventListener("submit", async e => {
// //     e.preventDefault();
// //     const button = e.submitter;
// //     toggleLoading(button, true);
// //     const symbol = document.getElementById("coinSymbolInput")?.value.trim().toLowerCase();
// //     try {
// //       const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(symbol)}`);
// //       const coin = results.find(c => c.id.toLowerCase() === symbol || c.symbol.toLowerCase() === symbol);
// //       if (!coin) {
// //         showToast(`Coin "${symbol}" not found`, "warning");
// //         return;
// //       }
// //       await addCoin(coin.id.toLowerCase(), button);
// //     } catch (error) {
// //       console.error("Error validating coin:", error);
// //       showToast(`Error validating coin: ${error.message}`, "danger");
// //     } finally {
// //       toggleLoading(button, false);
// //     }
// //   });
// // }

// // // Populate Portfolio and Alert Coin Selects
// // async function populateSelects() {
// //   try {
// //     const coins = await fetchWithCache(`${API.search}?q=`);
// //     const portfolioSelect = document.getElementById("portfolioCoin");
// //     const alertSelect = document.getElementById("alertCoin");
// //     if (portfolioSelect) {
// //       portfolioSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
// //       coins.forEach(coin => {
// //         portfolioSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
// //       });
// //     }
// //     if (alertSelect) {
// //       alertSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
// //       coins.forEach(coin => {
// //         alertSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
// //       });
// //     }
// //     if (!portfolioSelect || !alertSelect) {
// //       console.warn("Portfolio or alert select not found");
// //     }
// //   } catch (error) {
// //     console.error("Error populating selects:", error);
// //     showToast("Failed to load coin list", "danger");
// //   }
// // }

// // // Initialize
// // function initialize() {
// //   setupThemeToggle();
// //   setupSidebarToggle();
// //   setupTabNavigation();
// //   setupCloseChartModal();
// //   setupPortfolioForm();
// //   setupAlertForm();
// //   setupCompareForm();
// //   setupSearch();
// //   setupAddForm();
// //   refresh();
// //   populateSelects();
// //   setInterval(refresh, 60000);
// // }

// // // Ensure DOM is loaded
// // document.addEventListener("DOMContentLoaded", initialize);






// const API = {
//   prices: "/api/prices",
//   history: id => `/api/history/${id}`,
//   add: "/add",
//   remove: "/remove",
//   alerts: "/api/alerts",
//   notes: "/api/notes",
//   portfolio: "/api/portfolio",
//   compare: "/api/compare",
//   search: "/api/search",
//   summary: "/api/summary",
//   image: id => `/api/image/${id}`
// };

// // Cache for API responses
// const cache = new Map();
// const CACHE_DURATION = 60000; // 1 minute

// // Debounce utility
// function debounce(func, wait) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

// // Theme Toggle
// function setupThemeToggle() {
//   const themeToggle = document.getElementById("themeToggle");
//   if (themeToggle) {
//     themeToggle.addEventListener("change", e => {
//       document.documentElement.classList.toggle("dark", e.target.checked);
//       localStorage.setItem("theme", e.target.checked ? "dark" : "light");
//     });
//     if (localStorage.getItem("theme") === "dark") {
//       document.documentElement.classList.add("dark");
//       themeToggle.checked = true;
//     }
//   } else {
//     console.warn("Theme toggle element not found");
//   }
// }

// // Sidebar Toggle
// function setupSidebarToggle() {
//   const menuToggle = document.getElementById("menuToggle");
//   const sidebar = document.getElementById("sidebar");
//   if (menuToggle && sidebar) {
//     menuToggle.addEventListener("click", () => {
//       sidebar.classList.toggle("-translate-x-full");
//     });
//   } else {
//     console.warn("Menu toggle or sidebar element not found");
//   }
// }

// // Tab Navigation
// function setupTabNavigation() {
//   const navLinks = document.querySelectorAll(".nav-link");
//   if (navLinks.length > 0) {
//     navLinks.forEach(link => {
//       link.addEventListener("click", e => {
//         e.preventDefault();
//         const tabId = link.dataset.tab;
//         const tabPane = document.getElementById(tabId);
//         if (tabPane) {
//           document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.add("hidden"));
//           tabPane.classList.remove("hidden");
//           document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("bg-indigo-100", "dark:bg-indigo-900"));
//           link.classList.add("bg-indigo-100", "dark:bg-indigo-900");
//           const sidebar = document.getElementById("sidebar");
//           if (sidebar) sidebar.classList.add("-translate-x-full");
//         } else {
//           console.warn(`Tab pane with ID ${tabId} not found`);
//         }
//       });
//     });
//   } else {
//     console.warn("No nav links found");
//   }
// }

// // Fetch with Cache
// async function fetchWithCache(url, cacheKey = url) {
//   const now = Date.now();
//   if (cache.has(cacheKey) && now - cache.get(cacheKey).timestamp < CACHE_DURATION) {
//     console.log(`Using cached data for ${cacheKey}`);
//     return cache.get(cacheKey).data;
//   }
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error(`API failed: ${response.status} ${response.statusText}`);
//     const data = await response.json();
//     cache.set(cacheKey, { data, timestamp: now });
//     console.log(`Fetched and cached data for ${cacheKey}`);
//     return data;
//   } catch (error) {
//     console.error(`Error fetching ${url}:`, error);
//     cache.delete(cacheKey); // Clear cache on error to prevent stale data
//     throw error;
//   }
// }

// // Show Toast
// function showToast(message, type = "info") {
//   const toastContainer = document.getElementById("toastContainer");
//   if (!toastContainer) {
//     console.warn("Toast container not found");
//     return;
//   }
//   const toast = document.createElement("div");
//   const bgColor = {
//     info: "bg-indigo-600",
//     success: "bg-green-600",
//     warning: "bg-yellow-600",
//     danger: "bg-red-600"
//   }[type] || "bg-indigo-600";
//   toast.className = `flex items-center gap-2 p-4 rounded-lg text-white ${bgColor} shadow-lg animate-fadeIn`;
//   toast.innerHTML = `
//     ${message}
//     <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
//       <i class="fas fa-times"></i>
//     </button>
//   `;
//   toastContainer.appendChild(toast);
//   setTimeout(() => toast.remove(), 5000);
// }

// // Toggle Loading State
// function toggleLoading(button, isLoading) {
//   if (!button) return;
//   const loadingSpan = button.querySelector(".loading");
//   if (loadingSpan) loadingSpan.classList.toggle("hidden", !isLoading);
//   button.disabled = isLoading;
// }

// // Fetch Summary
// async function fetchSummary() {
//   try {
//     const summary = await fetchWithCache(API.summary);
//     const summaryBadge = document.getElementById("summaryBadge");
//     if (summaryBadge) {
//       // Handle missing or malformed summary data
//       const portfolioValue = summary.portfolio_value !== undefined ? summary.portfolio_value : 0.0;
//       const profitLoss = summary.portfolio_profit_loss !== undefined ? summary.portfolio_profit_loss : 0.0;
//       summaryBadge.textContent = `Portfolio: $${portfolioValue.toFixed(2)} | P/L: $${profitLoss.toFixed(2)}`;
//       summaryBadge.className = `text-sm font-semibold ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`;
//     } else {
//       console.warn("Summary badge element not found");
//       showToast("Portfolio summary unavailable", "warning");
//     }
//   } catch (error) {
//     console.error("Error fetching summary:", error);
//     const summaryBadge = document.getElementById("summaryBadge");
//     if (summaryBadge) {
//       summaryBadge.textContent = "Error fetching summary";
//       summaryBadge.className = "text-sm font-semibold text-red-500";
//     }
//     showToast("Failed to load portfolio summary", "danger");
//   }
// }

// // Refresh Data
// async function refresh() {
//   try {
//     await fetchSummary();

//     const coinsResponse = await fetch("/");
//     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
//     const coinsHtml = await coinsResponse.text();
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(coinsHtml, "text/html");

//     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
//       const button = card.querySelector("button[onclick*='showChart']");
//       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
//     }).filter(id => id);

//     const trendingCoins = Array.from(doc.querySelectorAll("#trendingCoins .card")).map(card => {
//       const button = card.querySelector("button[onclick*='addCoin']");
//       return button ? button.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
//     }).filter(id => id);

//     const allCoinIds = [...new Set([...watchlistCoins, ...trendingCoins])];
//     console.log("Fetching prices for coins:", allCoinIds);
//     const prices = await fetchWithCache(API.prices);
//     console.log("Received prices:", prices);

//     const portfolioData = await fetchWithCache(Api.portfolio);
//     const alertsData = await fetchWithCache(Api.alerts);
//     const notesData = await fetchWithCache(Api.notes);

//     updateWatchlist(watchlistCoins, prices);
//     updateTrending(trendingCoins, prices, watchlistCoins);
//     renderPortfolio(portfolioData);
//     renderAlerts(alertsData, prices);
//     populateCompareForm(watchlistCoins);
//   } catch (error) {
//     console.error("Error refreshing data:", error);
//     showToast(`Failed to refresh data: ${error.message}`, "danger");
//   }
// }

// // Update Watchlist
// async function updateWatchlist(coins, prices) {
//   const grid = document.getElementById("coinGrid");
//   if (!grid) {
//     console.warn("Coin grid element not found");
//     return;
//   }
//   if (coins.length === 0) {
//     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No coins in watchlist</p>";
//     return;
//   }
//   const coinList = await fetchWithCache(`${API.search}?q=`);
//   grid.innerHTML = "";
//   coins.forEach(id => {
//     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
//     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
//     console.log(`Rendering watchlist coin ${id}:`, priceData);
//     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
//     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
//     grid.innerHTML += `
//       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
//         <div class="flex items-center gap-2 mb-2">
//           <img src="${API.image(id)}" class="w-8 h-8 lazy-load" onerror="this.src='https://placehold.co/32x32'" alt="${coinInfo.name}" loading="lazy">
//           <h3 class="text-lg font-semibold text-capitalize">${coinInfo.name}</h3>
//         </div>
//         <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${priceDisplay}</p>
//         <p class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
//           24h: ${changeDisplay}
//         </p>
//         <p class="text-gray-600 dark:text-gray-400">${coinInfo.symbol.toUpperCase()}</p>
//         <div class="flex gap-2 mt-2">
//           <button class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors" onclick="showChart('${id}')" aria-label="View chart for ${coinInfo.name}">
//             <i class="fas fa-chart-line"></i> Chart
//           </button>
//           <button class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors" onclick="removeCoin('${id}')" aria-label="Remove ${coinInfo.name} from watchlist">
//             <i class="fas fa-trash"></i> Remove
//           </button>
//         </div>
//       </div>
//     `;
//   });
// }

// // Update Trending Coins
// async function updateTrending(coins, prices, watchlistCoins) {
//   const grid = document.getElementById("trendingCoins");
//   const ticker = document.getElementById("priceTicker");
//   if (!grid || !ticker) {
//     console.warn("Trending coins grid or ticker element not found");
//     return;
//   }
//   if (coins.length === 0) {
//     grid.innerHTML = "<p class='text-center text-gray-600 dark:text-gray-400'>No trending coins available</p>";
//     ticker.innerHTML = "<p class='text-gray-600 dark:text-gray-400'>No trending coins available</p>";
//     return;
//   }
//   const coinList = await fetchWithCache(`${API.search}?q=`);
//   grid.innerHTML = "";
//   ticker.innerHTML = "";
//   coins.forEach(id => {
//     const coinInfo = coinList.find(c => c.id.toLowerCase() === id) || { name: id, symbol: id };
//     const priceData = prices[id] || { usd: 0, usd_24h_change: 0 };
//     console.log(`Rendering trending coin ${id}:`, priceData);
//     const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
//     const changeDisplay = priceData.usd_24h_change !== 0 ? `${priceData.usd_24h_change.toFixed(2)}%` : "N/A";
//     const isInWatchlist = watchlistCoins.includes(id);
//     grid.innerHTML += `
//       <div class="card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300">
//         <img src="${API.image(id)}" class="w-12 h-12 mx-auto mb-2 lazy-load" onerror="this.src='https://placehold.co/48x48'" alt="${coinInfo.name}" loading="lazy">
//         <h3 class="text-lg font-semibold text-center text-capitalize">${coinInfo.name}</h3>
//         <p class="text-center text-gray-600 dark:text-gray-400">${priceDisplay}</p>
//         <p class="text-center ${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
//           ${changeDisplay}
//         </p>
//         <button class="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors ${isInWatchlist ? 'opacity-50 cursor-not-allowed' : ''}" 
//                 onclick="addCoin('${id}')" ${isInWatchlist ? 'disabled' : ''} aria-label="${isInWatchlist ? 'Already in watchlist' : 'Add ' + coinInfo.name + ' to watchlist'}">
//           <i class="fas fa-plus-circle"></i> ${isInWatchlist ? 'Watched' : 'Watch'}
//         </button>
//       </div>
//     `;
//     ticker.innerHTML += `
//       <span class="inline-block mx-4">
//         ${coinInfo.name}: ${priceDisplay}
//         <span class="${priceData.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}">
//           ${changeDisplay}
//         </span>
//       </span>
//     `;
//   });
// }

// // Render Portfolio
// function renderPortfolio(portfolioData) {
//   const tableBody = document.getElementById("portfolioTableBody");
//   const totalValue = document.getElementById("portfolioTotalValue");
//   const totalProfitLoss = document.getElementById("portfolioProfitLoss");
//   if (!tableBody || !totalValue || !totalProfitLoss) {
//     console.warn("Portfolio table elements not found");
//     return;
//   }
//   tableBody.innerHTML = "";
//   if (portfolioData.length === 0) {
//     tableBody.innerHTML = "<tr><td colspan='7' class='text-center text-gray-600 dark:text-gray-400 p-4'>No coins in portfolio</td></tr>";
//     totalValue.textContent = "$0.00";
//     totalProfitLoss.textContent = "$0.00";
//     return;
//   }
//   let totalVal = 0, totalPL = 0;
//   portfolioData.forEach(entry => {
//     totalVal += entry.current_value || 0;
//     totalPL += entry.profit_loss || 0;
//     const priceDisplay = entry.current_price > 0 ? `$${entry.current_price.toFixed(2)}` : "N/A";
//     const valueDisplay = entry.current_value > 0 ? `$${entry.current_value.toFixed(2)}` : "N/A";
//     const profitDisplay = entry.profit_loss !== null ? `$${entry.profit_loss.toFixed(2)} (${entry.profit_loss_pct.toFixed(2)}%)` : "N/A";
//     tableBody.innerHTML += `
//       <tr class="border-b border-gray-200 dark:border-gray-700">
//         <td class="p-2 text-capitalize">${entry.coin}</td>
//         <td class="p-2">${entry.amount.toFixed(6)}</td>
//         <td class="p-2">$${entry.entry_price.toFixed(2)}</td>
//         <td class="p-2">${priceDisplay}</td>
//         <td class="p-2">${valueDisplay}</td>
//         <td class="p-2 ${entry.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}">
//           ${profitDisplay}
//         </td>
//         <td class="p-2">
//           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="removeFromPortfolio('${entry.coin}')" aria-label="Remove ${entry.coin} from portfolio">
//             <i class="fas fa-trash"></i>
//           </button>
//         </td>
//       </tr>
//     `;
//   });
//   totalValue.textContent = `$${totalVal.toFixed(2)}`;
//   totalProfitLoss.textContent = `$${totalPL.toFixed(2)}`;
//   totalProfitLoss.className = `text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`;
// }

// // Render Alerts
// function renderAlerts(alertsData, prices) {
//   const tableBody = document.getElementById("alertsTableBody");
//   if (!tableBody) {
//     console.warn("Alerts table body not found");
//     return;
//   }
//   tableBody.innerHTML = "";
//   if (alertsData.length === 0) {
//     tableBody.innerHTML = "<tr><td colspan='5' class='text-center text-gray-600 dark:text-gray-400 p-4'>No active alerts</td></tr>";
//     return;
//   }
//   alertsData.forEach(alert => {
//     const currentPrice = prices[alert.coin.toLowerCase()]?.usd || 0;
//     const priceDisplay = currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : "N/A";
//     tableBody.innerHTML += `
//       <tr class="border-b border-gray-200 dark:border-gray-700">
//         <td class="p-2 text-capitalize">${alert.coin}</td>
//         <td class="p-2">${alert.low ? `$${alert.low.toFixed(2)}` : "-"}</td>
//         <td class="p-2">${alert.high ? `$${alert.high.toFixed(2)}` : "-"}</td>
//         <td class="p-2">${priceDisplay}</td>
//         <td class="p-2">
//           <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="deleteAlert('${alert.coin}')" aria-label="Remove alert for ${alert.coin}">
//             <i class="fas fa-trash"></i>
//           </button>
//         </td>
//       </tr>
//     `;
//   });
// }

// // Populate Comparison Form
// function populateCompareForm(coins) {
//   const container = document.getElementById("compareSelectCoins");
//   if (!container) {
//     console.warn("Compare select coins container not found");
//     return;
//   }
//   container.innerHTML = "";
//   coins.forEach(coin => {
//     container.innerHTML += `
//       <label class="flex items-center gap-2">
//         <input type="checkbox" value="${coin}" class="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded focus:ring-indigo-500">
//         <span class="text-capitalize">${coin}</span>
//       </label>
//     `;
//   });
// }

// // Add Coin
// async function addCoin(id, button = null) {
//   if (button) toggleLoading(button, true);
//   try {
//     const coinsResponse = await fetch("/");
//     if (!coinsResponse.ok) throw new Error(`Index API failed: ${coinsResponse.status}`);
//     const coinsHtml = await coinsResponse.text();
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(coinsHtml, "text/html");
//     const watchlistCoins = Array.from(doc.querySelectorAll("#coinGrid .card")).map(card => {
//       const btn = card.querySelector("button[onclick*='showChart']");
//       return btn ? btn.getAttribute("onclick").match(/'([^']+)'/)[1].toLowerCase() : null;
//     }).filter(id => id);

//     if (watchlistCoins.includes(id.toLowerCase())) {
//       showToast(`${id} is already in your watchlist`, "warning");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("symbol", id.toLowerCase());
//     const response = await fetch(API.add, { method: "POST", body: formData });
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.error || "Failed to add coin");
//     }
//     const coinSymbolInput = document.getElementById("coinSymbolInput");
//     const searchResults = document.getElementById("searchResults");
//     if (coinSymbolInput) coinSymbolInput.value = "";
//     if (searchResults) searchResults.classList.add("hidden");
//     await refresh();
//     showToast(`${id} added to watchlist`, "success");
//   } catch (error) {
//     console.error("Error adding coin:", error);
//     showToast(error.message.includes("already in watchlist") ? `${id} is already in your watchlist` : `Error adding coin: ${error.message}`, "danger");
//   } finally {
//     if (button) toggleLoading(button, false);
//   }
// }

// // Remove Coin
// async function removeCoin(id, button = null) {
//   if (button) toggleLoading(button, true);
//   try {
//     const response = await fetch(Api.remove, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: id.toLowerCase() })
//     });
//     if (!response.ok) throw new Error("Failed to remove coin");
//     await refresh();
//     showToast(`${id} removed from watchlist`, "success");
//   } catch (error) {
//     console.error("Error removing coin:", error);
//     showToast("Failed to remove coin", "danger");
//   } finally {
//     if (button) toggleLoading(button, false);
//   }
// }

// // Show Chart
// let priceChart;
// async function showChart(id) {
//   const modal = document.getElementById("chartModal");
//   const chartTitle = document.getElementById("chartTitle");
//   const coinNotes = document.getElementById("coinNotes");
//   const saveNotes = document.getElementById("saveNotes");
//   if (!modal || !chartTitle || !coinNotes || !saveNotes) {
//     console.warn("Chart modal elements not found");
//     showToast("Unable to display chart", "danger");
//     return;
//   }
//   try {
//     modal.classList.remove("hidden");
//     const data = await fetchWithCache(`${API.history(id.toLowerCase())}?range=all`);
//     chartTitle.textContent = `${id} Price History`;
//     if (priceChart) priceChart.destroy();
//     priceChart = new Chart(document.getElementById("priceChart"), {
//       type: "line",
//       data: {
//         datasets: [{
//           label: `${id} Price (USD)`,
//           data: data.map(d => ({ x: new Date(d.t), y: d.p })),
//           borderColor: "#6366f1",
//           tension: 0.1,
//           pointRadius: 0
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           x: { type: "time", time: { unit: "day" } },
//           y: { beginAtZero: false }
//         },
//         plugins: {
//           tooltip: {
//             mode: "index",
//             intersect: false
//           },
//           legend: { display: false }
//         }
//       }
//     });

//     const notes = await fetchWithCache(Api.notes);
//     coinNotes.value = notes.find(n => n.coin.toLowerCase() === id.toLowerCase())?.text || "";

//     saveNotes.onclick = async () => {
//       toggleLoading(saveNotes, true);
//       try {
//         await fetch(Api.notes, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ coin: id.toLowerCase(), text: coinNotes.value })
//         });
//         cache.delete(Api.notes);
//         showToast("Note saved successfully", "success");
//       } catch (error) {
//         console.error("Error saving note:", error);
//         showToast("Failed to save note", "danger");
//       } finally {
//         toggleLoading(saveNotes, false);
//       }
//     };

//     const timeRangeContainer = document.querySelector(".flex.gap-2.mb-4");
//     if (timeRangeContainer) {
//       timeRangeContainer.innerHTML = `
//         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white active" data-range="24h">24h</button>
//         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="7d">7d</button>
//         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="30d">30d</button>
//         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="90d">90d</button>
//         <button class="time-range-btn px-3 py-1 rounded-lg bg-indigo-600 text-white" data-range="all">All</button>
//       `;
//       timeRangeContainer.addEventListener("click", async (e) => {
//         const btn = e.target.closest(".time-range-btn");
//         if (!btn) return;
//         const range = btn.dataset.range;
//         document.querySelectorAll(".time-range-btn").forEach(b => b.classList.remove("active"));
//         btn.classList.add("active");
//         try {
//           const newData = await fetchWithCache(`${API.history(id.toLowerCase())}?range=${range}`);
//           priceChart.data.datasets[0].data = newData.map(d => ({ x: new Date(d.t), y: d.p }));
//           priceChart.update();
//         } catch (error) {
//           console.error("Error updating chart:", error);
//           showToast("Failed to update chart", "danger");
//         }
//       });
//     }
//   } catch (error) {
//     console.error("Error showing chart:", error);
//     showToast("Failed to load chart data", "danger");
//   }
// }

// // Close Chart Modal
// function setupCloseChartModal() {
//   const closeButton = document.getElementById("closeChartModal");
//   const modal = document.getElementById("chartModal");
//   if (closeButton && modal) {
//     closeButton.addEventListener("click", () => {
//       modal.classList.add("hidden");
//     });
//   } else {
//     console.warn("Chart modal close button or modal not found");
//   }
// }

// // Portfolio Form Submission
// function setupPortfolioForm() {
//   const portfolioForm = document.getElementById("portfolioForm");
//   if (!portfolioForm) {
//     console.warn("Portfolio form not found");
//     return;
//   }
//   portfolioForm.addEventListener("submit", async e => {
//     e.preventDefault();
//     const button = e.submitter;
//     toggleLoading(button, true);
//     try {
//       const coin = document.getElementById("portfolioCoin")?.value.toLowerCase();
//       const amount = parseFloat(document.getElementById("portfolioAmount")?.value || 0);
//       const price = parseFloat(document.getElementById("portfolioPrice")?.value || 0);
//       if (!coin) {
//         showToast("Please select a coin", "warning");
//         return;
//       }
//       if (amount <= 0) {
//         showToast("Amount must be greater than 0", "warning");
//         return;
//       }
//       if (price < 0) {
//         showToast("Purchase price cannot be negative", "warning");
//         return;
//       }
//       const response = await fetch(Api.portfolio, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ coin, amount, price })
//       });
//       if (!response.ok) throw new Error("Failed to add to portfolio");
//       portfolioForm.reset();
//       cache.delete(Api.portfolio);
//       await refresh();
//       showToast("Portfolio updated successfully", "success");
//     } catch (error) {
//       console.error("Error saving portfolio:", error);
//       showToast("Failed to update portfolio", "danger");
//     } finally {
//       toggleLoading(button, false);
//     }
//   });
// }

// // Remove from Portfolio
// async function removeFromPortfolio(coinId, button) {
//   toggleLoading(button, true);
//   try {
//     const response = await fetch(`${API.portfolio}?coin=${coinId.toLowerCase()}`, { method: "DELETE" });
//     if (!response.ok) throw new Error("Failed to remove from portfolio");
//     cache.delete(Api.portfolio);
//     await refresh();
//     showToast("Removed from portfolio", "success");
//   } catch (error) {
//     console.error("Error removing from portfolio:", error);
//     showToast("Failed to remove from portfolio", "danger");
//   } finally {
//     toggleLoading(button, false);
//   }
// }

// // Alerts Form Submission
// function setupAlertForm() {
//   const alertForm = document.getElementById("alertForm");
//   if (!alertForm) {
//     console.warn("Alert form not found");
//     return;
//   }
//   alertForm.addEventListener("submit", async e => {
//     e.preventDefault();
//     const button = e.submitter;
//     toggleLoading(button, true);
//     try {
//       const coin = document.getElementById("alertCoin")?.value.toLowerCase();
//       const high = parseFloat(document.getElementById("alertHigh")?.value || 0);
//       const low = parseFloat(document.getElementById("alertLow")?.value || 0);
//       if (!coin) {
//         showToast("Please select a coin", "warning");
//         return;
//       }
//       if (high <= 0 && low <= 0) {
//         showToast("At least one price threshold must be set", "warning");
//         return;
//       }
//       if (high < 0 || low < 0) {
//         showToast("Price thresholds cannot be negative", "warning");
//         return;
//       }
//       const response = await fetch(Api.alerts, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ coin, high: high || null, low: low || null })
//       });
//       if (!response.ok) throw new Error("Failed to set alert");
//       alertForm.reset();
//       cache.delete(Api.alerts);
//       await refresh();
//       showToast("Alert set successfully", "success");
//     } catch (error) {
//       console.error("Error setting alert:", error);
//       showToast("Failed to set alert", "danger");
//     } finally {
//       toggleLoading(button, false);
//     }
//   });
// }

// // Delete Alert
// async function deleteAlert(coin, button) {
//   toggleLoading(button, true);
//   try {
//     const response = await fetch(`${API.alerts}?coin=${coin.toLowerCase()}`, { method: "DELETE" });
//     if (!response.ok) throw new Error("Failed to remove alert");
//     cache.delete(Api.alerts);
//     await refresh();
//     showToast("Alert removed successfully", "success");
//   } catch (error) {
//     console.error("Error removing alert:", error);
//     showToast("Failed to remove alert", "danger");
//   } finally {
//     toggleLoading(button, false);
//   }
// }

// // Compare Form Submission
// function setupCompareForm() {
//   const compareForm = document.getElementById("compareForm");
//   if (!compareForm) {
//     console.warn("Compare form not found");
//     return;
//   }
//   compareForm.addEventListener("submit", async e => {
//     e.preventDefault();
//     const button = e.submitter;
//     toggleLoading(button, true);
//     try {
//       const selected = Array.from(document.querySelectorAll("#compareSelectCoins input:checked")).map(input => input.value.toLowerCase());
//       if (selected.length < 2 || selected.length > 5) {
//         showToast("Please select 2-5 coins to compare", "warning");
//         return;
//       }
//       const response = await fetch(Api.compare, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ coins: selected })
//       });
//       if (!response.ok) throw new Error("Failed to create comparison");
//       const { id } = await response.json();
//       cache.delete(Api.compare);
//       await showComparison(id);
//     } catch (error) {
//       console.error("Error creating comparison:", error);
//       showToast("Failed to create comparison", "danger");
//     } finally {
//       toggleLoading(button, false);
//     }
//   });
// }

// // Show Comparison
// let compareChart;
// async function showComparison(id) {
//   const compareChartCanvas = document.getElementById("compareChart");
//   if (!compareChartCanvas) {
//     console.warn("Compare chart canvas not found");
//     showToast("Unable to display comparison", "danger");
//     return;
//   }
//   try {
//     const data = await fetchWithCache(`${API.compare}?id=${id}`);
//     if (compareChart) compareChart.destroy();
//     compareChart = new Chart(compareChartCanvas, {
//       type: "line",
//       data: {
//         datasets: Object.keys(data).map(coin => ({
//           label: coin,
//           data: data[coin].map(d => ({ x: new Date(d.date), y: d.price })),
//           borderColor: getRandomColor(),
//           tension: 0.1,
//           pointRadius: 0
//         }))
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//           x: { type: "time", time: { unit: "day" } },
//           y: { beginAtZero: false }
//         },
//         plugins: {
//           tooltip: {
//             mode: "index",
//             intersect: false
//           }
//         }
//       }
//     });

//     const recentList = document.getElementById("recentComparisons");
//     if (recentList) {
//       const comparisons = await fetchWithCache(Api.compare);
//       recentList.innerHTML = "";
//       comparisons.forEach(comp => {
//         recentList.innerHTML += `
//           <button class="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" 
//                   onclick="showComparison('${comp.id}')" aria-label="View comparison: ${comp.coins.join(' vs ')}">
//             ${comp.coins.join(" vs ")} - ${new Date(comp.created_at).toLocaleString()}
//           </button>
//         `;
//       });
//     }
//   } catch (error) {
//     console.error("Error showing comparison:", error);
//     showToast("Failed to load comparison", "danger");
//   }
// }

// function getRandomColor() {
//   return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
// }

// // Search Functionality
// const searchHandler = debounce(async e => {
//   const query = e.target.value.trim().toLowerCase();
//   const resultsDiv = document.getElementById("searchResults");
//   const resultsList = document.getElementById("searchResultsList");
//   if (!resultsDiv || !resultsList) {
//     console.warn("Search results elements not found");
//     return;
//   }
//   if (query.length < 2) {
//     resultsDiv.classList.add("hidden");
//     return;
//   }
//   try {
//     const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(query)}`);
//     resultsList.innerHTML = "";
//     if (results.length === 0) {
//       resultsList.innerHTML = "<div class='p-3 text-gray-600 dark:text-gray-400'>No results found</div>";
//     } else {
//       results.forEach(coin => {
//         const item = document.createElement("button");
//         item.className = "w-full text-left p-3 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-capitalize";
//         item.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
//         item.onclick = () => addCoin(coin.id.toLowerCase(), item);
//         resultsList.appendChild(item);
//       });
//     }
//     resultsDiv.classList.remove("hidden");
//   } catch (error) {
//     console.error("Error fetching search results:", error);
//     resultsList.innerHTML = "<div class='p-3 text-red-500'>Error fetching results</div>";
//     resultsDiv.classList.remove("hidden");
//   }
// }, 300);

// // Setup Search
// function setupSearch() {
//   const searchInput = document.getElementById("searchInput");
//   if (searchInput) {
//     searchInput.addEventListener("input", searchHandler);
//   } else {
//     console.warn("Search input not found");
//   }
//   document.addEventListener("click", e => {
//     const searchResults = document.getElementById("searchResults");
//     if (searchResults && !e.target.closest("#searchInput") && !e.target.closest("#searchResults")) {
//       searchResults.classList.add("hidden");
//     }
//   });
// }

// // Add Coin Form Submission
// function setupAddForm() {
//   const addForm = document.getElementById("addForm");
//   if (!addForm) {
//     console.warn("Add form not found");
//     return;
//   }
//   addForm.addEventListener("submit", async e => {
//     e.preventDefault();
//     const button = e.submitter;
//     toggleLoading(button, true);
//     const symbol = document.getElementById("coinSymbolInput")?.value.trim().toLowerCase();
//     try {
//       const results = await fetchWithCache(`${API.search}?q=${encodeURIComponent(symbol)}`);
//       const coin = results.find(c => c.id.toLowerCase() === symbol || c.symbol.toLowerCase() === symbol);
//       if (!coin) {
//         showToast(`Coin "${symbol}" not found`, "warning");
//         return;
//       }
//       await addCoin(coin.id.toLowerCase(), button);
//     } catch (error) {
//       console.error("Error validating coin:", error);
//       showToast(`Error validating coin: ${error.message}`, "danger");
//     } finally {
//       toggleLoading(button, false);
//     }
//   });
// }

// // Populate Portfolio and Alert Coin Selects
// async function populateSelects() {
//   try {
//     const coins = await fetchWithCache(`${API.search}?q=`);
//     const portfolioSelect = document.getElementById("portfolioCoin");
//     const alertSelect = document.getElementById("alertCoin");
//     if (portfolioSelect) {
//       portfolioSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
//       coins.forEach(coin => {
//         portfolioSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
//       });
//     }
//     if (alertSelect) {
//       alertSelect.innerHTML = "<option value='' disabled selected>Select Coin</option>";
//       coins.forEach(coin => {
//         alertSelect.innerHTML += `<option value="${coin.id.toLowerCase()}">${coin.name} (${coin.symbol.toUpperCase()})</option>`;
//       });
//     }
//     if (!portfolioSelect || !alertSelect) {
//       console.warn("Portfolio or alert select not found");
//     }
//   } catch (error) {
//     console.error("Error populating selects:", error);
//     showToast("Failed to load coin list", "danger");
//   }
// }

// // Initialize
// function initialize() {
//   setupThemeToggle();
//   setupSidebarToggle();
//   setupTabNavigation();
//   setupCloseChartModal();
//   setupPortfolioForm();
//   setupAlertForm();
//   setupCompareForm();
//   setupSearch();
//   setupAddForm();
//   refresh();
//   populateSelects();
//   setInterval(refresh, 60000);
// }

// // Ensure DOM is loaded
// document.addEventListener("DOMContentLoaded", initialize);




// API endpoint URLs
const Api = {
  prices: "/api/prices",
  summary: "/api/summary",
  history: "/api/history",
  portfolio: "/api/portfolio",
  alerts: "/api/alerts",
  notes: "/api/notes",
  compare: "/api/compare",
  search: "/api/search"
};

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Fetch with caching
async function fetchWithCache(url, options = {}) {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for ${url}`);
    return cached.data;
  }

  console.log(`Fetching fresh data for ${url}`);
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  cache.set(url, { data, timestamp: now });
  console.log(`Fetched and cached data for ${url}`);
  return data;
}

// Show toast notification
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `p-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-fade-in-down ${
    type === "success" ? "bg-green-500" :
    type === "danger" ? "bg-red-500" :
    type === "warning" ? "bg-yellow-500" : "bg-blue-500"
  }`;
  toast.innerHTML = `
    <i class="fas ${
      type === "success" ? "fa-check-circle" :
      type === "danger" ? "fa-exclamation-circle" :
      type === "warning" ? "fa-exclamation-triangle" : "fa-info-circle"
    }"></i>
    <span>${message}</span>
    <button class="ml-auto text-white hover:text-gray-200" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
}

// Toggle sidebar for mobile
function setupSidebar() {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  if (!sidebar || !menuToggle) return;

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.add("-translate-x-full");
    }
  });
}

// Theme toggle
function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  const isDark = localStorage.getItem("theme") === "dark";
  themeToggle.checked = isDark;
  document.documentElement.classList.toggle("dark", isDark);

  themeToggle.addEventListener("change", () => {
    const isDark = themeToggle.checked;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Tab navigation
function setupTabs() {
  const navLinks = document.querySelectorAll(".nav-link");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");

      navLinks.forEach(l => l.classList.remove("bg-indigo-100", "dark:bg-indigo-900"));
      tabPanes.forEach(pane => pane.classList.add("hidden"));

      link.classList.add("bg-indigo-100", "dark:bg-indigo-900");
      const targetPane = document.getElementById(tabId);
      if (targetPane) {
        targetPane.classList.remove("hidden");
      }

      if (tabId === "compare-tab") {
        setupCompareForm();
      }
    });
  });
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchResultsList = document.getElementById("searchResultsList");

  if (!searchInput || !searchResults || !searchResultsList) return;

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      searchResults.classList.add("hidden");
      return;
    }

    try {
      const coins = await fetchWithCache(`${Api.search}?q=${query}`);
      searchResultsList.innerHTML = "";
      coins.forEach(coin => {
        const div = document.createElement("div");
        div.className = "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";
        div.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
        div.addEventListener("click", () => {
          searchInput.value = "";
          searchResults.classList.add("hidden");
          addCoin(coin.id);
        });
        searchResultsList.appendChild(div);
      });
      searchResults.classList.toggle("hidden", coins.length === 0);
    } catch (error) {
      console.error("Error searching coins:", error);
      showToast("Failed to search coins", "danger");
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      searchResults.classList.add("hidden");
    }
  });
}

// Add coin to watchlist
async function addCoin(coinId) {
  const addForm = document.getElementById("addForm");
  const loading = addForm?.querySelector(".loading");
  if (loading) loading.classList.remove("hidden");

  try {
    const response = await fetch("/add", {
      method: "POST",
      body: new URLSearchParams({ symbol: coinId }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    const result = await response.json();
    if (result.success) {
      showToast("Coin added to watchlist", "success");
      updateWatchlist();
    } else {
      showToast(result.error || "Failed to add coin", "danger");
    }
  } catch (error) {
    console.error("Error adding coin:", error);
    showToast("Failed to add coin", "danger");
  } finally {
    if (loading) loading.classList.add("hidden");
  }
}

// Remove coin from watchlist
async function removeCoin(coinId) {
  try {
    const response = await fetch("/remove", {
      method: "POST",
      body: JSON.stringify({ id: coinId }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    if (result.success) {
      showToast("Coin removed from watchlist", "success");
      updateWatchlist();
    } else {
      showToast("Failed to remove coin", "danger");
    }
  } catch (error) {
    console.error("Error removing coin:", error);
    showToast("Failed to remove coin", "danger");
  }
}

// Update watchlist UI
async function updateWatchlist() {
  const coinGrid = document.getElementById("coinGrid");
  const trendingCoins = document.getElementById("trendingCoins");
  if (!coinGrid || !trendingCoins) return;

  try {
    const coins = await fetchWithCache(Api.prices);
    console.log("Received prices:", coins);

    coinGrid.innerHTML = "";
    Object.entries(coins).forEach(([coinId, priceData]) => {
      console.log(`Rendering watchlist coin ${coinId}:`, priceData);
      const priceDisplay = priceData.usd > 0 ? `$${priceData.usd.toFixed(2)}` : "Price unavailable";
      const card = document.createElement("div");
      card.className = "card bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300";
      card.innerHTML = `
        <h3 class="text-lg font-semibold text-capitalize">${coinId}</h3>
        <p class="text-gray-600 dark:text-gray-400">${priceDisplay}</p>
        <div class="flex gap-2 mt-2">
          <button class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors" onclick="showChart('${coinId}')" aria-label="View chart for ${coinId}">
            <i class="fas fa-chart-line"></i> Chart
          </button>
          <button class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors" onclick="removeCoin('${coinId}')" aria-label="Remove ${coinId} from watchlist">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      `;
      coinGrid.appendChild(card);
    });

    const trendingCards = trendingCoins.querySelectorAll(".card");
    trendingCards.forEach(card => {
      const coinId = card.querySelector("button").getAttribute("onclick").match(/'([^']+)'/)[1];
      const priceData = coins[coinId];
      if (priceData) {
        const priceEl = card.querySelector("p:nth-child(3)");
        const changeEl = card.querySelector("p:nth-child(4)");
        if (priceEl) priceEl.textContent = `$${priceData.usd.toFixed(2)}`;
        if (changeEl) {
          changeEl.textContent = `${priceData.usd_24h_change.toFixed(2)}%`;
          changeEl.className = `text-center ${priceData.usd_24h_change > 0 ? "text-green-500" : "text-red-500"}`;
        }
      }
    });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    showToast("Failed to update watchlist", "danger");
  }
}

// Fetch portfolio summary
async function fetchSummary() {
  try {
    const summary = await fetchWithCache(Api.summary);
    const summaryBadge = document.getElementById("summaryBadge");
    if (summaryBadge) {
      if (!summary || typeof summary.portfolio_value === "undefined") {
        summaryBadge.textContent = "Portfolio: $0.00 | P/L: $0.00";
      } else {
        summaryBadge.textContent = 
          `Portfolio: $${summary.portfolio_value.toFixed(2)} | P/L: $${summary.portfolio_profit_loss.toFixed(2)}`;
      }
    } else {
      console.warn("Summary badge element not found");
      showToast("Portfolio summary unavailable", "warning");
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
    const summaryBadge = document.getElementById("summaryBadge");
    if (summaryBadge) {
      summaryBadge.textContent = "Error fetching summary";
    }
    showToast("Failed to load portfolio summary", "danger");
  }
}

// Chart modal
let priceChartInstance = null;
async function showChart(coinId) {
  const chartModal = document.getElementById("chartModal");
  const chartTitle = document.getElementById("chartTitle");
  const priceChartCanvas = document.getElementById("priceChart");
  const closeChartModal = document.getElementById("closeChartModal");
  const timeRangeButtons = document.querySelectorAll(".time-range-btn");
  const coinNotes = document.getElementById("coinNotes");
  const saveNotes = document.getElementById("saveNotes");

  if (!chartModal || !chartTitle || !priceChartCanvas || !closeChartModal || !coinNotes || !saveNotes) return;

  chartTitle.textContent = `${coinId.toUpperCase()} Price Chart`;
  chartModal.classList.remove("hidden");

  const updateChart = async (range = "all") => {
    timeRangeButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(timeRangeButtons).find(btn => btn.dataset.range === range);
    if (activeBtn) activeBtn.classList.add("active");

    try {
      const history = await fetchWithCache(`${Api.history}/${coinId}?range=${range}`);
      const labels = history.map(item => new Date(item.t));
      const prices = history.map(item => item.p);

      if (priceChartInstance) {
        priceChartInstance.destroy();
      }

      priceChartInstance = new Chart(priceChartCanvas, {
        type: "line",
        data: {
          labels: labels,
          datasets: [{
            label: `${coinId.toUpperCase()} Price`,
            data: prices,
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "time",
              time: {
                unit: range === "24h" ? "hour" : range === "7d" ? "day" : "month"
              },
              title: { display: true, text: "Date" }
            },
            y: {
              title: { display: true, text: "Price (USD)" }
            }
          }
        }
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      showToast("Failed to load chart data", "danger");
    }
  };

  await updateChart();

  timeRangeButtons.forEach(btn => {
    btn.addEventListener("click", () => updateChart(btn.dataset.range));
  });

  closeChartModal.addEventListener("click", () => {
    chartModal.classList.add("hidden");
    if (priceChartInstance) {
      priceChartInstance.destroy();
      priceChartInstance = null;
    }
  });

  try {
    const notes = await fetchWithCache(Api.notes);
    const note = notes.find(n => n.coin === coinId);
    coinNotes.value = note ? note.text : "";
  } catch (error) {
    console.error("Error fetching notes:", error);
    coinNotes.value = "";
  }

  saveNotes.addEventListener("click", async () => {
    const loading = saveNotes.querySelector(".loading");
    if (loading) loading.classList.remove("hidden");

    try {
      const response = await fetch(Api.notes, {
        method: "POST",
        body: JSON.stringify({ coin: coinId, text: coinNotes.value }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (result.success) {
        showToast("Notes saved", "success");
      } else {
        showToast("Failed to save notes", "danger");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      showToast("Failed to save notes", "danger");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  });
}

// Portfolio management
async function setupPortfolio() {
  const portfolioForm = document.getElementById("portfolioForm");
  const portfolioTableBody = document.getElementById("portfolioTableBody");
  const portfolioTotalValue = document.getElementById("portfolioTotalValue");
  const portfolioProfitLoss = document.getElementById("portfolioProfitLoss");
  const portfolioCoin = document.getElementById("portfolioCoin");

  if (!portfolioForm || !portfolioTableBody || !portfolioTotalValue || !portfolioProfitLoss || !portfolioCoin) return;

  const updatePortfolio = async () => {
    try {
      const portfolio = await fetchWithCache(Api.portfolio);
      let totalValue = 0;
      let totalProfitLoss = 0;

      portfolioTableBody.innerHTML = "";
      portfolio.forEach(entry => {
        totalValue += entry.current_value;
        totalProfitLoss += entry.profit_loss;

        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 dark:border-gray-700";
        row.innerHTML = `
          <td class="p-2">${entry.coin.toUpperCase()}</td>
          <td class="p-2">${entry.amount.toFixed(6)}</td>
          <td class="p-2">$${entry.price.toFixed(2)}</td>
          <td class="p-2">$${entry.current_price.toFixed(2)}</td>
          <td class="p-2">$${entry.current_value.toFixed(2)}</td>
          <td class="p-2 ${entry.profit_loss >= 0 ? "text-green-500" : "text-red-500"}">
            $${entry.profit_loss.toFixed(2)} (${entry.profit_loss_pct.toFixed(2)}%)
          </td>
          <td class="p-2">
            <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="removePortfolioEntry('${entry.coin}')" aria-label="Remove ${entry.coin} from portfolio">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        portfolioTableBody.appendChild(row);
      });

      portfolioTotalValue.textContent = `$${totalValue.toFixed(2)}`;
      portfolioProfitLoss.textContent = `$${totalProfitLoss.toFixed(2)}`;
      portfolioProfitLoss.className = `text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`;
    } catch (error) {
      console.error("Error updating portfolio:", error);
      showToast("Failed to update portfolio", "danger");
    }
  };

  const populateCoinOptions = async () => {
    try {
      const coins = Object.keys(await fetchWithCache(Api.prices));
      portfolioCoin.innerHTML = '<option value="">Select coin</option>';
      coins.forEach(coin => {
        const option = document.createElement("option");
        option.value = coin;
        option.textContent = coin.toUpperCase();
        portfolioCoin.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching coins for portfolio:", error);
    }
  };

  portfolioForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loading = portfolioForm.querySelector(".loading");
    if (loading) loading.classList.remove("hidden");

    const coin = portfolioCoin.value;
    const amount = parseFloat(document.getElementById("portfolioAmount").value);
    const price = parseFloat(document.getElementById("portfolioPrice").value) || 0;

    try {
      const response = await fetch(Api.portfolio, {
        method: "POST",
        body: JSON.stringify({ coin, amount, price }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (result.success) {
        showToast("Coin added to portfolio", "success");
        await updatePortfolio();
        await fetchSummary();
        portfolioForm.reset();
      } else {
        showToast("Failed to add coin to portfolio", "danger");
      }
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      showToast("Failed to add coin to portfolio", "danger");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  });

  await populateCoinOptions();
  await updatePortfolio();
}

async function removePortfolioEntry(coin) {
  try {
    const response = await fetch(`${Api.portfolio}?coin=${coin}`, {
      method: "DELETE"
    });
    const result = await response.json();
    if (result.success) {
      showToast("Coin removed from portfolio", "success");
      await setupPortfolio();
      await fetchSummary();
    } else {
      showToast("Failed to remove coin from portfolio", "danger");
    }
  } catch (error) {
    console.error("Error removing from portfolio:", error);
    showToast("Failed to remove coin from portfolio", "danger");
  }
}

// Compare cryptocurrencies
let compareChartInstance = null;
async function setupCompareForm() {
  const compareForm = document.getElementById("compareForm");
  const compareSelectCoins = document.getElementById("compareSelectCoins");
  const compareChartCanvas = document.getElementById("compareChart");
  const recentComparisons = document.getElementById("recentComparisons");

  if (!compareForm || !compareSelectCoins || !compareChartCanvas || !recentComparisons) return;

  const updateCompareChart = async (history) => {
    if (compareChartInstance) {
      compareChartInstance.destroy();
    }

    const datasets = Object.entries(history).map(([coin, data], index) => {
      const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
      return {
        label: coin.toUpperCase(),
        data: data.map(item => item.price),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + "33",
        fill: false,
        tension: 0.4
      };
    });

    compareChartInstance = new Chart(compareChartCanvas, {
      type: "line",
      data: {
        labels: history[Object.keys(history)[0]]?.map(item => new Date(item.date)),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: { unit: "day" },
            title: { display: true, text: "Date" }
          },
          y: {
            title: { display: true, text: "Price (USD)" }
          }
        }
      }
    });
  };

  const updateRecentComparisons = async () => {
    try {
      const comparisons = await fetchWithCache(Api.compare);
      recentComparisons.innerHTML = "";
      comparisons.forEach(comp => {
        const div = document.createElement("div");
        div.className = "p-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600";
        div.textContent = comp.coins.join(" vs ");
        div.addEventListener("click", async () => {
          try {
            const history = await fetchWithCache(`${Api.compare}?id=${comp.id}`);
            await updateCompareChart(history);
          } catch (error) {
            console.error("Error loading comparison:", error);
            showToast("Failed to load comparison", "danger");
          }
        });
        recentComparisons.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching recent comparisons:", error);
    }
  };

  const populateCompareOptions = async () => {
    try {
      const coins = Object.keys(await fetchWithCache(Api.prices));
      compareSelectCoins.innerHTML = "";
      coins.forEach(coin => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-2";
        div.innerHTML = `
          <input type="checkbox" id="compare-${coin}" value="${coin}" class="compare-checkbox">
          <label for="compare-${coin}">${coin.toUpperCase()}</label>
        `;
        compareSelectCoins.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching coins for compare:", error);
    }
  };

  compareForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loading = compareForm.querySelector(".loading");
    if (loading) loading.classList.remove("hidden");

    const checkboxes = document.querySelectorAll(".compare-checkbox:checked");
    const coins = Array.from(checkboxes).map(cb => cb.value);

    try {
      const response = await fetch(Api.compare, {
        method: "POST",
        body: JSON.stringify({ coins }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      const history = await fetchWithCache(`${Api.compare}?id=${result.id}`);
      await updateCompareChart(history);
      await updateRecentComparisons();
      showToast("Comparison generated", "success");
    } catch (error) {
      console.error("Error generating comparison:", error);
      showToast("Failed to generate comparison", "danger");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  });

  await populateCompareOptions();
  await updateRecentComparisons();
}

// Alerts management
async function setupAlerts() {
  const alertForm = document.getElementById("alertForm");
  const alertsTableBody = document.getElementById("alertsTableBody");
  const alertCoin = document.getElementById("alertCoin");

  if (!alertForm || !alertsTableBody || !alertCoin) return;

  const updateAlerts = async () => {
    try {
      const alerts = await fetchWithCache(Api.alerts);
      const prices = await fetchWithCache(Api.prices);

      alertsTableBody.innerHTML = "";
      alerts.forEach(alert => {
        const currentPrice = prices[alert.coin]?.usd || 0;
        if ((alert.high && currentPrice >= alert.high) || (alert.low && currentPrice <= alert.low)) {
          showToast(`${alert.coin.toUpperCase()} alert triggered: $${currentPrice}`, "warning");
        }

        const row = document.createElement("tr");
        row.className = "border-b border-gray-200 dark:border-gray-700";
        row.innerHTML = `
          <td class="p-2">${alert.coin.toUpperCase()}</td>
          <td class="p-2">${alert.low ? `$${alert.low.toFixed(2)}` : '-'}</td>
          <td class="p-2">${alert.high ? `$${alert.high.toFixed(2)}` : '-'}</td>
          <td class="p-2">$${currentPrice.toFixed(2)}</td>
          <td class="p-2">
            <button class="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors" onclick="removeAlert('${alert.coin}')" aria-label="Remove alert for ${alert.coin}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        alertsTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error updating alerts:", error);
      showToast("Failed to update alerts", "danger");
    }
  };

  const populateAlertCoinOptions = async () => {
    try {
      const coins = Object.keys(await fetchWithCache(Api.prices));
      alertCoin.innerHTML = '<option value="">Select coin</option>';
      coins.forEach(coin => {
        const option = document.createElement("option");
        option.value = coin;
        option.textContent = coin.toUpperCase();
        alertCoin.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching coins for alerts:", error);
    }
  };

  alertForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loading = alertForm.querySelector(".loading");
    if (loading) loading.classList.remove("hidden");

    const coin = alertCoin.value;
    const high = parseFloat(document.getElementById("alertHigh").value) || null;
    const low = parseFloat(document.getElementById("alertLow").value) || null;

    try {
      const response = await fetch(Api.alerts, {
        method: "POST",
        body: JSON.stringify({ coin, high, low }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      if (result.success) {
        showToast("Alert set", "success");
        await updateAlerts();
        alertForm.reset();
      } else {
        showToast(result.error || "Failed to set alert", "danger");
      }
    } catch (error) {
      console.error("Error setting alert:", error);
      showToast("Failed to set alert", "danger");
    } finally {
      if (loading) loading.classList.add("hidden");
    }
  });

  await populateAlertCoinOptions();
  await updateAlerts();
}

async function removeAlert(coin) {
  try {
    const response = await fetch(`${Api.alerts}?coin=${coin}`, {
      method: "DELETE"
    });
    const result = await response.json();
    if (result.success) {
      showToast("Alert removed", "success");
      await setupAlerts();
    } else {
      showToast("Failed to remove alert", "danger");
    }
  } catch (error) {
    console.error("Error removing alert:", error);
    showToast("Failed to remove alert", "danger");
  }
}

// Refresh data periodically
async function refresh() {
  try {
    await fetchSummary();
    await updateWatchlist();
    await setupPortfolio();
    await setupAlerts();
  } catch (error) {
    console.error("Error refreshing data:", error);
    showToast(`Failed to refresh data: ${error.message}`, "danger");
  }
}

// Initialize everything
function initialize() {
  setupSidebar();
  setupThemeToggle();
  setupTabs();
  setupSearch();
  setupPortfolio();
  setupAlerts();
  refresh();
  setInterval(refresh, 60000);
}

document.addEventListener("DOMContentLoaded", initialize);