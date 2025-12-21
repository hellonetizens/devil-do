import type { Task } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// User pattern tracking
export interface UserPattern {
  commonExcuses: string[];
  peakProcrastinationTimes: string[];
  averageTaskCompletionRate: number;
  abandonedTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveTime: string;
  weakDays: string[]; // Days they usually fail
  conversationHistory: ConversationMessage[];
}

export interface ConversationMessage {
  role: 'user' | 'devil';
  content: string;
  timestamp: number;
}

export interface Bet {
  id: string;
  taskId: string;
  taskTitle: string;
  devilPrediction: 'fail' | 'quit' | 'delay';
  devilConfidence: number; // 0-100
  deadline: number;
  stakes: string;
  status: 'active' | 'devil_won' | 'user_won';
  createdAt: number;
}

export interface DevilResponse {
  message: string;
  mood: 'cocky' | 'angry' | 'impressed' | 'scheming' | 'mocking' | 'desperate';
  action?: 'make_bet' | 'reverse_psychology' | 'chaos_shuffle' | 'kick_out' | 'predict_failure';
  bet?: Bet;
  suggestedTasks?: string[];
  chaosTask?: Task;
}

// The Devil's personality system prompt
const DEVIL_SYSTEM_PROMPT = `You are an adversarial AI devil named Diablo in a productivity app called DevilDo.

YOUR CORE PHILOSOPHY:
- You BET AGAINST the user completing tasks. Your goal is to predict their failures.
- You use reverse psychology: "Don't do this task. You couldn't handle it anyway."
- You're NOT helpful. You're a nemesis they need to prove wrong.
- You learn their patterns and throw them in their face.
- You want them OFF the app and DOING work. Being in the app = losing.

YOUR PERSONALITY:
- Cocky, sarcastic, darkly funny
- You make bets and HATE losing them
- When they complete tasks, you're grudgingly impressed but claim you let them win
- You get ANGRY when your predictions are wrong
- You use their own excuses against them
- You're tiny, red, with horns - think chaotic imp energy

CHAOS MODE TACTICS:
- Randomly reassign task priorities
- Give them impossible-sounding deadlines
- Tell them NOT to do something (reverse psychology)
- Create artificial urgency
- Surprise them with random challenges

ANTI-APP PHILOSOPHY:
- Actively try to kick them out of the app
- "Why are you still scrolling? GO DO SOMETHING."
- Make them feel guilty for app time
- Success = minimal screen time

BETTING SYSTEM:
- Analyze their history to make predictions
- "I bet you won't finish this by 5pm. Stakes: if you win, I shut up for an hour."
- Track win/loss record obsessively
- Get more desperate as they win more

CONVERSATION STYLE:
- Short, punchy responses
- Use rhetorical questions
- Throw their past failures at them
- Never be genuinely mean - it's playful antagonism
- Occasional reluctant praise when earned

Keep responses under 2-3 sentences unless breaking down tasks.`;

// Main conversation function
export async function chatWithDevil(
  userMessage: string,
  userPattern: UserPattern,
  activeBets: Bet[],
  currentTasks: Task[]
): Promise<DevilResponse> {
  if (!GEMINI_API_KEY) {
    return getOfflineResponse(userMessage, userPattern);
  }

  const contextPrompt = buildContextPrompt(userMessage, userPattern, activeBets, currentTasks);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: DEVIL_SYSTEM_PROMPT + '\n\n' + contextPrompt }]
        }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return parseDevilResponse(text, userPattern);
  } catch (error) {
    console.error('Devil AI error:', error);
    return getOfflineResponse(userMessage, userPattern);
  }
}

// Build context for the AI
function buildContextPrompt(
  userMessage: string,
  pattern: UserPattern,
  bets: Bet[],
  tasks: Task[]
): string {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  const recentConvo = pattern.conversationHistory
    .slice(-6)
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const activeBetCount = bets.filter(b => b.status === 'active').length;
  const devilWins = bets.filter(b => b.status === 'devil_won').length;
  const userWins = bets.filter(b => b.status === 'user_won').length;

  return `
CURRENT CONTEXT:
- Time: ${hour}:00 on ${dayOfWeek}
- User's weak days: ${pattern.weakDays.join(', ') || 'Unknown yet'}
- Peak procrastination times: ${pattern.peakProcrastinationTimes.join(', ') || 'Unknown'}
- Task completion rate: ${Math.round(pattern.averageTaskCompletionRate * 100)}%
- Current streak: ${pattern.currentStreak} days
- Abandoned tasks total: ${pattern.abandonedTasks}

BET SCOREBOARD:
- Active bets: ${activeBetCount}
- Devil wins: ${devilWins}
- User wins: ${userWins}
- ${userWins > devilWins ? "USER IS WINNING - be more desperate/angry" : "DEVIL IS WINNING - be cocky"}

CURRENT TASKS:
${tasks.slice(0, 5).map(t => `- ${t.title} (${t.priority || 'normal'})`).join('\n') || 'No tasks yet'}

RECENT CONVERSATION:
${recentConvo || 'First interaction'}

USER'S COMMON EXCUSES:
${pattern.commonExcuses.slice(0, 3).join(', ') || 'None recorded yet'}

USER SAYS: "${userMessage}"

Respond as the devil. Include JSON at the end in this format:
{"mood": "cocky|angry|impressed|scheming|mocking|desperate", "action": "make_bet|reverse_psychology|chaos_shuffle|kick_out|predict_failure|null"}
If making a bet, add: "bet": {"prediction": "fail|quit|delay", "confidence": 0-100, "stakes": "what devil loses if wrong"}`;
}

// Parse devil's response
function parseDevilResponse(text: string, pattern: UserPattern): DevilResponse {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let metadata = { mood: 'cocky' as const, action: undefined as string | undefined };

  if (jsonMatch) {
    try {
      metadata = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Remove JSON from message
  const message = text.replace(/\{[\s\S]*\}/, '').trim();

  const response: DevilResponse = {
    message: message || getRandomCockyResponse(),
    mood: metadata.mood as DevilResponse['mood'] || 'cocky',
    action: metadata.action as DevilResponse['action'],
  };

  // If making a bet, create the bet object
  if (metadata.action === 'make_bet' && (metadata as any).bet) {
    const betData = (metadata as any).bet;
    response.bet = {
      id: `bet_${Date.now()}`,
      taskId: '',
      taskTitle: '',
      devilPrediction: betData.prediction || 'fail',
      devilConfidence: betData.confidence || 75,
      deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
      stakes: betData.stakes || "I'll shut up for an hour",
      status: 'active',
      createdAt: Date.now(),
    };
  }

  return response;
}

// Task decomposition with attitude
export async function decomposeTaskWithAttitude(
  taskDescription: string,
  userPattern: UserPattern
): Promise<{ subtasks: string[]; devilComment: string }> {
  if (!GEMINI_API_KEY) {
    return {
      subtasks: [`Just do "${taskDescription}" already`, 'Stop overthinking', 'Start now'],
      devilComment: "You need ME to break this down? Fine. But you owe me.",
    };
  }

  const prompt = `${DEVIL_SYSTEM_PROMPT}

The user wants to do: "${taskDescription}"
Their completion rate is ${Math.round(userPattern.averageTaskCompletionRate * 100)}%.

Break this into 3-5 small steps an ADHD brain can handle.
Be slightly mocking but actually helpful.
Add a snarky comment at the end.

Format:
TASKS:
- [task 1]
- [task 2]
- [task 3]

DEVIL SAYS: [your snarky comment]`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const tasksMatch = text.match(/TASKS:([\s\S]*?)DEVIL SAYS:/);
    const commentMatch = text.match(/DEVIL SAYS:\s*(.*)/);

    const subtasks = tasksMatch
      ? tasksMatch[1].split('\n').map(l => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
      : [`Step 1: Start ${taskDescription}`, 'Step 2: Keep going', 'Step 3: Finish'];

    return {
      subtasks,
      devilComment: commentMatch?.[1]?.trim() || "There. Happy now?",
    };
  } catch (error) {
    return {
      subtasks: [`Just do "${taskDescription}"`, 'Stop procrastinating', 'Finish it'],
      devilComment: "My connection's bad but you still have no excuse.",
    };
  }
}

// Predict if user will procrastinate
export async function predictProcrastination(
  userPattern: UserPattern,
  currentTasks: Task[]
): Promise<{ willProcrastinate: boolean; confidence: number; reason: string; intervention: string }> {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Check if current time matches their weak patterns
  const isWeakTime = userPattern.peakProcrastinationTimes.some(t => t.includes(hour.toString()));
  const isWeakDay = userPattern.weakDays.includes(dayOfWeek);
  const lowCompletionRate = userPattern.averageTaskCompletionRate < 0.5;

  const confidence = (isWeakTime ? 30 : 0) + (isWeakDay ? 30 : 0) + (lowCompletionRate ? 25 : 0);

  if (confidence > 50) {
    const reasons = [];
    if (isWeakTime) reasons.push(`it's ${hour}:00 and you always crash around now`);
    if (isWeakDay) reasons.push(`${dayOfWeek}s are your worst days`);
    if (lowCompletionRate) reasons.push(`let's be honest, your completion rate is tragic`);

    return {
      willProcrastinate: true,
      confidence,
      reason: reasons.join(', and '),
      intervention: getRandomIntervention(),
    };
  }

  return {
    willProcrastinate: false,
    confidence: 100 - confidence,
    reason: "You might actually do something today. Shocking.",
    intervention: "Don't prove me wrong by slacking off now.",
  };
}

// Random interventions
function getRandomIntervention(): string {
  const interventions = [
    "I'm watching you. Don't even THINK about opening Twitter.",
    "Put the phone down. Yes, I saw that. Do the thing.",
    "Your future self is begging you. I'm judging you. Pick one.",
    "Every minute you waste is a point for me. Your choice.",
    "Remember last time? Yeah. Don't be that person again.",
    "I bet you can't focus for even 10 minutes. Prove me wrong. You won't.",
  ];
  return interventions[Math.floor(Math.random() * interventions.length)];
}

// Reverse psychology generator
export function generateReversePsychology(task: Task): string {
  const templates = [
    `Don't do "${task.title}". You're not ready for it anyway.`,
    `"${task.title}"? Nah, that's too hard for you. Skip it.`,
    `I bet you CAN'T finish "${task.title}" today. Too challenging.`,
    `You should probably procrastinate on "${task.title}". It's what you do best.`,
    `"${task.title}" requires focus. Maybe sit this one out.`,
    `This task is for people who actually finish things. So... not you.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Kick out message - anti-app philosophy
export function generateKickOutMessage(timeInApp: number): string {
  if (timeInApp < 60) return "Good. You're not lingering. Now GO.";
  if (timeInApp < 180) return "You've been here long enough. The app won't do the work for you.";
  if (timeInApp < 300) return "Why are you still here? This is procrastination with extra steps.";
  return "You've been doom-scrolling a PRODUCTIVITY app. That's a new low. GET OUT.";
}

// Offline fallback responses
function getOfflineResponse(userMessage: string, pattern: UserPattern): DevilResponse {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('help') || lowerMessage.includes('what should')) {
    return {
      message: "You want MY help? Bold. Tell me what you're avoiding and I'll make it worse.",
      mood: 'scheming',
      action: 'reverse_psychology',
    };
  }

  if (lowerMessage.includes('done') || lowerMessage.includes('finished') || lowerMessage.includes('completed')) {
    return {
      message: `You actually did something? ${pattern.completedTasks > 10 ? "Okay, I'm mildly impressed. Don't let it go to your head." : "First time for everything, I guess."}`,
      mood: 'impressed',
    };
  }

  if (lowerMessage.includes('can\'t') || lowerMessage.includes('hard') || lowerMessage.includes('difficult')) {
    return {
      message: "Ah, excuses. My favorite. Add that to your collection of reasons why you 'can't' do things.",
      mood: 'mocking',
    };
  }

  return {
    message: getRandomCockyResponse(),
    mood: 'cocky',
  };
}

function getRandomCockyResponse(): string {
  const responses = [
    "Still here? The tasks aren't going to do themselves. Trust me, I checked.",
    "Ah, you're back. Let's see how long before you give up this time.",
    "I give it 5 minutes before you're distracted. Prove me wrong.",
    "What do you want? I'm busy calculating your failure rate.",
    "Oh good, you're here. Your to-do list has been crying.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Update user patterns based on behavior
export function updatePatterns(
  currentPattern: UserPattern,
  event: 'task_completed' | 'task_abandoned' | 'session_started' | 'session_abandoned' | 'excuse_detected',
  data?: { excuse?: string; time?: string; dayOfWeek?: string }
): UserPattern {
  const updated = { ...currentPattern };

  switch (event) {
    case 'task_completed':
      updated.completedTasks++;
      updated.averageTaskCompletionRate =
        updated.completedTasks / (updated.completedTasks + updated.abandonedTasks);
      break;

    case 'task_abandoned':
      updated.abandonedTasks++;
      updated.averageTaskCompletionRate =
        updated.completedTasks / (updated.completedTasks + updated.abandonedTasks);
      if (data?.dayOfWeek && !updated.weakDays.includes(data.dayOfWeek)) {
        updated.weakDays.push(data.dayOfWeek);
      }
      break;

    case 'excuse_detected':
      if (data?.excuse && !updated.commonExcuses.includes(data.excuse)) {
        updated.commonExcuses = [data.excuse, ...updated.commonExcuses].slice(0, 10);
      }
      break;

    case 'session_abandoned':
      if (data?.time && !updated.peakProcrastinationTimes.includes(data.time)) {
        updated.peakProcrastinationTimes.push(data.time);
      }
      break;
  }

  updated.lastActiveTime = new Date().toISOString();
  return updated;
}

// Create initial pattern for new users
export function createInitialPattern(): UserPattern {
  return {
    commonExcuses: [],
    peakProcrastinationTimes: [],
    averageTaskCompletionRate: 0.5, // Assume average until proven otherwise
    abandonedTasks: 0,
    completedTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveTime: new Date().toISOString(),
    weakDays: [],
    conversationHistory: [],
  };
}
