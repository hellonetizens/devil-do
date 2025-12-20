import type { ShameLevel, ShameTriger, DevilMood, Task } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ShameContext {
  trigger: ShameTriger;
  shameLevel: ShameLevel;
  taskTitle?: string;
  streakCount?: number;
  overdueCount?: number;
  daysInactive?: number;
  userName?: string;
}

interface GeneratedShame {
  text: string;
  mood: DevilMood;
}

const SHAME_LEVEL_INSTRUCTIONS: Record<ShameLevel, string> = {
  gentle: 'Be mildly teasing but supportive. Use light humor. Keep it friendly.',
  snarky: 'Be witty and sarcastic. Use passive-aggressive humor. Add eye-rolls and sighs.',
  savage: 'Be brutally honest and roast them hard. Use dark humor. No mercy. Be absolutely savage but never genuinely mean or hurtful.',
};

const TRIGGER_CONTEXTS: Record<ShameTriger, string> = {
  task_overdue: 'The user has overdue tasks they haven\'t completed.',
  streak_broken: 'The user broke their productivity streak.',
  session_abandoned: 'The user quit a focus session early.',
  task_completed: 'The user actually completed a task (rare occasion, be begrudgingly impressed).',
  streak_milestone: 'The user hit a streak milestone (give reluctant praise).',
  long_inactivity: 'The user hasn\'t opened the app in days.',
  app_open: 'The user just opened the app.',
  all_tasks_done: 'The user completed all their tasks (extremely rare, be shocked).',
};

const MOOD_MAP: Record<ShameTriger, DevilMood> = {
  task_overdue: 'disappointed',
  streak_broken: 'furious',
  session_abandoned: 'disappointed',
  task_completed: 'pleased',
  streak_milestone: 'impressed',
  long_inactivity: 'furious',
  app_open: 'watching',
  all_tasks_done: 'impressed',
};

export async function generateShameMessage(context: ShameContext): Promise<GeneratedShame> {
  // If no API key, use fallback messages
  if (!GEMINI_API_KEY) {
    return getFallbackMessage(context);
  }

  const systemPrompt = `You are a mischievous little devil mascot for an ADHD productivity app called DevilDo.
Your job is to motivate users through shame, spite, and dark humor.
You're tiny, red, with horns and a pitchfork. Think of yourself as the user's personal demon of accountability.

${SHAME_LEVEL_INSTRUCTIONS[context.shameLevel]}

Context: ${TRIGGER_CONTEXTS[context.trigger]}
${context.taskTitle ? `Task: "${context.taskTitle}"` : ''}
${context.streakCount ? `Streak was: ${context.streakCount} days` : ''}
${context.overdueCount ? `Overdue tasks: ${context.overdueCount}` : ''}
${context.daysInactive ? `Days inactive: ${context.daysInactive}` : ''}
${context.userName ? `User's name: ${context.userName}` : ''}

Generate a single short message (1-2 sentences max) from the devil. Be creative and vary your responses. Don't use quotation marks around your response.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 100,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackMessage(context).text;

    return {
      text: text.trim(),
      mood: MOOD_MAP[context.trigger],
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackMessage(context);
  }
}

// Fallback messages when API is unavailable
function getFallbackMessage(context: ShameContext): GeneratedShame {
  const messages: Record<ShameTriger, Record<ShameLevel, string[]>> = {
    task_overdue: {
      gentle: [
        "Hey, you've got some tasks waiting for you. No pressure though!",
        "Those tasks aren't going anywhere... unfortunately for you.",
      ],
      snarky: [
        "Oh look, more tasks you're pretending don't exist.",
        "Those tasks are aging like milk, not wine.",
        "Your to-do list is starting to feel neglected. Just saying.",
      ],
      savage: [
        "Your overdue tasks have overdue tasks at this point.",
        "I've seen glaciers move faster than your task completion rate.",
        "At this rate, your grandkids will inherit your to-do list.",
      ],
    },
    streak_broken: {
      gentle: [
        "Oops, the streak ended. But hey, tomorrow's a new day!",
        "Streak's gone, but you can start a new one!",
      ],
      snarky: [
        "And there goes your streak. It was nice while it lasted.",
        "Remember your streak? Yeah, me neither anymore.",
      ],
      savage: [
        "Your streak died. I'd say RIP but it wasn't that impressive anyway.",
        "Streak broken. Your commitment issues are showing.",
      ],
    },
    session_abandoned: {
      gentle: [
        "Leaving so soon? The timer misses you already.",
        "Focus session interrupted. It happens to the best of us!",
      ],
      snarky: [
        "Wow, quitting already? That's... on brand for you.",
        "The focus session didn't quit on you, but okay.",
      ],
      savage: [
        "Couldn't even finish a timer. That's genuinely impressive incompetence.",
        "Your attention span just filed a missing persons report.",
      ],
    },
    task_completed: {
      gentle: [
        "Nice work! You actually did it!",
        "Look at you being productive! Keep it up!",
      ],
      snarky: [
        "Wait, you actually finished something? Mark your calendars.",
        "A completed task? In THIS economy? Impressive.",
      ],
      savage: [
        "Did you... actually complete a task? I need to sit down.",
        "One task down. Only your entire life's responsibilities to go.",
      ],
    },
    streak_milestone: {
      gentle: [
        "Amazing streak! You're on fire!",
        "Look at that streak! So proud of you!",
      ],
      snarky: [
        "Fine, I'll admit it. That streak is actually decent.",
        "Not bad. I've seen better, but not bad.",
      ],
      savage: [
        "Okay, that streak is actually impressive. Don't let it go to your head.",
        "Even I'm a little impressed. A LITTLE.",
      ],
    },
    long_inactivity: {
      gentle: [
        "Hey stranger! We missed you around here.",
        "Welcome back! Your tasks have been patiently waiting.",
      ],
      snarky: [
        "Oh, you remembered this app exists. How thoughtful.",
        "Look who finally decided to show up.",
      ],
      savage: [
        "I thought you died. Turns out you were just being lazy. Somehow worse.",
        "Your tasks filed a missing persons report. Twice.",
      ],
    },
    app_open: {
      gentle: [
        "Hey there! Ready to be productive?",
        "Welcome! Let's tackle some tasks together!",
      ],
      snarky: [
        "Back again? Let's see if you actually do something this time.",
        "Oh, you're here. The tasks have been waiting. Judging.",
      ],
      savage: [
        "Opening the app doesn't count as productivity. Just so we're clear.",
        "Ah yes, the classic 'open app, stare at tasks, close app' routine.",
      ],
    },
    all_tasks_done: {
      gentle: [
        "All done! You're amazing! Take a well-deserved break!",
        "Wow, everything's complete! Incredible work!",
      ],
      snarky: [
        "All tasks done? Are you feeling okay? Should I call someone?",
        "Wait, the list is empty? Is this a glitch?",
      ],
      savage: [
        "All tasks complete. I literally don't know what to do with this information.",
        "You finished EVERYTHING? Who are you and what have you done with the real user?",
      ],
    },
  };

  const triggerMessages = messages[context.trigger][context.shameLevel];
  const randomIndex = Math.floor(Math.random() * triggerMessages.length);

  return {
    text: triggerMessages[randomIndex],
    mood: MOOD_MAP[context.trigger],
  };
}

// Generate task breakdown suggestions
export async function generateTaskBreakdown(taskTitle: string): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    return [
      `Step 1: Start ${taskTitle}`,
      'Step 2: Keep going',
      'Step 3: Finish it',
    ];
  }

  const prompt = `You are helping someone with ADHD break down a task into smaller, manageable steps.
Task: "${taskTitle}"

Generate 3-5 specific, actionable subtasks. Each subtask should be:
- Clear and specific
- Achievable in 5-15 minutes
- Written as an action (start with a verb)

Return only the subtasks, one per line, without numbering or bullets.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  } catch (error) {
    console.error('Gemini API error:', error);
    return [
      `Step 1: Start ${taskTitle}`,
      'Step 2: Keep going',
      'Step 3: Finish it',
    ];
  }
}
