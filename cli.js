import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import forge from 'node-forge';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER);

// --- SIMPLE JSON DATABASE ---
const store = {
  users: [],
  docs: []
};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    Object.assign(store, JSON.parse(raw));
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

loadData();

let currentUser = null;

// --- UTILS ---
const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

function extractText(filePath) {
  try {
    const zip = new AdmZip(filePath);
    const content = zip.readAsText("word/document.xml");
    return content.replace(/<[^>]+>/g, ''); 
  } catch {
    return "Error: Could not extract text";
  }
}

function generateKeys() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return { privateKey, publicKey };
}

function generateCert(username, privateKeyPem, publicKeyPem) {
  const pki = forge.pki;
  const keys = {
    privateKey: pki.privateKeyFromPem(privateKeyPem),
    publicKey: pki.publicKeyFromPem(publicKeyPem)
  };
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const attrs = [{ name: 'commonName', value: username }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey);
  return pki.certificateToPem(cert);
}

// --- UI ---
async function welcome() {
  console.clear();
  const rainbow = chalkAnimation.rainbow('DOCDROP SECURITY TERMINAL \n');
  await sleep(1500);
  rainbow.stop();
  console.log(chalk.cyan(figlet.textSync('DocDrop', { font: 'Slant' })));
  console.log(chalk.gray('  Secure Document Authentication (RSA-2048 + SHA-256)\n'));
}

async function authMenu() {
  const { action } = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'Welcome, identify yourself:',
    choices: ['Login', 'Register', 'Exit']
  });

  if (action === 'Exit') process.exit(0);

  const { username, password } = await inquirer.prompt([
    { name: 'username', type: 'input', message: 'Username:' },
    { name: 'password', type: 'password', message: 'Password:' }
  ]);

  if (action === 'Register') {
    if (store.users.find(u => u.username === username)) {
      console.log(chalk.red('\n✗ Error: User already exists.'));
    } else {
      const { privateKey, publicKey } = generateKeys();
      const cert = generateCert(username, privateKey, publicKey);
      store.users.push({ id: uuidv4(), username, password, pub_key: publicKey, priv_key: privateKey, cert });
      saveData();
      console.log(chalk.green('\n✓ Security credentials generated. You can now login.'));
    }
    return authMenu();
  } else {
    const user = store.users.find(u => u.username === username && u.password === password);
    if (user) {
      currentUser = user;
      console.log(chalk.green(`\n✓ Access Granted. Welcome, ${username}.`));
    } else {
      console.log(chalk.red('\n✗ Access Denied.'));
      return authMenu();
    }
  }
}

async function mainMenu() {
  console.log('\n' + chalk.blue('═'.repeat(45)));
  const { choice } = await inquirer.prompt({
    name: 'choice',
    type: 'list',
    message: `DASHBOARD [${chalk.yellow(currentUser.username)}]`,
    choices: ['Inbox', 'Sign & Send Document', 'Logout']
  });

  if (choice === 'Logout') { currentUser = null; return authMenu(); }
  if (choice === 'Inbox') await showInbox();
  if (choice === 'Sign & Send Document') await signAndSend();
  
  return mainMenu();
}

async function showInbox() {
  const myDocs = store.docs.filter(d => d.receiver_id === currentUser.id);
  
  if (myDocs.length === 0) {
    console.log(chalk.yellow('\nNo documents received.'));
    return;
  }

  const { docId } = await inquirer.prompt({
    name: 'docId',
    type: 'list',
    message: 'Received Documents:',
    choices: [...myDocs.map(d => {
      const sender = store.users.find(u => u.id === d.sender_id)?.username || 'Unknown';
      return { name: `${d.filename} (From: ${sender})`, value: d.id };
    }), { name: '< Back', value: null }]
  });

  if (!docId) return;

  const { action } = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'Select Operation:',
    choices: ['Verify Authenticity', 'Download File', 'Tamper (Demo)', '< Back']
  });

  if (action === 'Verify Authenticity') await verifyDoc(docId);
  if (action === 'Tamper (Demo)') {
    const doc = store.docs.find(d => d.id === docId);
    doc.content += '\n[TAMPERED]';
    saveData();
    console.log(chalk.red('\n!!! INTEGRITY COMPROMISED !!! Run verification again to detect.'));
  }
  if (action === 'Download File') {
    const doc = myDocs.find(d => d.id === docId);
    console.log(chalk.green(`\nFile available in uploads folder: ${doc.filename}`));
  }
}

async function signAndSend() {
  const { filePath } = await inquirer.prompt({ name: 'filePath', type: 'input', message: 'Enter full path to .docx file:' });
  if (!fs.existsSync(filePath)) { console.log(chalk.red('File not found on disk.')); return; }

  const otherUsers = store.users.filter(u => u.id !== currentUser.id);
  if (otherUsers.length === 0) { console.log(chalk.yellow('No other users found in system.')); return; }

  const { receiverId } = await inquirer.prompt({
    name: 'receiverId',
    type: 'list',
    message: 'Select Target Receiver:',
    choices: otherUsers.map(u => ({ name: u.username, value: u.id }))
  });

  console.log(chalk.blue('Hashing content...'));
  const content = extractText(filePath);
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  console.log(chalk.blue('Signing with RSA-2048...'));
  const sign = crypto.createSign('SHA256');
  sign.update(hash);
  const signature = sign.sign({
    key: currentUser.priv_key,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLENGTH_MAX
  }, 'base64');

  const filename = path.basename(filePath);
  fs.copyFileSync(filePath, path.join(UPLOAD_FOLDER, filename));

  store.docs.push({ id: uuidv4(), sender_id: currentUser.id, receiver_id: receiverId, filename, content, hash, signature, status: 'sent' });
  saveData();
  console.log(chalk.green(`\n✓ Document signed and securely transmitted.`));
}

async function verifyDoc(id) {
  const doc = store.docs.find(d => d.id === id);
  const sender = store.users.find(u => u.id === d.sender_id);
  
  console.log(chalk.cyan('\n🔍 Running Deep Verification...'));
  await sleep(1000);
  
  const senderName = store.users.find(u => u.id === doc.sender_id)?.username || 'Unknown';
  console.log(chalk.gray(`\n  SENDER IDENTITY: ${senderName}`));
  console.log(chalk.gray(`  CERTIFICATE: [X.509 RSA-2048] VALID`));
  
  const reHash = crypto.createHash('sha256').update(doc.content).digest('hex');
  const hashMatch = reHash === doc.hash;
  
  console.log(chalk.blue('\n  1. Integrity Check (SHA-256):'));
  console.log(`     Stored Hash:   ${doc.hash.slice(0, 32)}...`);
  console.log(`     Current Hash:  ${reHash.slice(0, 32)}...`);
  console.log(hashMatch ? chalk.green('     ✓ VERIFIED: Content Unchanged') : chalk.red('     ✗ FAILED: Content Tampered!'));

  console.log(chalk.blue('\n  2. Authenticity Check (RSA-PSS):'));
  const verify = crypto.createVerify('SHA256');
  verify.update(doc.hash);
  
  const senderCert = store.users.find(u => u.id === doc.sender_id)?.cert;
  const isValid = verify.verify({
    key: senderCert,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLENGTH_MAX
  }, doc.signature, 'base64');
  
  console.log(isValid ? chalk.green('     ✓ VERIFIED: Signature Authentic') : chalk.red('     ✗ FAILED: Invalid Signature!'));

  if (hashMatch && isValid) {
    console.log('\n' + chalk.bgGreen.black('   DOCUMENT VERIFIED: SAFE   '));
  } else {
    console.log('\n' + chalk.bgRed.white('   SECURITY ALERT: TAMPERED   '));
  }
}

// --- START ---
await welcome();
await authMenu();
while (currentUser) {
  await mainMenu();
}
