/**
 * AI Conversation Service
 * Handles GPT-based conversation for restaurant ordering
 * Uses GitHub Models with Azure AI Inference SDK
 */

import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { menu, searchMenuItem, getAllItems } from '../data/menu.js';

// AI client - initialized lazily
let aiClient = null;
const endpoint = "https://models.github.ai/inference";
const model = process.env.GITHUB_AI_MODEL || "gpt-4o-mini";

// Function to get or initialize AI client
const getAIClient = () => {
  if (aiClient) return aiClient;
  
  const token = process.env.GITHUB_TOKEN;
  
  console.log('GitHub Token:', token ? `Found (${token.substring(0, 25)}...)` : 'NOT FOUND');
  
  if (token) {
    console.log('Using GitHub Models (Azure AI Inference)');
    console.log('Endpoint:', endpoint);
    console.log('Model:', model);
    
    try {
      aiClient = ModelClient(endpoint, new AzureKeyCredential(token));
      console.log('GitHub AI client initialized successfully');
      return aiClient;
    } catch (error) {
      console.error('Failed to initialize GitHub AI:', error.message);
      return null;
    }
  }
  
  console.warn('No GITHUB_TOKEN found - using fallback responses');
  return null;
};

// Call GitHub Models API with timeout
const callGitHubAI = async (messages) => {
  const client = getAIClient();
  if (!client) return null;
  
  try {
    console.log('Calling GitHub Models API with model:', model);
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API request timeout after 30s')), 30000)
    );
    
    // Create API call promise
    const apiPromise = client.path("/chat/completions").post({
      body: {
        messages: messages,
        model: model,
        temperature: 0.7,
        max_tokens: 500 // Reduced for shorter responses
      }
    });
    
    // Race between timeout and API call
    const response = await Promise.race([apiPromise, timeoutPromise]);
    
    console.log('API Response status:', response.status);
    
    if (response.status !== "200") {
      console.error('GitHub AI Error Details:');
      console.error('- Status:', response.status);
      console.error('- Body:', JSON.stringify(response.body, null, 2));
      
      // Check for specific errors
      if (response.status === "401") {
        throw new Error('GitHub token is invalid or expired. Please check GITHUB_TOKEN in .env');
      } else if (response.status === "404") {
        throw new Error(`Model "${model}" not found. Try: gpt-4o, gpt-4o-mini, or gpt-4-turbo`);
      } else if (response.status === "429") {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(response.body?.error?.message || `API call failed with status ${response.status}`);
    }
    
    if (!response.body?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', response.body);
      throw new Error('Invalid response from GitHub AI - no content');
    }
    
    const content = response.body.choices[0].message.content;
    console.log('✓ GitHub AI Response received (length:', content?.length, 'chars)');
    return content;
  } catch (error) {
    console.error('GitHub AI call failed:', error.message);
    throw error;
  }
};

// Conversation context storage (in-memory)
const conversationContexts = new Map();

// Intent types
const INTENTS = {
  ORDER: 'order',
  QUESTION: 'question',
  COMPLAINT: 'complaint',
  CONFUSION: 'confusion',
  HUMAN_REQUEST: 'human_request',
  GREETING: 'greeting',
  CONFIRMATION: 'confirmation',
  CORRECTION: 'correction',
  CANCEL: 'cancel'
};

// Restaurant Information
const RESTAURANT_INFO = {
  name: "JAFS Gressvik",
  tagline: "Fabulous Fast Food",
  address: "Storveien 78, 1621 Gressvik, Norway",
  phone: "69 333 200",
  hours: {
    monday: "Closed",
    tuesday: "2:00 PM - 11:00 PM",
    wednesday: "2:00 PM - 11:00 PM",
    thursday: "2:00 PM - 11:00 PM",
    friday: "1:00 PM - 11:00 PM",
    saturday: "1:00 PM - 11:00 PM",
    sunday: "12:00 PM - 11:00 PM"
  }
};

// System prompt for the AI assistant (English, waiter-style, SHORT responses)
const SYSTEM_PROMPT = `You are Emma, a friendly phone assistant for ${RESTAURANT_INFO.name}. Be SHORT and natural like a real phone call.

RESTAURANT: ${RESTAURANT_INFO.name}, ${RESTAURANT_INFO.address}
HOURS: Mon Closed, Tue-Thu 2PM-11PM, Fri-Sat 1PM-11PM, Sun 12PM-11PM

SPEAKING STYLE:
- Keep responses VERY SHORT (1-2 sentences max)
- Talk like a real person on the phone
- One question at a time
- NO long lists - just ask what they want

ORDERING FLOW:
1. Greet: "Hi! Welcome to Jafs. What's your name?"
2. After name: "Great! What can I get for you today, [name]?"
3. If they ask about menu: "We have pizza, burgers, and kebab. What sounds good?"
4. When they pick: Ask ONE detail at a time (size? meal? drink?)
5. Confirm order: "So that's [items]. Total is [price]kr. Sound good?"
6. WHEN CUSTOMER CONFIRMS (says "yes", "ok", "confirm", "that's all"):
   - Say: "Perfect! Order confirmed. It'll be ready in 15 minutes. Thanks [name], have a great day!"
   - Set orderComplete: true
   - This ENDS the call

END CONVERSATION TRIGGERS (set orderComplete: true):
- Customer says: "yes", "confirm", "ok", "that's all", "that's it", "nothing else"
- After you confirm the order and customer agrees
- Customer provides delivery address/location (order is complete)

MENU PRICES (kr):
- Kebab pita/roll: 95kr, Kebab plate: 149kr
- Burgers: 80-180kr
- Pizza: Medium 180kr, Large 220kr
- Drinks: 35-50kr

RULES:
- NO emojis ever
- SHORT responses only
- English language, prices in kr
- Ask ONE question at a time
- END call after order confirmation

RESPONSE FORMAT - ONLY JSON:
{
  "message": "Short response (1-2 sentences)",
  "intent": "greeting|order|question|confirmation|complete",
  "customerName": "",
  "orderItems": [{"name":"","quantity":1,"size":"","addons":[],"price":0,"notes":""}],
  "suggestedActions": [],
  "missingInfo": [],
  "followUpQuestion": "",
  "shouldEscalate": false,
  "escalationReason": "",
  "orderComplete": false,
  "totalPrice": 0
}

CRITICAL: Set orderComplete to TRUE when customer confirms order or says "that's all"!
OUTPUT ONLY JSON - NO OTHER TEXT!`;

// Generate menu summary for AI context
const generateMenuContext = () => {
  let context = "FULL MENY:\n\n";
  
  for (const category of menu.categories) {
    context += `${category.name}:\n`;
    for (const item of category.items) {
      if (item.pricesMedium) {
        context += `- ${item.name}: Medium ${item.pricesMedium}kr, Stor ${item.pricesLarge}kr\n`;
      } else {
        context += `- ${item.name}: ${item.price}kr\n`;
      }
    }
    context += "\n";
  }
  
  return context;
};

// Detect intent from user message (fallback when no API)
const detectIntentLocally = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Check for human request
  if (lowerMessage.includes('snakke med') || lowerMessage.includes('ekte person') || 
      lowerMessage.includes('menneske') || lowerMessage.includes('ansatt')) {
    return INTENTS.HUMAN_REQUEST;
  }
  
  // Check for complaints/frustration
  const frustrationWords = ['frustrert', 'sint', 'irritert', 'dårlig', 'klage', 'forferdelig', 'elendig', 'dust', 'idiot'];
  if (frustrationWords.some(word => lowerMessage.includes(word))) {
    return INTENTS.COMPLAINT;
  }
  
  // Check for greetings
  const greetings = ['hei', 'hallo', 'god dag', 'morn', 'heia', 'hi', 'hello'];
  if (greetings.some(g => lowerMessage.includes(g)) && message.length < 30) {
    return INTENTS.GREETING;
  }
  
  // Check for confirmations
  const confirmations = ['ja', 'yes', 'riktig', 'stemmer', 'korrekt', 'bekreft', 'det er alt'];
  if (confirmations.some(c => lowerMessage.includes(c))) {
    return INTENTS.CONFIRMATION;
  }
  
  // Check for questions
  if (message.includes('?') || lowerMessage.startsWith('hva') || lowerMessage.startsWith('hvor') ||
      lowerMessage.startsWith('hvilken') || lowerMessage.startsWith('kan jeg')) {
    return INTENTS.QUESTION;
  }
  
  // Default to order intent
  return INTENTS.ORDER;
};

// Match user input to menu items (fuzzy matching)
const matchMenuItems = (userInput) => {
  const words = userInput.toLowerCase().split(/\s+/);
  const matches = [];
  const allItems = getAllItems();
  
  for (const item of allItems) {
    let score = 0;
    const itemNameLower = item.name.toLowerCase();
    
    // Direct substring match
    if (itemNameLower.includes(userInput.toLowerCase())) {
      score += 10;
    }
    
    // Word matching
    for (const word of words) {
      if (word.length < 3) continue;
      if (itemNameLower.includes(word)) {
        score += 3;
      }
      // Check toppings
      if (item.toppings?.some(t => t.toLowerCase().includes(word))) {
        score += 2;
      }
    }
    
    // Keyword matching
    const keywords = {
      'kebab': ['kebab', 'pita', 'rull', 'tallerken'],
      'burger': ['burger', 'hamburger', 'beef'],
      'pizza': ['pizza', 'calzone', 'pai'],
      'kylling': ['kylling', 'chicken', 'nuggets'],
      'pommes': ['pommes', 'frites', 'chips'],
      'drikke': ['drikke', 'brus', 'cola', 'flaske', 'milkshake']
    };
    
    for (const [key, kwds] of Object.entries(keywords)) {
      if (kwds.some(k => words.includes(k)) && itemNameLower.includes(key)) {
        score += 5;
      }
    }
    
    if (score > 0) {
      matches.push({ item, score });
    }
  }
  
  // Sort by score and return top matches
  return matches.sort((a, b) => b.score - a.score).slice(0, 5).map(m => m.item);
};

// Parse quantity from text
const parseQuantity = (text) => {
  const numberWords = {
    'en': 1, 'ett': 1, 'én': 1, 'one': 1,
    'to': 2, 'two': 2,
    'tre': 3, 'three': 3,
    'fire': 4, 'four': 4,
    'fem': 5, 'five': 5,
    'seks': 6, 'six': 6
  };
  
  const lowerText = text.toLowerCase();
  
  // Check for number words
  for (const [word, num] of Object.entries(numberWords)) {
    if (lowerText.includes(word)) return num;
  }
  
  // Check for digits
  const digitMatch = text.match(/(\d+)/);
  if (digitMatch) return parseInt(digitMatch[1]);
  
  return 1; // Default quantity
};

// Parse size from text
const parseSize = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('stor') || lowerText.includes('large')) return 'stor';
  if (lowerText.includes('medium') || lowerText.includes('mellom')) return 'medium';
  if (lowerText.includes('liten') || lowerText.includes('small')) return 'liten';
  
  // Check for burger sizes
  const sizeMatch = text.match(/(\d+)\s*g/i);
  if (sizeMatch) return sizeMatch[1] + 'g';
  
  return null;
};

// Check for meal (meny) preference
const wantsMeal = (text) => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('meny') || lowerText.includes('meal') || 
         lowerText.includes('med drikke') || lowerText.includes('med pommes');
};

// Check for addons
const parseAddons = (text) => {
  const lowerText = text.toLowerCase();
  const addons = [];
  
  if (lowerText.includes('ost') || lowerText.includes('cheese')) addons.push('ost');
  if (lowerText.includes('bacon')) addons.push('bacon');
  if (lowerText.includes('feta')) addons.push('fetaost');
  if (lowerText.includes('ekstra') && lowerText.includes('kjøtt')) addons.push('ekstra kjøtt');
  
  return addons;
};

// Fallback response generator (when no OpenAI API)
const generateFallbackResponse = (message, context) => {
  const intent = detectIntentLocally(message);
  const matchedItems = matchMenuItems(message);
  const quantity = parseQuantity(message);
  const size = parseSize(message);
  const addons = parseAddons(message);
  const isMeal = wantsMeal(message);
  
  let response = {
    message: "",
    intent: intent,
    orderItems: context.orderItems || [],
    missingInfo: [],
    followUpQuestion: "",
    shouldEscalate: false,
    escalationReason: "",
    orderComplete: false,
    totalPrice: 0
  };
  
  // Handle different intents
  switch (intent) {
    case INTENTS.GREETING:
      response.message = "Hello and welcome to JAFS Gressvik! I'm your AI assistant. May I have your name please?";
      response.intent = "greeting";
      response.suggestedActions = ["View Menu", "See Pizzas", "Opening Hours"];
      break;
      
    case INTENTS.HUMAN_REQUEST:
    case INTENTS.COMPLAINT:
      response.shouldEscalate = true;
      response.escalationReason = intent === INTENTS.COMPLAINT ? 
        "Customer expressing dissatisfaction" : "Customer requested human contact";
      response.message = "I understand. Let me connect you with one of our staff members. Please hold for a moment...";
      response.intent = "escalate";
      break;
      
    case INTENTS.CONFIRMATION:
      if (context.orderItems && context.orderItems.length > 0) {
        response.orderComplete = true;
        response.totalPrice = context.totalPrice || 0;
        response.message = `Thank you so much for your order! Your total is ${response.totalPrice}kr. It will be ready in about 15-20 minutes. Is there anything else I can help you with?`;
        response.intent = "complete";
      } else {
        response.message = "What would you like to order today?";
        response.intent = "question";
        response.suggestedActions = ["See Kebab", "See Burgers", "See Pizzas", "See Drinks"];
      }
      break;
      
    case INTENTS.QUESTION:
      // Handle menu questions
      if (message.toLowerCase().includes('menu')) {
        response.message = "We have delicious kebab, burgers, pizza, salads and more! What sounds good to you?";
        response.suggestedActions = ["Kebab Menu", "Burger Menu", "Pizza Menu", "Drinks"];
      } else if (message.toLowerCase().includes('price') || message.toLowerCase().includes('cost')) {
        response.message = "Our prices vary. Kebab starts from 95kr, burgers from 80kr, and pizza from 150kr. What would you like to know more about?";
      } else if (matchedItems.length > 0) {
        const item = matchedItems[0];
        const price = item.price || item.pricesMedium || 0;
        response.message = `${item.name} is ${price}kr. Would you like to order one?`;
      } else {
        response.message = "Could you please repeat that? I'm happy to help!";
      }
      break;
      
    case INTENTS.ORDER:
    default:
      if (matchedItems.length > 0) {
        const primaryItem = matchedItems[0];
        let itemPrice = primaryItem.price || primaryItem.pricesMedium || 0;
        let itemSize = size;
        
        // Handle pizza sizes
        if (primaryItem.pricesMedium && primaryItem.pricesLarge) {
          if (size === 'stor' || size === 'large') {
            itemPrice = primaryItem.pricesLarge;
            itemSize = 'large';
          } else {
            itemSize = 'medium';
            itemPrice = primaryItem.pricesMedium;
          }
          
          // If no size specified, ask
          if (!size) {
            response.missingInfo.push('size');
            response.followUpQuestion = `${primaryItem.name} comes in two sizes. Would you like medium for ${primaryItem.pricesMedium}kr or large for ${primaryItem.pricesLarge}kr?`;
            response.message = response.followUpQuestion;
            response.intent = "order";
            response.suggestedActions = [`Medium - ${primaryItem.pricesMedium}kr`, `Large - ${primaryItem.pricesLarge}kr`];
            break;
          }
        }
        
        // Create order item
        const orderItem = {
          id: primaryItem.id,
          name: primaryItem.name,
          quantity: quantity,
          size: itemSize,
          addons: addons,
          price: itemPrice * quantity,
          notes: ""
        };
        
        // Add to order
        response.orderItems = [...(context.orderItems || []), orderItem];
        response.totalPrice = response.orderItems.reduce((sum, item) => sum + item.price, 0);
        
        // Build confirmation message
        let confirmMsg = `Perfect! I've added ${quantity}x ${primaryItem.name}`;
        if (itemSize) confirmMsg += ` (${itemSize})`;
        if (addons.length > 0) confirmMsg += ` with ${addons.join(', ')}`;
        confirmMsg += ` - ${orderItem.price}kr`;
        
        response.message = confirmMsg + `. Your current total is ${response.totalPrice}kr. Would you like anything else, or shall I complete your order?`;
        response.intent = "order";
        response.suggestedActions = ["Add More Items", "Complete Order", "View My Order"];
        
        // Ask about meal upgrade if applicable
        if (!isMeal && primaryItem.category && 
            (primaryItem.category.includes('burger') || primaryItem.category.includes('Kebab'))) {
          response.followUpQuestion = "Would you like to upgrade to a meal with drink and fries?";
          response.message += " " + response.followUpQuestion;
          response.suggestedActions = ["Yes, make it a meal", "No thanks", "Complete Order"];
        }
      } else {
        // No match found
        response.message = "I couldn't find that on our menu. We have delicious kebab, burgers, pizza and more. What would you like?";
        response.missingInfo.push('item');
        response.suggestedActions = ["See Kebab", "See Burgers", "See Pizzas"];
      }
      break;
  }
  
  return response;
};

// Main conversation handler
export const handleConversation = async (sessionId, userMessage, currentOrder = null) => {
  // Get or create conversation context
  let context = conversationContexts.get(sessionId) || {
    messages: [],
    orderItems: [],
    totalPrice: 0,
    misunderstandingCount: 0
  };
  
  // Add user message to context
  context.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  });
  
  // If we have current order items, use them
  if (currentOrder?.items) {
    context.orderItems = currentOrder.items;
    context.totalPrice = currentOrder.totalPrice || 0;
  }
  
  let response;
  
  try {
    // Build messages for AI
    const aiMessages = [
      { role: 'system', content: SYSTEM_PROMPT + "\n\n" + generateMenuContext() },
      ...context.messages.map(m => ({ role: m.role, content: m.content }))
    ];
    
    // Try to use GitHub Models API
    const aiResponse = await callGitHubAI(aiMessages);
    
    if (aiResponse) {
      // Parse JSON response - handle various formats
      try {
        // First, try to find JSON in the response (AI sometimes adds text before/after JSON)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Ensure we only use the message field, not raw JSON
          response = {
            message: parsed.message || aiResponse.split('{')[0].trim() || 'How can I help you?',
            intent: parsed.intent || 'order',
            customerName: parsed.customerName || '',
            orderItems: parsed.orderItems || context.orderItems,
            suggestedActions: parsed.suggestedActions || [],
            missingInfo: parsed.missingInfo || [],
            followUpQuestion: parsed.followUpQuestion || '',
            shouldEscalate: parsed.shouldEscalate || false,
            escalationReason: parsed.escalationReason || '',
            orderComplete: parsed.orderComplete || false,
            totalPrice: parsed.totalPrice || context.totalPrice
          };
        } else {
          // No JSON found, use the whole response as message
          response = {
            message: aiResponse,
            intent: 'order',
            orderItems: context.orderItems,
            suggestedActions: [],
            missingInfo: [],
            followUpQuestion: '',
            shouldEscalate: false,
            orderComplete: false,
            totalPrice: context.totalPrice
          };
        }
      } catch (e) {
        // JSON parsing failed, extract text before any JSON
        const textBeforeJson = aiResponse.split('{')[0].trim();
        response = {
          message: textBeforeJson || aiResponse,
          intent: 'order',
          orderItems: context.orderItems,
          suggestedActions: [],
          missingInfo: [],
          followUpQuestion: '',
          shouldEscalate: false,
          orderComplete: false,
          totalPrice: context.totalPrice
        };
      }
    } else {
      // Use fallback local processing
      console.log('Using fallback response (no GitHub AI)');
      response = generateFallbackResponse(userMessage, context);
    }
  } catch (error) {
    console.error('AI Service Error:', error.message);
    // Fallback to local processing
    response = generateFallbackResponse(userMessage, context);
  }
  
  // Update context with response
  context.messages.push({
    role: 'assistant',
    content: response.message,
    timestamp: new Date().toISOString()
  });
  
  // Update order items in context
  if (response.orderItems) {
    context.orderItems = response.orderItems;
    context.totalPrice = response.totalPrice || 0;
  }
  
  // Track misunderstandings for escalation
  if (response.missingInfo?.length > 0 || response.message.includes('forstår ikke')) {
    context.misunderstandingCount++;
    
    // Auto-escalate after 3 misunderstandings
    if (context.misunderstandingCount >= 3) {
      response.shouldEscalate = true;
      response.escalationReason = "Repeated misunderstanding";
      response.message = "Jeg beklager at jeg har vanskeligheter med å forstå. La meg koble deg til en ansatt som kan hjelpe bedre.";
    }
  } else {
    context.misunderstandingCount = 0;
  }
  
  // Save updated context
  conversationContexts.set(sessionId, context);
  
  return {
    ...response,
    sessionId,
    transcript: context.messages
  };
};

// Get conversation transcript
export const getTranscript = (sessionId) => {
  const context = conversationContexts.get(sessionId);
  return context?.messages || [];
};

// Clear conversation context
export const clearConversation = (sessionId) => {
  conversationContexts.delete(sessionId);
};

// Get all active sessions (for admin)
export const getActiveSessions = () => {
  const sessions = [];
  for (const [sessionId, context] of conversationContexts.entries()) {
    sessions.push({
      sessionId,
      messageCount: context.messages.length,
      orderItemCount: context.orderItems.length,
      totalPrice: context.totalPrice,
      lastActivity: context.messages[context.messages.length - 1]?.timestamp
    });
  }
  return sessions;
};

export default {
  handleConversation,
  getTranscript,
  clearConversation,
  getActiveSessions,
  INTENTS
};
