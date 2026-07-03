const state = {
  interactions: [],
  bookings: [],
  escalations: [],
  positiveCount: 0,
  negativeCount: 0
};

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatButton = document.getElementById("clearChat");
const bookingForm = document.getElementById("bookingForm");
const bookingStatus = document.getElementById("bookingStatus");
const activityList = document.getElementById("activityList");
const escalationList = document.getElementById("escalationList");
const insightList = document.getElementById("insightList");

const dashboardFields = {
  interactions: document.getElementById("totalInteractions"),
  bookings: document.getElementById("totalBookings"),
  escalations: document.getElementById("totalEscalations"),
  positiveSentiment: document.getElementById("positiveSentiment"),
  heroQueries: document.getElementById("heroQueries"),
  heroEscalations: document.getElementById("heroEscalations"),
  heroBookings: document.getElementById("heroBookings"),
  heroSatisfaction: document.getElementById("heroSatisfaction")
};

const quickReplies = {
  hours: "We are open Monday to Saturday from 9:00 AM to 7:00 PM. I can also help you book a visit if you'd like.",
  pricing: "Our pricing depends on the service. Standard plans start from Rs. 499 and premium support packages start from Rs. 1299.",
  appointment: "I can help with that. Use the appointment panel to confirm a date and time, or tell me your preferred slot here.",
  recommendation: "Based on your profile, I recommend our premium care package because it includes priority support, follow-up reminders, and personalized offers.",
  complaint: "I'm sorry this has been frustrating. I've marked this as a priority issue and a team member should review it as soon as possible.",
  tracking: "Your request is currently in progress. The latest update shows it is under review, and the next status update will be shared automatically.",
  fallback: "I can help with hours, pricing, bookings, delays, recommendations, and complaints. If this needs a person, I can escalate it."
};

function boot() {
  seedMessages();
  bindEvents();
  renderDashboard();
}

function seedMessages() {
  addMessage("bot", "Hello! I'm your AI customer experience assistant. Ask about bookings, timings, offers, service updates, or support.");
  addMessage("bot", "Tip: try a quick action on the left to simulate a real customer journey.");
}

function bindEvents() {
  chatForm.addEventListener("submit", handleChatSubmit);
  bookingForm.addEventListener("submit", handleBookingSubmit);
  clearChatButton.addEventListener("click", clearChat);

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-quick-message]").forEach((button) => {
    button.addEventListener("click", () => {
      chatInput.value = button.dataset.quickMessage;
      chatForm.requestSubmit();
    });
  });
}

function handleChatSubmit(event) {
  event.preventDefault();
  const message = chatInput.value.trim();

  if (!message) {
    return;
  }

  addMessage("user", message);
  chatInput.value = "";

  const response = generateAssistantReply(message);
  window.setTimeout(() => {
    addMessage("bot", response.text);
    recordInteraction(message, response);
    if (response.escalate) {
      addMessage("system", "Escalation created for staff review.");
      state.escalations.unshift({
        customer: getCustomerName(),
        reason: response.reason,
        message
      });
    }
    renderDashboard();
  }, 350);
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const booking = {
    customer: getCustomerName(),
    service: document.getElementById("serviceType").value,
    date: document.getElementById("bookingDate").value,
    time: document.getElementById("bookingTime").value
  };

  if (!booking.date) {
    bookingStatus.innerHTML = "<p>Please choose a booking date first.</p>";
    return;
  }

  state.bookings.unshift(booking);
  state.interactions.push({
    type: "booking",
    sentiment: "positive",
    detail: `${booking.service} booked for ${booking.date} at ${booking.time}`
  });
  state.positiveCount += 1;

  bookingStatus.innerHTML = `
    <strong>Booking confirmed</strong>
    <p>${booking.customer} booked <b>${booking.service}</b> on <b>${formatDate(booking.date)}</b> at <b>${booking.time}</b>.</p>
  `;

  addMessage("system", `Appointment confirmed for ${booking.service} on ${formatDate(booking.date)} at ${booking.time}.`);
  renderDashboard();
  bookingForm.reset();
}

function clearChat() {
  chatMessages.innerHTML = "";
  state.interactions = [];
  state.escalations = [];
  state.bookings = [];
  state.positiveCount = 0;
  state.negativeCount = 0;
  bookingStatus.innerHTML = "<p>No booking confirmed yet.</p>";
  seedMessages();
  renderDashboard();
}

function generateAssistantReply(message) {
  const text = message.toLowerCase();

  if (matchesAny(text, ["hour", "timing", "open", "close"])) {
    return { text: quickReplies.hours, sentiment: "positive", category: "faq" };
  }

  if (matchesAny(text, ["price", "cost", "fee", "package"])) {
    return { text: quickReplies.pricing, sentiment: "positive", category: "pricing" };
  }

  if (matchesAny(text, ["book", "appointment", "schedule", "reschedule"])) {
    return { text: quickReplies.appointment, sentiment: "positive", category: "booking" };
  }

  if (matchesAny(text, ["recommend", "suggest", "premium", "offer"])) {
    return { text: buildRecommendationReply(), sentiment: "positive", category: "recommendation" };
  }

  if (matchesAny(text, ["delay", "late", "angry", "upset", "complaint", "bad", "frustrated"])) {
    return {
      text: quickReplies.complaint,
      sentiment: "negative",
      category: "escalation",
      escalate: true,
      reason: "Negative sentiment or service complaint"
    };
  }

  if (matchesAny(text, ["track", "status", "order", "request"])) {
    return { text: quickReplies.tracking, sentiment: "positive", category: "status" };
  }

  return {
    text: quickReplies.fallback,
    sentiment: "neutral",
    category: "general",
    escalate: false
  };
}

function buildRecommendationReply() {
  const loyaltyTier = document.getElementById("loyaltyTier").value;
  const businessType = document.getElementById("businessType").value;

  const businessRecommendations = {
    salon: "a premium styling package with follow-up care reminders",
    clinic: "a wellness consultation package with reminder notifications",
    retail: "a loyalty bundle with personalized product suggestions",
    repair: "a priority repair package with automated status updates"
  };

  const tierMessage = loyaltyTier === "gold"
    ? "As a Gold customer, you also qualify for priority handling and a loyalty offer."
    : loyaltyTier === "silver"
      ? "As a returning customer, you can benefit from a bundled service discount."
      : "Since you're new, I recommend starting with an entry package plus guided follow-up.";

  return `Based on your profile, I recommend ${businessRecommendations[businessType]}. ${tierMessage}`;
}

function recordInteraction(message, response) {
  state.interactions.unshift({
    type: response.category,
    sentiment: response.sentiment,
    detail: message
  });

  if (response.sentiment === "positive") {
    state.positiveCount += 1;
  }

  if (response.sentiment === "negative") {
    state.negativeCount += 1;
  }
}

function addMessage(type, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${type}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderDashboard() {
  const totalInteractions = state.interactions.length;
  const totalBookings = state.bookings.length;
  const totalEscalations = state.escalations.length;
  const totalSentiment = state.positiveCount + state.negativeCount;
  const satisfaction = totalSentiment === 0
    ? 100
    : Math.round((state.positiveCount / totalSentiment) * 100);

  dashboardFields.interactions.textContent = totalInteractions;
  dashboardFields.bookings.textContent = totalBookings;
  dashboardFields.escalations.textContent = totalEscalations;
  dashboardFields.positiveSentiment.textContent = `${satisfaction}%`;
  dashboardFields.heroQueries.textContent = 14 + totalInteractions;
  dashboardFields.heroEscalations.textContent = 2 + totalEscalations;
  dashboardFields.heroBookings.textContent = 5 + totalBookings;
  dashboardFields.heroSatisfaction.textContent = `${Math.max(84, satisfaction)}%`;

  renderInsights(totalInteractions, totalBookings, totalEscalations, satisfaction);
  renderEscalations();
  renderActivity();
}

function renderInsights(totalInteractions, totalBookings, totalEscalations, satisfaction) {
  const insights = [
    `${totalInteractions} interaction(s) captured in this session.`,
    `${totalBookings} booking(s) successfully created through the automated flow.`,
    `${totalEscalations} case(s) required human escalation.`,
    `Current positive sentiment score is ${satisfaction}%.`
  ];

  insightList.innerHTML = insights.map((item) => `<li>${item}</li>`).join("");
}

function renderEscalations() {
  if (state.escalations.length === 0) {
    escalationList.innerHTML = '<li class="empty-state">No escalations yet. Urgent cases will appear here.</li>';
    return;
  }

  escalationList.innerHTML = state.escalations
    .slice(0, 5)
    .map((item) => `<li><strong>${item.customer}</strong><br>${item.reason}<br><small>${item.message}</small></li>`)
    .join("");
}

function renderActivity() {
  const activity = [
    ...state.bookings.map((booking) => `Booking confirmed: ${booking.service} on ${formatDate(booking.date)} at ${booking.time}`),
    ...state.interactions.slice(0, 5).map((item) => `${capitalize(item.type)} interaction logged: ${item.detail}`)
  ].slice(0, 6);

  if (activity.length === 0) {
    activityList.innerHTML = '<li class="empty-state">No activity yet. Start a conversation or create a booking.</li>';
    return;
  }

  activityList.innerHTML = activity.map((item) => `<li>${item}</li>`).join("");
}

function getCustomerName() {
  return document.getElementById("customerName").value.trim() || "Customer";
}

function matchesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

boot();
