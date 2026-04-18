// --- VARIABEL GLOBAL ---
let namaUser = "";
let skor = 0;
let currentLevel = 1;      
let hasCollectedItem = false; 
let isRunning = false;     
let commandQueue = [];     

const dataMateri = [
    { t: '🍎', k: 'Apel' }, { t: '🐘', k: 'Gajah' },
    { t: '🦒', k: 'Jerapah' }, { t: '🦁', k: 'Singa' },
    { t: '🍦', k: 'Es Krim' }, { t: '🚗', k: 'Mobil' },
    { t: '🐵', k: 'Monyet' }, { t: '🍌', k: 'Pisang' }
];

// --- FUNGSI AWAL & NAVIGASI ---

function mulaiApp() {
    const input = document.getElementById('input-nama');
    if(!input.value) return alert("Halo! Siapa namamu?");
    namaUser = input.value;
    document.getElementById('user-nama').innerText = namaUser;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    const music = document.getElementById('bg-music');
    if(music) {
        music.volume = 0.15; 
        music.play();
    }
    
    // PERBAIKAN: Masuk ke dashboard dulu, bukan langsung belajar
    pindahHalaman('dashboard'); 
    suara(`Halo ${namaUser}, ayo pilih permainanmu!`);
}

function pindahHalaman(id) {
    if(isRunning) return; 
    
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    
    // Cek apakah tombol navigasi ada sebelum menghapus class
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('nav-active'));
    
    document.getElementById('page-' + id).classList.remove('hidden');
    
    // Aktifkan tombol nav jika bukan di dashboard
    const navBtn = document.getElementById('nav-' + id);
    if(navBtn) navBtn.classList.add('nav-active');
    
    // Jalankan inisialisasi masing-masing game
    if(id === 'belajar') initBelajar();
    if(id === 'puzzle') typeof initPuzzle === 'function' && initPuzzle(); 
    if(id === 'coding') initCoding();
    if(id === 'hitung') initHitung();
}

function suara(teks) {
    const u = new SpeechSynthesisUtterance(teks);
    u.lang = 'id-ID';
    const music = document.getElementById('bg-music');
    if(music) music.volume = 0.05; 
    window.speechSynthesis.speak(u);
    u.onend = () => { if(music) music.volume = 0.15; };
}

function keluar() { if(confirm("Mau istirahat?")) location.reload(); }

// --- LOGIKA GAME MASTER KODE ---

let cPos = { x: 0, y: 0 };    
let cGoal = { x: 4, y: 4 };   
let cItem = { x: 2, y: 2 };   
let cMeteors = [];            
const gridSize = 54;          

function initCoding() {
    cPos = { x: 0, y: 0 };
    commandQueue = [];
    hasCollectedItem = false;
    isRunning = false;
    
    const runBtn = document.getElementById('run-btn');
    if(runBtn) runBtn.disabled = false;
    
    document.getElementById('command-list').innerHTML = '<span class="text-gray-400 text-xs italic">Sentuh panah untuk isi perintah...</span>';
    document.getElementById('coding-level-text').innerText = `LEVEL ${currentLevel}`;
    
    const itemEl = document.getElementById('coding-item');
    const misiText = document.getElementById('misi-text');
    itemEl.classList.add('hidden');

    let meteorCount = 2;
    if (currentLevel === 1) {
        cGoal = { x: 4, y: 4 };
        meteorCount = 1; // Level 1 dikurangi meteornya supaya mudah
        misiText.innerText = "Misi: Pergi ke Bendera!";
    } else if (currentLevel === 2) {
        cGoal = { x: Math.floor(Math.random()*3)+1, y: 4 };
        meteorCount = 4;
        misiText.innerText = "Misi: Awas Banyak Meteor!";
    } else if (currentLevel === 3) {
        cGoal = { x: 4, y: 0 };
        cItem = { x: 2, y: 2 };
        meteorCount = 5;
        itemEl.classList.remove('hidden');
        itemEl.style.transform = `translate(${cItem.x * gridSize}px, ${cItem.y * gridSize}px)`;
        misiText.innerText = "Misi: Ambil Bintang dulu!";
    }

    const mBox = document.getElementById('meteor-box');
    mBox.innerHTML = ""; 
    cMeteors = [];
    for(let i=0; i<meteorCount; i++) {
        let mX, mY;
        do { 
            mX = Math.floor(Math.random()*5); 
            mY = Math.floor(Math.random()*5); 
        } while(
            (mX === 0 && mY === 0) || 
            (mX === cGoal.x && mY === cGoal.y) || 
            (mX === cItem.x && mY === cItem.y && currentLevel === 3)
        );
        cMeteors.push({x: mX, y: mY});
        const mEl = document.createElement('div');
        mEl.className = "absolute w-10 h-10 flex items-center justify-center text-xl z-10 animate-pulse";
        mEl.style.transform = `translate(${mX * gridSize}px, ${mY * gridSize}px)`;
        mEl.innerText = "☄️"; 
        mBox.appendChild(mEl);
    }
    updateCodingUI();
}

function addCommand(dir) {
    if(isRunning || commandQueue.length >= 12) return;
    commandQueue.push(dir);
    
    const list = document.getElementById('command-list');
    if(commandQueue.length === 1) list.innerHTML = "";
    
    const icons = {up:'⬆️', down:'⬇️', left:'⬅️', right:'➡️'};
    const item = document.createElement('div');
    item.className = "command-icon";
    item.innerText = icons[dir];
    list.appendChild(item);
}

async function runCommands() {
    if(commandQueue.length === 0) return suara("Isi perintah dulu Ndaru");
    isRunning = true;
    document.getElementById('run-btn').disabled = true;
    
    for(let dir of commandQueue) {
        if(dir === 'up' && cPos.y > 0) cPos.y--;
        else if(dir === 'down' && cPos.y < 4) cPos.y++;
        else if(dir === 'left' && cPos.x > 0) cPos.x--;
        else if(dir === 'right' && cPos.x < 4) cPos.x++;
        
        updateCodingUI();

        if(currentLevel === 3 && cPos.x === cItem.x && cPos.y === cItem.y) {
            hasCollectedItem = true;
            document.getElementById('coding-item').classList.add('hidden');
            suara("Bintang didapat!");
        }
        
        if(cMeteors.find(m => m.x === cPos.x && m.y === cPos.y)) {
            suara("Yah, tabrak meteor!");
            await new Promise(r => setTimeout(r, 1000));
            initCoding(); 
            return;
        }
        await new Promise(r => setTimeout(r, 600)); 
    }
    
    if(cPos.x === cGoal.x && cPos.y === cGoal.y) {
        if(currentLevel === 3 && !hasCollectedItem) {
            suara("Aduh, bintangnya lupa!");
            setTimeout(initCoding, 1000);
        } else {
            if(typeof confetti === 'function') confetti();
            suara("Hore berhasil!");
            if(currentLevel < 3) {
                currentLevel++;
                setTimeout(() => { initCoding(); }, 1500);
            } else {
                currentLevel = 1;
                setTimeout(() => { alert("Hebat! Ndaru tamat!"); initCoding(); }, 1500);
            }
        }
    } else {
        suara("Belum sampai!");
        setTimeout(initCoding, 1500);
    }
}

function updateCodingUI() {
    const roket = document.getElementById('sprite-roket');
    const goal = document.getElementById('coding-goal');
    if(roket) roket.style.transform = `translate(${cPos.x * gridSize}px, ${cPos.y * gridSize}px)`;
    if(goal) goal.style.transform = `translate(${cGoal.x * gridSize}px, ${cGoal.y * gridSize}px)`;
}

// --- GAME LAINNYA ---

function initBelajar() {
    const list = document.getElementById('list-belajar');
    if(!list) return;
    list.innerHTML = "";
    dataMateri.forEach(item => {
        const card = document.createElement('div');
        card.className = "card-soft p-10 rounded-[3rem] text-center cursor-pointer";
        card.innerHTML = `<div class="text-7xl mb-4">${item.t}</div><div class="font-bold text-gray-400 text-xs uppercase">${item.k}</div>`;
        card.onclick = () => suara(item.k);
        list.appendChild(card);
    });
}

function initHitung() {
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 4) + 1;
    const benar = n1 + n2;
    document.getElementById('math-num1').innerText = n1;
    document.getElementById('math-num2').innerText = n2;
    const opsiBox = document.getElementById('math-options'); 
    if(!opsiBox) return;
    opsiBox.innerHTML = "";
    let pilihan = [benar, benar + 1, benar - 1, benar + 2].filter(p => p > 0);
    pilihan = [...new Set(pilihan)].sort(() => 0.5 - Math.random());
    
    pilihan.forEach(p => {
        const btn = document.createElement('button');
        btn.className = "card-soft p-8 rounded-3xl text-4xl text-gray-700 font-bold";
        btn.innerText = p;
        btn.onclick = () => {
            if(p === benar) { 
                if(typeof confetti === 'function') confetti();
                skor += 15; 
                document.getElementById('star-count').innerText = skor; 
                suara("Pintar!"); 
                initHitung(); 
            }
            else suara("Coba hitung lagi!");
        };
        opsiBox.appendChild(btn);
    });
}