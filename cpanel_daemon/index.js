const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { execFile, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_DIR = '/home8/aashutos/repositories/lovekod';
const AGY_BIN = '/home8/aashutos/.local/bin/agy';

function stripAnsi(str) {
    return (str || '').replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

// ── Job Queue: one task at a time per chat to prevent CloudLinux process exhaustion ──
const chatQueues = {};   // { chatId: [ {taskFn, msg}, ... ] }
const chatBusy = {};     // { chatId: true/false }

function enqueue(chatId, taskFn) {
    if (!chatQueues[chatId]) chatQueues[chatId] = [];
    chatQueues[chatId].push(taskFn);
    processQueue(chatId);
}

async function processQueue(chatId) {
    if (chatBusy[chatId]) return;
    if (!chatQueues[chatId] || chatQueues[chatId].length === 0) return;
    chatBusy[chatId] = true;
    const task = chatQueues[chatId].shift();
    try {
        await task();
    } catch (e) {
        console.error('[QUEUE ERROR]', e);
    }
    chatBusy[chatId] = false;
    processQueue(chatId);   // pick up next in line
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_session'));
    
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                setTimeout(startBot, 5000);
            }
        } else if (connection === 'open') {
            console.log('>>> [SUCCESS] WHATSAPP CONNECTED 24/7 ON CPANEL CLOUD! <<<');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (!msg.message) continue;

            const isImage = !!msg.message.imageMessage;
            let text = (
                msg.message.conversation || 
                msg.message.extendedTextMessage?.text || 
                msg.message.imageMessage?.caption || 
                ''
            ).trim();

            const sender = msg.key.remoteJid;
            const isFromMe = !!msg.key.fromMe;
            const pushName = msg.pushName || (isFromMe ? 'Owner' : 'User');

            // Prevent bot from looping on its own "from AI" messages
            if (/^from\s*ai/i.test(text)) continue;

            // Check if user is replying (quoting) to an earlier message
            const contextInfo = msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo;
            const quotedMessage = contextInfo?.quotedMessage;
            const quotedText = (
                quotedMessage?.conversation ||
                quotedMessage?.extendedTextMessage?.text ||
                quotedMessage?.imageMessage?.caption || 
                ''
            ).trim();

            const isReplyingToAI = /from\s*ai/i.test(quotedText);
            const triggerPattern = /hey\s+antigravity/i;
            const hasWakeWord = triggerPattern.test(text);

            if (!hasWakeWord && !isReplyingToAI) {
                continue;
            }

            console.log(`[TRIGGER] (FromMe:${isFromMe} ReplyToAI:${isReplyingToAI} Image:${isImage}) ${pushName}: "${text}"`);

            // Extract prompt
            let prompt = text;
            if (hasWakeWord) {
                prompt = text.replace(triggerPattern, '').replace(/^[:,\s]+/, '').trim();
            }

            // Handle exit
            if (/^(exit|quit|stop|end|bye)$/i.test(prompt)) {
                await sock.sendMessage(sender, {
                    text: `from AI: 👋 Standing down. Say "Hey Antigravity" anytime you need me.`
                }, { quoted: msg });
                return;
            }

            // If queue already has tasks, tell user it's queued
            if (chatBusy[sender]) {
                await sock.sendMessage(sender, {
                    text: `from AI: ⏳ I'm currently working on a task. Your request is queued and will execute automatically next.`
                }, { quoted: msg });
            }

            // Capture variables for the queue closure
            const capturedMsg = msg;
            const capturedText = text;
            const capturedPrompt = prompt;
            const capturedIsImage = isImage;
            const capturedQuotedText = quotedText;
            const capturedIsReplyingToAI = isReplyingToAI;
            const capturedHasWakeWord = hasWakeWord;

            enqueue(sender, async () => {
                // Show typing indicator
                try { await sock.sendPresenceUpdate('composing', sender); } catch (e) {}

                let hasDownloadedImage = false;
                if (capturedIsImage) {
                    try {
                        const buffer = await downloadMediaMessage(
                            capturedMsg, 'buffer', {},
                            { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
                        );
                        const imagePath = path.join(REPO_DIR, 'incoming_screenshot.jpg');
                        fs.writeFileSync(imagePath, buffer);
                        hasDownloadedImage = true;
                        console.log(`[IMAGE] Saved ${buffer.length} bytes to ${imagePath}`);
                    } catch (err) {
                        console.error("Image download failed:", err);
                    }
                }

                // Build a CLEAN prompt — never include raw error text or command strings
                let taskPrompt = '';
                if (hasDownloadedImage) {
                    const userInstr = capturedPrompt || 'Inspect this screenshot and update the code accordingly';
                    taskPrompt = `Look at the file incoming_screenshot.jpg in the repository root. The user says: "${userInstr}". Analyze the image and make the requested changes to the codebase.`;
                } else if (!capturedPrompt) {
                    taskPrompt = `The user said "${capturedText}". Greet them naturally in 1-2 sentences as Antigravity AI on cPanel, and mention you are ready to help with the lovekod project.`;
                } else if (capturedIsReplyingToAI && capturedQuotedText) {
                    let cleanCtx = capturedQuotedText
                        .replace(/^from\s*ai:\s*/i, '')
                        .replace(/Execution error:[\s\S]*/i, '')
                        .replace(/Command failed:[\s\S]*/i, '')
                        .replace(/Notice:[\s\S]*/i, '')
                        .replace(/\/home8\/[\S]*/g, '')
                        .replace(/--\w[\w-]*/g, '')
                        .trim()
                        .slice(0, 200);
                    
                    if (cleanCtx.length > 10) {
                        taskPrompt = `You previously told the user: "${cleanCtx}". Now they say: "${capturedPrompt}". Continue helping them with the lovekod codebase.`;
                    } else {
                        taskPrompt = `The user says: "${capturedPrompt}". Help them with the lovekod codebase.`;
                    }
                } else {
                    taskPrompt = `The user says: "${capturedPrompt}". Help them with the lovekod codebase.`;
                }

                console.log(`[AGY] Running task prompt (${taskPrompt.length} chars)`);

                // Send immediate progress acknowledgment so WhatsApp user knows work started
                try {
                    await sock.sendMessage(sender, {
                        text: `from AI: ⚡ *Antigravity Working...*\nInstruction: _"${(capturedPrompt || 'Analyze image & modify code').slice(0, 100)}"_\nWorking inside \`lovekod\` repository...`
                    }, { quoted: capturedMsg });
                } catch (e) {}

                // Keep typing indicator alive
                const typingInterval = setInterval(async () => {
                    try { await sock.sendPresenceUpdate('composing', sender); } catch (e) {}
                }, 4000);

                // Run agy with 10-minute timeout
                await new Promise((resolve) => {
                    execFile(AGY_BIN, ['--dangerously-skip-permissions', '--print', taskPrompt], {
                        cwd: REPO_DIR,
                        timeout: 600000,
                        maxBuffer: 1024 * 1024 * 25
                    }, async (err, stdout, stderr) => {
                        clearInterval(typingInterval);
                        try { await sock.sendPresenceUpdate('paused', sender); } catch (e) {}

                        let response = stripAnsi((stdout || '').toString()).trim();

                        if (!response && stderr) {
                            response = stripAnsi(stderr.toString()).trim();
                        }

                        if (!response && err) {
                            if (err.killed || err.signal === 'SIGTERM') {
                                response = 'The task timed out (took longer than 10 minutes). Try breaking it into smaller steps.';
                            } else {
                                response = 'Something went wrong while processing your request. Please try rephrasing or sending a simpler instruction.';
                                console.error('[AGY CRASH]', err.message);
                            }
                        }

                        if (!response) {
                            response = 'Done! The task completed successfully.';
                        }

                        // Check if code was modified and run automated build & live deployment
                        let deploymentNote = '';
                        try {
                            const gitStatus = execSync('git status --porcelain', { cwd: REPO_DIR }).toString().trim();
                            if (gitStatus.length > 0) {
                                console.log('[DEPLOY HOOK] Code changes detected:\n' + gitStatus);
                                execSync('npm run build && cp -rf dist/* /home8/aashutos/lovekod.com/ && cp -rf dist/* /home8/aashutos/public_html/ && cp -f dist/.htaccess /home8/aashutos/public_html/.htaccess', { cwd: REPO_DIR, timeout: 120000 });
                                
                                if (gitStatus.includes('backend/')) {
                                    execSync('cp -rf backend/* /home8/aashutos/backend/ && mkdir -p /home8/aashutos/backend/tmp && touch /home8/aashutos/backend/tmp/restart.txt', { cwd: REPO_DIR });
                                    console.log('[DEPLOY HOOK] Backend restarted.');
                                }
                                deploymentNote = '\n\n🚀 *Live Deployed:* Changes built & published to lovekod.com.';
                            }
                        } catch (deployErr) {
                            console.error('[DEPLOY HOOK ERROR]', deployErr.message);
                            deploymentNote = '\n\n⚠️ *Deploy note:* Code was updated, but build encountered: ' + deployErr.message.slice(0, 100);
                        }

                        response += deploymentNote;

                        // Truncate if too long for WhatsApp
                        if (response.length > 3500) {
                            response = response.slice(0, 3500) + '\n\n...[Truncated]';
                        }

                        await sock.sendMessage(sender, {
                            text: `from AI: ${response}`
                        }, { quoted: capturedMsg });
                        console.log(`[REPLY] ${response.length} chars sent successfully`);
                        resolve();
                    });
                });
            });
        }
    });
}

startBot();
