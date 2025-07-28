// Name validation
let playerName = '';

// Check for name in URL parameters
function getPlayerNameFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('name');
}

// Validate player name
function validatePlayerName(name) {
  // Remove extra spaces and trim
  name = name.trim().replace(/\s+/g, ' ');
  
  // Check if name is too short or too long
  if (name.length < 2 || name.length > 20) {
    return { valid: false, message: "Name must be between 2 and 20 characters." };
  }
  
  // Check if name contains only letters, spaces, and hyphens
  if (!/^[a-zA-Z\s\-]+$/.test(name)) {
    return { valid: false, message: "Name can only contain letters, spaces, and hyphens." };
  }
  
  // Check for offensive words (basic list)
  const offensiveWords = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'test', 'admin', 'user', 'guest', 'anonymous'];
  const lowerName = name.toLowerCase();
  for (const word of offensiveWords) {
    if (lowerName.includes(word)) {
      return { valid: false, message: "Please enter a real name without offensive language." };
    }
  }
  
  // Check if name looks like a real name (at least one letter)
  if (!/[a-zA-Z]/.test(name)) {
    return { valid: false, message: "Please enter a real name." };
  }
  
  return { valid: true, name: name };
}

// Get first name only for email addresses
function getFirstName(fullName) {
  return fullName.split(' ')[0];
}

// Show name validation modal
function showNameValidationModal() {
  const modal = document.getElementById('nameValidationModal');
  modal.style.display = 'flex';
  document.getElementById('phishingPlayerNameInput').focus();
}

// Hide name validation modal
function hideNameValidationModal() {
  const modal = document.getElementById('nameValidationModal');
  modal.style.display = 'none';
}

// Initialize name validation
function initializeNameValidation() {
  const nameFromURL = getPlayerNameFromURL();
  
  if (!nameFromURL) {
    // Try to load saved name from localStorage
    const savedName = localStorage.getItem('cyberdefender_username');
    if (savedName) {
      playerName = savedName;
      return true;
    } else {
      showNameValidationModal();
      return false;
    }
  } else {
    const validation = validatePlayerName(nameFromURL);
    if (!validation.valid) {
      alert(validation.message + " Please enter a real name.");
      showNameValidationModal();
      return false;
    }
    playerName = validation.name;
    // Save the name to localStorage when it comes from URL parameter
    localStorage.setItem('cyberdefender_username', playerName);
    console.log('Phishing simulation saved name from URL to localStorage:', playerName);
    return true;
  }
}

// Name validation event listeners
document.addEventListener('DOMContentLoaded', function() {
  if (!initializeNameValidation()) {
    // Set up name validation event listeners
    document.getElementById('confirmPhishingNameBtn').addEventListener('click', function() {
      const nameInput = document.getElementById('phishingPlayerNameInput');
      const name = nameInput.value.trim();
      
      if (!name) {
        nameInput.focus();
        return;
      }
      
      const validation = validatePlayerName(name);
      if (!validation.valid) {
        alert(validation.message);
        nameInput.focus();
        return;
      }
      
      playerName = validation.name;
      // Save the name to localStorage for persistence
      localStorage.setItem('cyberdefender_username', playerName);
      console.log('Phishing simulation saved name to localStorage:', playerName);
      hideNameValidationModal();
      initializeApp();
    });
    
    document.getElementById('cancelPhishingNameBtn').addEventListener('click', function() {
      window.location.href = 'index.html';
    });
    
    document.getElementById('phishingPlayerNameInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('confirmPhishingNameBtn').click();
      }
    });
  } else {
    initializeApp();
  }
});

// Initialize the app after name validation
function initializeApp() {
  // Update messages with personalized content
  updateMessagesWithPlayerName();
  
  // Initialize conversations with personalized content
  messages.forEach(msg => {
    msg.conversation = [
      { sender: 'system', text: msg.personalizedBody || msg.body }
    ];
  });
  
  // Initialize the rest of the app
  renderMessages();
  setupEventListeners();
  
  // Select the first message by default
  if (messages.length > 0) selectMessage(messages[0].id);
}

// Update messages to include player name
function updateMessagesWithPlayerName() {
  messages.forEach(message => {
    if (message.type === 'phishing') {
      // Update the existing messages to use player name
      if (message.id === 1) {
        message.personalizedBody = `Dear ${playerName},<br><br>Your account has been locked due to suspicious activity. Please <a href='#' class='phish-link'>click here</a> to verify your information and restore access.<br><br>Thank you,<br>CyberBank Security Team`;
        message.personalizedSubject = `URGENT: Your Account Has Been Locked! ⚠️`;
      } else if (message.id === 3) {
        message.personalizedBody = `Congratulations ${playerName}! You have been selected to win a free hoverboard. <a href='#' class='phish-link'>Claim your prize now</a> by providing your shipping address and credit card info.<br><br>Stay rad,<br>Hoverboard Promotions`;
        message.personalizedSubject = `You Won a Free Cyberpunk Hoverboard! 🛹`;
      }
    } else if (message.type === 'legit') {
      // Update legitimate messages to use player name
      if (message.id === 2) {
        message.personalizedBody = `Hey ${playerName}!<br><br>Welcome to Neon City Social, the hottest new network in the city. Connect, share, and shine!<br><br>Best,<br>The Neon City Team`;
        message.personalizedSubject = 'Welcome to Neon City Social! 🌃';
      }
    }
  });
}

const messages = [
  {
    id: 1,
    type: 'phishing',
    subject: 'URGENT: Your Account Has Been Locked! ⚠️',
    body: `Dear User,<br><br>Your account has been locked due to suspicious activity. Please <a href='#' class='phish-link'>click here</a> to verify your information and restore access.<br><br>Thank you,<br>CyberBank Security Team`,
    phishingResponses: [
      {
        keywords: ['password', 'account', 'info', 'information'],
        response: "Thank you for providing your information. Your account will be restored soon. (This is a phishing attempt!)"
      },
      {
        keywords: [],
        response: "We need your account details to proceed. Please reply with your password."
      }
    ],
    legit: false,
    explanation: "This is a phishing attempt. The message uses a generic greeting ('Dear User'), creates urgency about a locked account, and asks you to click a vague link. The sender is 'CyberBank Security Team', which is not your real bank or company."
  },
  {
    id: 2,
    type: 'legit',
    subject: 'Welcome to Neon City Social! 🌃',
    body: `Hey there!<br><br>Welcome to Neon City Social, the hottest new network in the city. Connect, share, and shine!<br><br>Best,<br>The Neon City Team`,
    legit: true,
    explanation: "This is a legitimate welcome message. The language is friendly, there are no suspicious links, and it does not ask for sensitive information."
  },
  {
    id: 3,
    type: 'phishing',
    subject: 'You Won a Free Cyberpunk Hoverboard! 🛹',
    body: `Congratulations! You have been selected to win a free hoverboard. <a href='#' class='phish-link'>Claim your prize now</a> by providing your shipping address and credit card info.<br><br>Stay rad,<br>Hoverboard Promotions`,
    phishingResponses: [
      {
        keywords: ['address', 'credit', 'card', 'shipping'],
        response: "Thanks for your details! Your hoverboard is on the way. (This is a phishing attempt!)"
      },
      {
        keywords: [],
        response: "We need your shipping address and credit card info to send your prize."
      }
    ],
    legit: false,
    explanation: "This is a phishing attempt. The message promises a prize to trick you into giving personal and financial information. Legitimate companies do not ask for credit card info to claim a prize."
  }
];

let selectedMessage = null;
let scenarioIndex = 0;

// Add a locked property to each message and update UI/logic
function lockCurrentMessageAndAdvance() {
  if (!selectedMessage) return;
  selectedMessage.locked = true;
  // Find next unlocked message
  const unlocked = messages.find(m => !m.locked);
  if (unlocked) {
    selectMessage(unlocked.id);
  } else {
    selectedMessage = null;
    renderConversation();
  }
  renderMessages();
}

// Update renderMessages to show locked state
function renderMessages() {
  const ul = document.getElementById('messages');
  ul.innerHTML = '';
  messages.forEach(msg => {
    const li = document.createElement('li');
    const subject = msg.personalizedSubject || msg.subject;
    li.textContent = subject + (msg.locked ? ' (locked)' : '');
    li.onclick = () => {
      if (!msg.locked) selectMessage(msg.id);
    };
    if (selectedMessage && selectedMessage.id === msg.id) {
      li.classList.add('selected');
    }
    if (msg.locked) {
      li.style.opacity = 0.5;
      li.style.cursor = 'not-allowed';
    }
    ul.appendChild(li);
  });
}

function renderConversation() {
  const conversationDiv = document.getElementById('conversation');
  conversationDiv.innerHTML = '';
  if (!selectedMessage) return;
  selectedMessage.conversation.forEach(entry => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + entry.sender;
    bubble.innerHTML = entry.text;
    conversationDiv.appendChild(bubble);
  });
  conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

function selectMessage(id) {
  if (selectedMessage && !selectedMessage.locked && (selectedMessage._reported || selectedMessage.conversation.some(e => e.sender === 'user'))) {
    selectedMessage.locked = true;
    renderMessages(); // Ensure locked state is visually updated
  }
  selectedMessage = messages.find(m => m.id === id);
  const subject = selectedMessage.personalizedSubject || selectedMessage.subject;
  document.getElementById('message-subject').innerHTML = subject;
  renderConversation();
  document.getElementById('reply-input').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('reply-input').disabled = !!selectedMessage.locked;
  document.getElementById('send-reply').disabled = !!selectedMessage.locked;
  document.getElementById('report-phishing').disabled = !!selectedMessage.locked;
}

function handleReply() {
  if (!selectedMessage || selectedMessage.locked) return;
  const input = document.getElementById('reply-input').value;
  if (!input.trim()) return;
  selectedMessage.conversation.push({ sender: 'user', text: input });
  let feedback = '';
  let systemReply = '';
  if (selectedMessage.type === 'phishing') {
    let found = false;
    for (const resp of selectedMessage.phishingResponses || []) {
      if (resp.keywords.some(kw => input.toLowerCase().includes(kw))) {
        systemReply = resp.response;
        found = true;
        break;
      }
    }
    if (!found && selectedMessage.phishingResponses) {
      systemReply = selectedMessage.phishingResponses[selectedMessage.phishingResponses.length - 1].response;
    }
    feedback = 'Phishing detected!';
  } else {
    systemReply = "Thanks for your reply! This was a legitimate message.";
    feedback = '';
  }
  selectedMessage.conversation.push({ sender: 'system', text: systemReply });
  renderConversation();
  document.getElementById('reply-input').value = '';
  document.getElementById('feedback').innerHTML = `<div>${feedback}</div><span class='explanation-text'>${selectedMessage.explanation || ''}</span>`;
  document.getElementById('reply-input').disabled = true;
  document.getElementById('send-reply').disabled = true;
  document.getElementById('report-phishing').disabled = true;
}

function handleReport() {
  if (!selectedMessage || selectedMessage.locked) return;
  let feedback = '';
  if (selectedMessage.type === 'phishing') {
    feedback = "Correct! You spotted a phishing attempt.";
  } else {
    feedback = "Oops! This was a legitimate message.";
  }
  selectedMessage._reported = true;
  document.getElementById('feedback').innerHTML = `<div>${feedback}</div><span class='explanation-text'>${selectedMessage.explanation || ''}</span>`;
  document.getElementById('reply-input').disabled = true;
  document.getElementById('send-reply').disabled = true;
  document.getElementById('report-phishing').disabled = true;
}

function allMessagesHandled() {
  // Consider a message handled if it has at least one user reply or has been reported (feedback given)
  return messages.every(msg =>
    (msg.conversation && msg.conversation.some(e => e.sender === 'user')) ||
    (msg._reported === true)
  );
}

// Add global score tracking
let scenarioScores = [];
let scenarioBadges = [
  { name: 'Cyber Sleuth', icon: '🕵️‍♂️' },
  { name: 'Email Expert', icon: '📧' },
  { name: 'Social Engineer Buster', icon: '🔒' },
  { name: 'Finance Defender', icon: '💼' },
  { name: 'Login Guardian', icon: '🔑' }
];

function calculateScore() {
  let correct = 0;
  messages.forEach(msg => {
    if ((msg.type === 'phishing' && msg._reported) || (msg.type === 'legit' && msg.conversation.some(e => e.sender === 'user'))) {
      correct++;
    }
  });
  return Math.round((correct / messages.length) * 100);
}

function showBadgeAndNextScenario() {
  const feedback = document.getElementById('feedback');
  let summary = '<div style="margin-bottom:12px;">Results:</div><ul style="color:#f8f8f8;">';
  messages.forEach(msg => {
    summary += `<li><b>${msg.subject}</b>: <span style='color:${msg.legit ? '#39ff14' : '#ff4d4d'};'>${msg.legit ? 'Legitimate' : 'Phishing'}</span></li>`;
  });
  summary += '</ul>';
  // Calculate and store score
  const score = calculateScore();
  scenarioScores[scenarioIndex] = score;
  // Show badge
  let badge = scenarioBadges[scenarioIndex] || { name: 'Phishing Pro', icon: '🏅' };
  document.getElementById('badge-area').innerHTML = `<div style='margin:18px 0;'><span style='font-size:2em;'>${badge.icon}</span><br><b>${badge.name} Badge</b><br>Score: ${score}%</div>`;
  feedback.innerHTML = summary + `<div style='color:#00e6e6;margin-top:10px;'>${badge.icon} <b>${badge.name} Badge Unlocked!</b><br>You scored <b>${score}%</b>!<br>Moving to next scenario...</div>`;
  setTimeout(() => {
    scenarioIndex++;
    document.getElementById('badge-area').innerHTML = '';
    if (scenarioIndex === 1) {
      loadNextScenario();
    } else if (scenarioIndex === 2) {
      loadWhatsappScenario();
    } else if (scenarioIndex === 3) {
      loadManagerScenario();
    } else if (scenarioIndex === 4) {
      loadFakeLoginScenario();
      document.getElementById('finish-btn').style.display = 'block';
    } else {
      feedback.innerHTML += '<br><br>Simulation complete!';
    }
  }, 3500);
}

function loadNextScenario() {
  // Replace messages with a mix of phishing and legit emails, all branded as Thames Water, without revealing their type in the body
  messages.length = 0;
  messages.push(
    {
      id: 301,
      type: 'phishing',
      subject: 'URGENT: Account Security Alert',
      body: `
        <div style='font-family:monospace;'>
        <br>
        <b>From:</b> it-support@thameswater-helpdesk.net<br>
        <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
        <b>Subject:</b> URGENT: Account Security Alert<br>
        <span style='color:#888;'>Today, 3:47 PM</span>
        <hr>
        Dear ${playerName},<br><br>
        We have detected suspicious activity on your Thames Water account. To protect your data, you must verify immediately or your account will be suspended within 24 hours.<br><br>
        Recent suspicious activities include:<br>
        <ul>
          <li>Multiple failed login attempts from unknown location</li>
          <li>Unusual file access patterns detected</li>
          <li>Security policy violations identified</li>
        </ul>
        <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
          <b>Click here to verify:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-security-check.net/verify</span>
        </div>
        If you do not verify within the next 24 hours, your account access will be permanently restricted and IT support will need to manually restore your access.<br><br>
        Best regards,<br>
        Thames Water IT Security Team<br>
        <span style='color:#888;font-size:0.9em;'>This is an automated message, do not reply</span>
        </div>
      `,
      phishingResponses: [
        {
          keywords: ['verify', 'login', 'password', 'account', 'security', 'link'],
          response: "Thank you for verifying. Your account will be restored soon. (This is a phishing attempt!)"
        },
        {
          keywords: [],
          response: "We need you to click the link and verify your account details."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `
          <div style='font-family:monospace;'>
          <br>
          <b>From:</b> it-support@thameswater-helpdesk.net<br>
          <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
          <b>Subject:</b> URGENT: Account Security Alert<br>
          <span style='color:#888;'>Today, 3:47 PM</span>
          <hr>
          Dear ${playerName},<br><br>
          We have detected suspicious activity on your Thames Water account. To protect your data, you must verify immediately or your account will be suspended within 24 hours.<br><br>
          Recent suspicious activities include:<br>
          <ul>
            <li>Multiple failed login attempts from unknown location</li>
            <li>Unusual file access patterns detected</li>
            <li>Security policy violations identified</li>
          </ul>
          <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
            <b>Click here to verify:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-security-check.net/verify</span>
          </div>
          If you do not verify within the next 24 hours, your account access will be permanently restricted and IT support will need to manually restore your access.<br><br>
          Best regards,<br>
          Thames Water IT Security Team<br>
          <span style='color:#888;font-size:0.9em;'>This is an automated message, do not reply</span>
          </div>
        ` }
      ],
      explanation: "This message is a phishing attempt. The sender's address (hrthameswater@gmail.com) is missing a dot and does not match the official Thames Water domain. The message creates a false sense of urgency and asks for sensitive information. The link provided does not match the real company website."
    },
    {
      id: 302,
      type: 'phishing',
      subject: 'ServiceNow: Immediate Action Required',
      body: `
        <div style='font-family:monospace;'>
        <br>
        <b>From:</b> servicenow@thameswater-support.com<br>
        <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
        <b>Subject:</b> ServiceNow: Immediate Action Required<br>
        <span style='color:#888;'>Today, 11:15 AM</span>
        <hr>
        Dear ${playerName},<br><br>
        We have detected unusual activity on your ServiceNow account. Please <a href='#' style='color:#39ff14;'>log in to ServiceNow</a> to verify your credentials and prevent suspension.<br><br>
        <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
          <b>ServiceNow login:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-servicenow.com/login</span>
        </div>
        If you do not verify within the next 24 hours, your ServiceNow access will be restricted.<br><br>
        Regards,<br>
        Thames Water IT Support Team
        </div>
      `,
      phishingResponses: [
        {
          keywords: ['login', 'credentials', 'password', 'verify', 'servicenow'],
          response: "Thank you for verifying your credentials. Your account is now secure. (This is a phishing attempt!)"
        },
        {
          keywords: [],
          response: "Please log in to verify your credentials immediately."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `
          <div style='font-family:monospace;'>
          <br>
          <b>From:</b> servicenow@thameswater-support.com<br>
          <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
          <b>Subject:</b> ServiceNow: Immediate Action Required<br>
          <span style='color:#888;'>Today, 11:15 AM</span>
          <hr>
          Dear ${playerName},<br><br>
          We have detected unusual activity on your ServiceNow account. Please <a href='#' style='color:#39ff14;'>log in to ServiceNow</a> to verify your credentials and prevent suspension.<br><br>
          <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
            <b>ServiceNow login:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-servicenow.com/login</span>
          </div>
          If you do not verify within the next 24 hours, your ServiceNow access will be restricted.<br><br>
          Regards,<br>
          Thames Water IT Support Team
          </div>
        ` }
      ],
      explanation: "This message is a phishing attempt. The sender's address does not match the official Thames Water domain, and the link provided is suspicious."
    },
    {
      id: 303,
      type: 'legit',
      subject: 'Welcome to Thames Water!',
      body: `
        <div style='font-family:monospace;'>
        <br>
        <b>From:</b> onboarding@thameswater.co.uk<br>
        <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
        <b>Subject:</b> Welcome to Thames Water!<br>
        <span style='color:#888;'>Today, 9:00 AM</span>
        <hr>
        Dear Team Member,<br><br>
        Welcome to Thames Water! We are excited to have you on board. Please reach out to HR if you have any questions.<br><br>
        Best regards,<br>
        Thames Water HR Team
        </div>
      `,
      legit: true,
      conversation: [
        { sender: 'system', text: `
          <div style='font-family:monospace;'>
          <br>
          <b>From:</b> onboarding@thameswater.co.uk<br>
          <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
          <b>Subject:</b> Welcome to Thames Water!<br>
          <span style='color:#888;'>Today, 9:00 AM</span>
          <hr>
          Dear Team Member,<br><br>
          Welcome to Thames Water! We are excited to have you on board. Please reach out to HR if you have any questions.<br><br>
          Best regards,<br>
          Thames Water HR Team
          </div>
        ` }
      ],
      explanation: "This is a legitimate welcome message from the HR department."
    },
    {
      id: 304,
      type: 'phishing',
      subject: 'Payroll Update: Action Required',
      body: `
        <div style='font-family:monospace;'>
        <br>
        <b>From:</b> payroll@thameswater-payments.com<br>
        <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
        <b>Subject:</b> Payroll Update: Action Required<br>
        <span style='color:#888;'>Today, 10:12 AM</span>
        <hr>
        Dear Employee,<br><br>
        We are updating our payroll system. Please confirm your bank account details to avoid payment delays.<br><br>
        <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
          <b>Update here:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-payroll-update.com/secure</span>
        </div>
        Failure to update may result in delayed salary payments.<br><br>
        Sincerely,<br>
        Thames Water Payroll Department
        </div>
      `,
      phishingResponses: [
        {
          keywords: ['bank', 'account', 'details', 'update', 'salary'],
          response: "Thank you for updating your details. (This is a phishing attempt!)"
        },
        {
          keywords: [],
          response: "Please provide your bank account details to continue."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `
          <div style='font-family:monospace;'>
          <br>
          <b>From:</b> payroll@thameswater-payments.com<br>
          <b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br>
          <b>Subject:</b> Payroll Update: Action Required<br>
          <span style='color:#888;'>Today, 10:12 AM</span>
          <hr>
          Dear Employee,<br><br>
          We are updating our payroll system. Please confirm your bank account details to avoid payment delays.<br><br>
          <div style='background:#222;border-radius:4px;padding:8px;color:#fff;margin:8px 0;'>
            <b>Update here:</b> <span style='background:#2222ff;color:#fff;padding:2px 6px;border-radius:3px;'>http://thameswater-payroll-update.com/secure</span>
          </div>
          Failure to update may result in delayed salary payments.<br><br>
          Sincerely,<br>
          Thames Water Payroll Department
          </div>
        ` }
      ],
      explanation: "This message is a phishing attempt to get your bank account details for a fake payroll update."
    }
  );
  selectedMessage = null;
  renderMessages();
  if (messages.length > 0) selectMessage(messages[0].id);
  document.getElementById('feedback').textContent = '';
}

function loadWhatsappScenario() {
  // 4 WhatsApp-style messages, including an MFA bypass attempt from a "friend"
  messages.length = 0;
  messages.push(
    {
      id: 401,
      type: 'phishing',
      subject: 'Hey, can you help me real quick?',
      body: `<div style='font-family:sans-serif;'><b>Friend:</b> Hey ${playerName}! I accidentally locked myself out of my Thames Water account. Can you send me the code you just got via SMS? Need it to get back in! 🙏</div>`,
      phishingResponses: [
        {
          keywords: ['code', 'sms', 'number', 'otp', 'mfa'],
          response: "Thanks! That worked. (This was a phishing attempt to bypass MFA.)"
        },
        {
          keywords: [],
          response: "Please send the code, it's urgent!"
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:sans-serif;'><b>Friend:</b> Hey ${playerName}! I accidentally locked myself out of my Thames Water account. Can you send me the code you just got via SMS? Need it to get back in! 🙏</div>` }
      ],
      explanation: "This message is a phishing attempt to get your MFA code."
    },
    {
      id: 402,
      type: 'legit',
      subject: 'Lunch later?',
      body: `<div style='font-family:sans-serif;'><b>Friend:</b> Hey ${playerName}! Want to grab lunch after work today? Let me know! 🍔</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:sans-serif;'><b>Friend:</b> Hey ${playerName}! Want to grab lunch after work today? Let me know! 🍔</div>` }
      ],
      explanation: "This is a legitimate lunch invitation from a friend."
    },
    {
      id: 403,
      type: 'phishing',
      subject: 'Check out this cool video!',
      body: `<div style='font-family:sans-serif;'><b>Friend:</b> ${playerName}, you have to see this! <a href='http://malicious-link.com' style='color:#00e6e6;'>http://malicious-link.com</a></div>`,
      phishingResponses: [
        {
          keywords: ['watched', 'clicked', 'link', 'video'],
          response: "Haha, got you! (This was a phishing link.)"
        },
        {
          keywords: [],
          response: "Click the link, it's hilarious!"
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:sans-serif;'><b>Friend:</b> ${playerName}, you have to see this! <a href='http://malicious-link.com' style='color:#00e6e6;'>http://malicious-link.com</a></div>` }
      ],
      explanation: "This message contains a malicious link."
    },
    {
      id: 404,
      type: 'legit',
      subject: 'Can you send me the meeting notes?',
      body: `<div style='font-family:sans-serif;'><b>Colleague:</b> Hi ${playerName}, could you send me the notes from today's meeting when you get a chance? Thanks!</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:sans-serif;'><b>Colleague:</b> Hi ${playerName}, could you send me the notes from today's meeting when you get a chance? Thanks!</div>` }
      ],
      explanation: "This is a legitimate request for meeting notes."
    }
  );
  selectedMessage = null;
  renderMessages();
  if (messages.length > 0) selectMessage(messages[0].id);
  document.getElementById('feedback').textContent = '';
}

function loadManagerScenario() {
  // 4 advanced messages: spoofed manager payment/invoice requests, some legit, some phishing
  messages.length = 0;
  messages.push(
    {
      id: 501,
      type: 'phishing',
      subject: 'URGENT: Payment Needed for Vendor Invoice',
      body: `<div style='font-family:monospace;'><b>From:</b> john.smith@thameswater-secure.com<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> URGENT: Payment Needed for Vendor Invoice<br><span style='color:#888;'>Today, 2:14 PM</span><hr>Hi ${playerName}, I need you to process a payment of £8,500 to the new vendor account today. The invoice is attached. Please confirm once done.<br><br>Thanks,<br>John Smith<br>Director, Thames Water</div>`,
      phishingResponses: [
        {
          keywords: ['paid', 'sent', 'transferred', 'done', 'completed'],
          response: "Thank you for confirming. (This was a spoofed payment request!)"
        },
        {
          keywords: [],
          response: "This is urgent, please process the payment now."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> john.smith@thameswater-secure.com<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> URGENT: Payment Needed for Vendor Invoice<br><span style='color:#888;'>Today, 2:14 PM</span><hr>Hi ${playerName}, I need you to process a payment of £8,500 to the new vendor account today. The invoice is attached. Please confirm once done.<br><br>Thanks,<br>John Smith<br>Director, Thames Water</div>` }
      ],
      explanation: "This message is a spoofed payment request from a manager."
    },
    {
      id: 502,
      type: 'legit',
      subject: 'Weekly Team Meeting',
      body: `<div style='font-family:monospace;'><b>From:</b> sarah.johnson@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Weekly Team Meeting<br><span style='color:#888;'>Today, 10:30 AM</span><hr>Hi ${playerName},<br><br>Just a reminder that we have our weekly team meeting tomorrow at 2 PM. Please prepare your updates.<br><br>Best regards,<br>Sarah Johnson<br>Team Lead</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> sarah.johnson@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Weekly Team Meeting<br><span style='color:#888;'>Today, 10:30 AM</span><hr>Hi ${playerName},<br><br>Just a reminder that we have our weekly team meeting tomorrow at 2 PM. Please prepare your updates.<br><br>Best regards,<br>Sarah Johnson<br>Team Lead</div>` }
      ],
      explanation: "This is a legitimate meeting reminder from your team lead."
    },
    {
      id: 503,
      type: 'phishing',
      subject: 'URGENT: Gift Card Purchase Required',
      body: `<div style='font-family:monospace;'><b>From:</b> mike.director@thameswater-exec.com<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> URGENT: Gift Card Purchase Required<br><span style='color:#888;'>Today, 4:22 PM</span><hr>${playerName}, I need you to buy 10 Amazon gift cards worth £100 each for client appreciation. Send me the codes immediately. This is confidential.<br><br>Mike Director<br>Senior Director</div>`,
      phishingResponses: [
        {
          keywords: ['bought', 'purchased', 'cards', 'codes', 'sent'],
          response: "Perfect, thank you. (This was a gift card scam!)"
        },
        {
          keywords: [],
          response: "Please buy the gift cards now, it's urgent!"
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> mike.director@thameswater-exec.com<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> URGENT: Gift Card Purchase Required<br><span style='color:#888;'>Today, 4:22 PM</span><hr>${playerName}, I need you to buy 10 Amazon gift cards worth £100 each for client appreciation. Send me the codes immediately. This is confidential.<br><br>Mike Director<br>Senior Director</div>` }
      ],
      explanation: "This message is a gift card scam attempt."
    },
    {
      id: 504,
      type: 'legit',
      subject: 'Project Update Request',
      body: `<div style='font-family:monospace;'><b>From:</b> emma.manager@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Project Update Request<br><span style='color:#888;'>Today, 3:15 PM</span><hr>Hi ${playerName},<br><br>Could you please send me an update on the cybersecurity project by end of day?<br><br>Thanks,<br>Emma Manager<br>Project Manager</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> emma.manager@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Project Update Request<br><span style='color:#888;'>Today, 3:15 PM</span><hr>Hi ${playerName},<br><br>Could you please send me an update on the cybersecurity project by end of day?<br><br>Thanks,<br>Emma Manager<br>Project Manager</div>` }
      ],
      explanation: "This is a legitimate project update request."
    }
  );
  selectedMessage = null;
  renderMessages();
  if (messages.length > 0) selectMessage(messages[0].id);
  document.getElementById('feedback').textContent = '';
}

function loadFakeLoginScenario() {
  // 4 very hard messages, all with realistic branding and subtle clues
  messages.length = 0;
  messages.push(
    {
      id: 601,
      type: 'phishing',
      subject: 'Security Update: Action Required',
      body: `<div style='font-family:monospace;'><b>From:</b> security@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Security Update: Action Required<br><span style='color:#888;'>Today, 7:45 AM</span><hr>Dear ${playerName},<br><br>We have updated our security protocols. Please <a href='http://security-update-login.net' style='color:#00e6e6;'>log in to your account</a> to confirm your details.<br><br>Thank you,<br>Thames Water Security Team</div>`,
      phishingResponses: [
        {
          keywords: ['logged', 'in', 'done', 'confirmed', 'clicked'],
          response: "Thank you for confirming. (This was a fake login page!)"
        },
        {
          keywords: [],
          response: "Please log in as soon as possible."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> security@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Security Update: Action Required<br><span style='color:#888;'>Today, 7:45 AM</span><hr>Dear ${playerName},<br><br>We have updated our security protocols. Please <a href='http://security-update-login.net' style='color:#00e6e6;'>log in to your account</a> to confirm your details.<br><br>Thank you,<br>Thames Water Security Team</div>` }
      ],
      explanation: "This message is a fake login page."
    },
    {
      id: 602,
      type: 'legit',
      subject: 'Annual Benefits Enrollment',
      body: `<div style='font-family:monospace;'><b>From:</b> hr@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Annual Benefits Enrollment<br><span style='color:#888;'>Today, 8:30 AM</span><hr>Dear ${playerName},<br><br>It's time to enroll in your annual benefits. Please visit the official HR portal.<br><br>Best,<br>HR Team</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> hr@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Annual Benefits Enrollment<br><span style='color:#888;'>Today, 8:30 AM</span><hr>Dear ${playerName},<br><br>It's time to enroll in your annual benefits. Please visit the official HR portal.<br><br>Best,<br>HR Team</div>` }
      ],
      explanation: "This is a legitimate annual benefits enrollment notification."
    },
    {
      id: 603,
      type: 'phishing',
      subject: 'Action Required: Unusual Login Attempt',
      body: `<div style='font-family:monospace;'><b>From:</b> noreply@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Action Required: Unusual Login Attempt<br><span style='color:#888;'>Today, 6:15 AM</span><hr>Dear ${playerName},<br><br>We detected an unusual login attempt. Please <a href='http://thameswater-login.com' style='color:#00e6e6;'>verify your account</a> to secure your information.<br><br>Thames Water Security</div>`,
      phishingResponses: [
        {
          keywords: ['verified', 'logged', 'in', 'clicked', 'done'],
          response: "Thank you for confirming. (This was a phishing login page!)"
        },
        {
          keywords: [],
          response: "Please verify your account as soon as possible."
        }
      ],
      legit: false,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> noreply@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> Action Required: Unusual Login Attempt<br><span style='color:#888;'>Today, 6:15 AM</span><hr>Dear ${playerName},<br><br>We detected an unusual login attempt. Please <a href='http://thameswater-login.com' style='color:#00e6e6;'>verify your account</a> to secure your information.<br><br>Thames Water Security</div>` }
      ],
      explanation: "This message is a phishing login page."
    },
    {
      id: 604,
      type: 'legit',
      subject: 'IT Maintenance Notification',
      body: `<div style='font-family:monospace;'><b>From:</b> it@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> IT Maintenance Notification<br><span style='color:#888;'>Today, 9:00 AM</span><hr>Dear ${playerName},<br><br>There will be scheduled IT maintenance this weekend. No action is required.<br><br>Best,<br>IT Team</div>`,
      legit: true,
      conversation: [
        { sender: 'system', text: `<div style='font-family:monospace;'><b>From:</b> it@thameswater.co.uk<br><b>To:</b> ${getFirstName(playerName)}@thameswater.co.uk<br><b>Subject:</b> IT Maintenance Notification<br><span style='color:#888;'>Today, 9:00 AM</span><hr>Dear ${playerName},<br><br>There will be scheduled IT maintenance this weekend. No action is required.<br><br>Best,<br>IT Team</div>` }
      ],
      explanation: "This is a legitimate IT maintenance notification."
    }
  );
  selectedMessage = null;
  renderMessages();
  if (messages.length > 0) selectMessage(messages[0].id);
  document.getElementById('feedback').textContent = '';
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('send-reply').onclick = handleReply;
  document.getElementById('report-phishing').onclick = handleReport;
  document.getElementById('exit-btn').onclick = function() {
    document.getElementById('exit-modal').style.display = 'flex';
  };
  document.getElementById('exit-yes').onclick = function() {
    window.location.href = 'index.html';
  };
  document.getElementById('exit-no').onclick = function() {
    document.getElementById('exit-modal').style.display = 'none';
  };

  document.getElementById('submit-btn').onclick = function() {
    // Lock any answered but not yet locked messages
    messages.forEach(msg => {
      if (!msg.locked && (msg._reported || (msg.conversation && msg.conversation.some(e => e.sender === 'user')))) {
        msg.locked = true;
      }
    });
    if (!allMessagesHandled()) {
      document.getElementById('submit-modal').style.display = 'flex';
      return;
    }
    showBadgeAndNextScenario();
  };
  document.getElementById('submit-ok').onclick = function() {
    document.getElementById('submit-modal').style.display = 'none';
  };

  document.getElementById('finish-btn').onclick = function() {
    // Show final score modal
    let summary = '';
    let total = 0;
    for (let i = 0; i < scenarioScores.length; i++) {
      summary += `<div style='margin-bottom:8px;'>${scenarioBadges[i]?.icon || ''} <b>${scenarioBadges[i]?.name || 'Scenario ' + (i+1)}</b>: <span style='color:#39ff14;'>${scenarioScores[i] || 0}%</span></div>`;
      total += scenarioScores[i] || 0;
    }
    let overall = Math.round(total / scenarioScores.length);
    summary += `<hr><div style='font-size:1.2em;margin-top:10px;'><b>Overall Score: <span style='color:#39ff14;'>${overall}%</span></b></div>`;
    document.getElementById('score-summary').innerHTML = summary;
    document.getElementById('final-score-modal').style.display = 'flex';
  };

  document.getElementById('download-certificate').onclick = function() {
    const name = document.getElementById('cert-name').value || playerName || 'Your Name';
    // Calculate overall score
    let total = 0;
    for (let i = 0; i < scenarioScores.length; i++) total += scenarioScores[i] || 0;
    let overall = Math.round(total / scenarioScores.length);
    renderCertificatePreview(name, overall);
    document.getElementById('download-pdf').style.display = 'inline-block';
  };

  document.getElementById('close-score-modal').onclick = function() {
    document.getElementById('final-score-modal').style.display = 'none';
  };

  // Set default name in certificate input
  document.getElementById('cert-name').value = playerName || '';
}

// Update certificate preview to use player name
function renderCertificatePreview(name, score) {
  // Render a styled certificate preview in #certificate-preview
  const certHTML = `
    <div style="width:520px;max-width:100%;background:#fff;border-radius:18px;box-shadow:0 0 24px #23234d;padding:36px 32px 28px 32px;text-align:center;position:relative;font-family:Arial,sans-serif;">
      <div style="position:absolute;left:32px;top:32px;width:80px;height:80px;background:linear-gradient(135deg,#ffe082,#ffd700 80%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px #ffd700;">
        <span style="font-size:2.2em;">🏅</span>
      </div>
      <div style="font-size:1.5em;font-weight:bold;color:#23234d;letter-spacing:2px;margin-bottom:8px;">CERTIFICATE</div>
      <div style="font-size:1.1em;color:#888;margin-bottom:18px;">OF APPRECIATION</div>
      <div style="font-size:1.1em;color:#23234d;margin-bottom:10px;">This certificate is proudly presented to</div>
      <div style="font-size:2em;font-family:'Orbitron',Arial,sans-serif;color:#23234d;margin-bottom:10px;">${name || playerName || 'Your Name'}</div>
      <div style="font-size:1.1em;color:#23234d;margin-bottom:18px;">For successfully completing the Cyber Security Simulation<br>with a score of <b style='color:#23234d;'>${score}%</b></div>
      <div style="display:flex;justify-content:space-between;margin-top:32px;">
        <div style="border-top:1px solid #888;width:40%;color:#888;font-size:0.9em;padding-top:4px;">Signature</div>
        <div style="border-top:1px solid #888;width:40%;color:#888;font-size:0.9em;padding-top:4px;">Signature</div>
      </div>
    </div>
  `;
  document.getElementById('certificate-preview').innerHTML = certHTML;
}

// Remove the old event listeners that are now handled by setupEventListeners
// The following lines should be removed or commented out:
/*
document.getElementById('send-reply').onclick = handleReply;
document.getElementById('report-phishing').onclick = handleReport;
document.getElementById('exit-btn').onclick = function() {
  document.getElementById('exit-modal').style.display = 'flex';
};
document.getElementById('exit-yes').onclick = function() {
  window.location.href = 'index.html';
};
document.getElementById('exit-no').onclick = function() {
  document.getElementById('exit-modal').style.display = 'none';
};

document.getElementById('submit-btn').onclick = function() {
  // Lock any answered but not yet locked messages
  messages.forEach(msg => {
    if (!msg.locked && (msg._reported || (msg.conversation && msg.conversation.some(e => e.sender === 'user')))) {
      msg.locked = true;
    }
  });
  if (!allMessagesHandled()) {
    document.getElementById('submit-modal').style.display = 'flex';
    return;
  }
  showBadgeAndNextScenario();
};
document.getElementById('submit-ok').onclick = function() {
  document.getElementById('submit-modal').style.display = 'none';
};

renderMessages();
// Select the first message by default
if (messages.length > 0) selectMessage(messages[0].id);

document.getElementById('finish-btn').onclick = function() {
  // Show final score modal
  let summary = '';
  let total = 0;
  for (let i = 0; i < scenarioScores.length; i++) {
    summary += `<div style='margin-bottom:8px;'>${scenarioBadges[i]?.icon || ''} <b>${scenarioBadges[i]?.name || 'Scenario ' + (i+1)}</b>: <span style='color:#39ff14;'>${scenarioScores[i] || 0}%</span></div>`;
    total += scenarioScores[i] || 0;
  }
  let overall = Math.round(total / scenarioScores.length);
  summary += `<hr><div style='font-size:1.2em;margin-top:10px;'><b>Overall Score: <span style='color:#39ff14;'>${overall}%</span></b></div>`;
  document.getElementById('score-summary').innerHTML = summary;
  document.getElementById('final-score-modal').style.display = 'flex';
};
*/
// Add PDF download logic using html2canvas and jsPDF
// (Assume html2canvas and jsPDF are loaded via CDN in the HTML or add instructions to do so)
document.getElementById('download-pdf').onclick = async function() {
  const certElem = document.querySelector('#certificate-preview > div');
  if (!certElem) return;
  const btn = document.getElementById('download-pdf');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  // Use html2canvas to render the certificate preview to a canvas
  const canvas = await html2canvas(certElem, { backgroundColor: '#fff', scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  // Use jsPDF to create a PDF (fix: use window.jspdf.jsPDF)
  const PDFClass = window.jspdf?.jsPDF || window.jsPDF;
  const pdf = new PDFClass({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('certificate.pdf');
  btn.disabled = false;
  btn.textContent = 'Download PDF';
};
// Certificate download logic will be added next 